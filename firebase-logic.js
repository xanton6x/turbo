import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, getDoc, doc, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- ניהול משתמש בתפריט העליון ---
const authSection = document.getElementById('auth-section');
onAuthStateChanged(auth, (user) => {
    if (authSection) {
        if (user) {
            authSection.innerHTML = `
                <span style="margin-left:15px; font-size:0.9rem;">שלום, ${user.email}</span>
                <button class="btn-gold" id="logout-btn">התנתק</button>
            `;
            document.getElementById('logout-btn').onclick = () => signOut(auth);
            if (document.getElementById('reply-section')) document.getElementById('reply-section').style.display = 'block';
        } else {
            authSection.innerHTML = `<button class="btn-gold" onclick="location.href='login.html'">התחברות / הרשמה</button>`;
        }
    }
});

// --- הצגת נושא ותגובות (view-topic.html) ---
async function loadFullTopic() {
    const params = new URLSearchParams(window.location.search);
    const topicId = params.get('id');
    if (!topicId) return;

    // טעינת הפוסט המקורי
    const docRef = doc(db, "topics", topicId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('topic-title').innerText = data.title;
        document.getElementById('topic-author').innerText = `פורסם על ידי ${data.authorName} בתאריך ${new Date(data.createdAt.seconds * 1000).toLocaleDateString()}`;
        document.getElementById('topic-text').innerText = data.content;
    }

    // טעינת תגובות
    const q = query(collection(db, "replies"), where("topicId", "==", topicId), orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    const repliesList = document.getElementById('replies-list');
    repliesList.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const reply = doc.data();
        repliesList.innerHTML += `
            <div class="category-block" style="padding: 15px; margin-bottom: 10px; border-right: 4px solid var(--gold);">
                <p style="margin: 0; font-size: 0.85rem; color: #888;">${reply.authorName} כתב/ה:</p>
                <p style="margin: 10px 0 0;">${reply.content}</p>
            </div>
        `;
    });
}

// שליחת תגובה
const sendReplyBtn = document.getElementById('send-reply');
if (sendReplyBtn) {
    sendReplyBtn.onclick = async () => {
        const content = document.getElementById('reply-content').value;
        const topicId = new URLSearchParams(window.location.search).get('id');
        if (content && auth.currentUser) {
            await addDoc(collection(db, "replies"), {
                topicId,
                content,
                authorId: auth.currentUser.uid,
                authorName: auth.currentUser.email,
                createdAt: new Date()
            });
            location.reload();
        }
    };
}

// הרצת פונקציות לפי הדף הנוכחי
if (window.location.pathname.includes('view-topic.html')) loadFullTopic();
// (כאן אמורה להיות גם פונקציית loadTopics ששלחתי לך קודם עבור topics.html)
// הוסף את המשתנה הזה בראש הקובץ
const ADMIN_EMAIL = "toha400@gmail.com";

// פונקציה לבדיקה אם המשתמש הוא אדמין
function isAdmin() {
    return auth.currentUser && auth.currentUser.email === ADMIN_EMAIL;
}

// עדכון פונקציית טעינת התגובות בתוך loadFullTopic
// בתוך הלופ שיוצר את ה-HTML של התגובות (repliesList.innerHTML), הוסף כפתור מחיקה:
querySnapshot.forEach((docSnap) => {
    const reply = docSnap.data();
    const deleteBtn = isAdmin() ? `<button onclick="deleteDocData('replies', '${docSnap.id}')" class="btn-delete">מחק תגובה</button>` : "";
    
    repliesList.innerHTML += `
        <div class="category-block" style="padding: 15px; margin-bottom: 10px; border-right: 4px solid var(--gold);">
            <div style="display:flex; justify-content:space-between;">
                <p style="margin: 0; font-size: 0.85rem; color: #888;">${reply.authorName} כתב/ה:</p>
                ${deleteBtn}
            </div>
            <p style="margin: 10px 0 0;">${reply.content}</p>
        </div>
    `;
});

// פונקציית מחיקה גלובלית (רק לאדמין)
window.deleteDocData = async (collectionName, docId) => {
    if (!isAdmin()) return alert("אין לך הרשאות מנהל!");
    if (confirm("האם אתה בטוח שברצונך למחוק?")) {
        try {
            import { deleteDoc, doc as firestoreDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
            await deleteDoc(firestoreDoc(db, collectionName, docId));
            location.reload();
        } catch (e) {
            alert("שגיאה במחיקה: " + e.message);
        }
    }
};