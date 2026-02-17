import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore(app);
const ADMIN_EMAIL = "anton@rcc.co.il";

// --- ניהול משתמש וניהול אדמין ---
onAuthStateChanged(auth, (user) => {
    const authSection = document.getElementById('auth-section');
    if (authSection) {
        if (user) {
            authSection.innerHTML = `<span>${user.email}</span> <button class="btn-gold" id="logout-btn">התנתק</button>`;
            document.getElementById('logout-btn').onclick = () => signOut(auth).then(() => location.reload());
            if (user.email === ADMIN_EMAIL && document.getElementById('admin-add-cat')) {
                document.getElementById('admin-add-cat').style.display = 'block';
            }
            if (document.getElementById('new-topic-btn')) document.getElementById('new-topic-btn').style.display = 'block';
        } else {
            authSection.innerHTML = `<button class="btn-gold" onclick="location.href='login.html'">התחברות</button>`;
        }
    }
});

// --- פונקציית טעינת קטגוריות (index.html) ---
async function loadCategories() {
    const list = document.getElementById('categories-list');
    if (!list) return;
    const q = query(collection(db, "categories"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    list.innerHTML = "";
    snap.forEach(d => {
        const cat = d.data();
        list.innerHTML += `
            <div class="category-block">
                <div class="cat-header" onclick="location.href='topics.html?cat=${d.id}'">${cat.name}</div>
                <div class="forum-row"><p>${cat.description}</p></div>
            </div>`;
    });
}

// --- פונקציית טעינת נושאים (topics.html) ---
async function loadTopics() {
    const list = document.getElementById('topics-list');
    const catId = new URLSearchParams(window.location.search).get('cat');
    if (!list || !catId) return;

    const q = query(collection(db, "topics"), where("categoryId", "==", catId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    list.innerHTML = "";
    snap.forEach(d => {
        const t = d.data();
        list.innerHTML += `
            <div class="forum-row" onclick="location.href='view-topic.html?id=${d.id}'">
                <div class="forum-info"><h3>${t.title}</h3><p>מאת: ${t.authorName}</p></div>
                <div>${new Date(t.createdAt.seconds * 1000).toLocaleDateString()}</div>
            </div>`;
    });
}

// --- אירועי לחיצה לשמירה ---
if (document.getElementById('save-cat-btn')) {
    document.getElementById('save-cat-btn').onclick = async () => {
        const name = document.getElementById('new-cat-name').value;
        const desc = document.getElementById('new-cat-desc').value;
        await addDoc(collection(db, "categories"), { name, description: desc, createdAt: new Date() });
        location.reload();
    };
}

if (document.getElementById('save-topic-btn')) {
    document.getElementById('save-topic-btn').onclick = async () => {
        const title = document.getElementById('topic-title-input').value;
        const content = document.getElementById('topic-content-input').value;
        const catId = new URLSearchParams(window.location.search).get('cat');
        await addDoc(collection(db, "topics"), { 
            title, content, categoryId: catId, 
            authorName: auth.currentUser.email, createdAt: new Date() 
        });
        location.reload();
    };
}

// הפעלה לפי דף
if (window.location.pathname.includes('index.html')) loadCategories();
if (window.location.pathname.includes('topics.html')) loadTopics();