import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase-config';
import './App.css';
import './i18n';

// Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    document.body.dir = t('dir');
    return () => unsub();
  }, [t]);

  return (
    <Router>
      <div className="app-wrapper">
        <header className="main-header">
          <div className="container header-flex">
            <Link to="/" className="logo">FORUM<span>COMMUNITY</span></Link>
            
            <nav className="nav-links">
              <div className="lang-btns">
                <button onClick={() => i18n.changeLanguage('en')}>EN</button>
                <button onClick={() => i18n.changeLanguage('ru')}>RU</button>
                <button onClick={() => i18n.changeLanguage('he')}>HE</button>
              </div>

              {user ? (
                <div className="user-nav">
                  <span>{user.email}</span>
                  <button className="btn-secondary" onClick={() => signOut(auth)}>{t('logout')}</button>
                </div>
              ) : (
                <div className="auth-links">
                  <Link to="/login">{t('login')}</Link>
                  <Link to="/register" className="btn-gold">{t('register')}</Link>
                </div>
              )}
            </nav>
          </div>
        </header>

        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;