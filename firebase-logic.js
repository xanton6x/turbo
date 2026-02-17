import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDiCZR0dPnvjcxajI6fswQot0z4SSMiDI0",
  authDomain: "turbo-f5f6d.firebaseapp.com",
  projectId: "turbo-f5f6d",
  storageBucket: "turbo-f5f6d.firebasestorage.app",
  messagingSenderId: "778985009405",
  appId: "1:778985009405:web:85b798b9c97d581822ce94"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// זיהוי משתמש בדף הבית
const authSection = document.getElementById('auth-section');
if (authSection) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            authSection.innerHTML = `
                <span style="margin-left:10px;">שלום, ${user.email}</span>
                <button class="btn-gold" id="logout-btn">התנתק</button>
            `;
            document.getElementById('logout-btn').onclick = () => signOut(auth);
        }
    });
}

// לוגיקה של דף התחברות
const authForm = document.getElementById('auth-form');
let isLoginMode = true;

window.toggleAuth = () => {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? "התחברות" : "הרשמה";
    document.getElementById('submit-btn').innerText = isLoginMode ? "כניסה" : "צור חשבון";
    document.getElementById('toggle-text').innerText = isLoginMode ? "אין לך חשבון? הרשם כאן" : "כבר יש לך חשבון? התחבר כאן";
};

if (authForm) {
    authForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, pass);
            } else {
                await createUserWithEmailAndPassword(auth, email, pass);
            }
            window.location.href = 'index.html';
        } catch (err) {
            alert("שגיאה: " + err.message);
        }
    };
}
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore(app);

// פונקציה למשיכת נושאים לפי קטגוריה
async function loadTopics() {
    const urlParams = new URLSearchParams(window.location.search);
    const catId = urlParams.get('cat');
    if (!catId) return;

    const q = query(collection(db, "topics"), where("categoryId", "==", catId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const list = document.getElementById('topics-list');
    list.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.innerHTML += `
            <div class="forum-row" onclick="location.href='view-topic.html?id=${doc.id}'">
                <div class="forum-info">
                    <h3>${data.title}</h3>
                    <p>פורסם ע"י: ${data.authorName}</p>
                </div>
                <div class="forum-meta">${new Date(data.createdAt.seconds * 1000).toLocaleDateString()}</div>
            </div>
        `;
    });
}

// כפתור נושא חדש - הצגה רק למחוברים
onAuthStateChanged(auth, (user) => {
    if (user && document.getElementById('new-topic-btn')) {
        document.getElementById('new-topic-btn').style.display = 'block';
        document.getElementById('new-topic-btn').onclick = () => {
            document.getElementById('topic-modal').style.display = 'flex';
        };
    }
});

// שמירת נושא חדש
const saveBtn = document.getElementById('save-topic');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const user = auth.currentUser;
        const title = document.getElementById('topic-subject').value;
        const content = document.getElementById('topic-content').value;
        const catId = new URLSearchParams(window.location.search).get('cat');

        if (title && content) {
            await addDoc(collection(db, "topics"), {
                title,
                content,
                categoryId: catId,
                authorId: user.uid,
                authorName: user.email,
                createdAt: new Date()
            });
            location.reload();
        }
    };
}

if (window.location.pathname.includes('topics.html')) loadTopics();