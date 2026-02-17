import React, { useState } from 'react';
import { auth, db } from '../firebase-config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Register() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. יצירת המשתמש ב-Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. עדכון שם המשתמש בפרופיל
      await updateProfile(user, { displayName: displayName });

      // 3. שמירת המשתמש ב-Database (Firestore) לניהול עתידי
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: displayName,
        email: email,
        role: "user", // הגדרת תפקיד ברירת מחדל
        createdAt: new Date()
      });

      console.log("User registered successfully!");
      navigate('/'); // חזרה לדף הבית לאחר הרשמה
    } catch (error) {
      console.error("Error during registration:", error.message);
      alert(t('registration_error') || "Registration failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>{t('register')}</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>{t('username') || "Username"}</label>
            <input 
              type="text" 
              placeholder="Enter your name" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>{t('email') || "Email"}</label>
            <input 
              type="email" 
              placeholder="example@mail.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>{t('password') || "Password"}</label>
            <input 
              type="password" 
              placeholder="Min 6 characters" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn-gold" disabled={loading}>
            {loading ? "..." : t('register')}
          </button>
        </form>

        <p className="auth-switch">
          {t('already_have_account') || "Already have an account?"} <Link to="/login">{t('login')}</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;