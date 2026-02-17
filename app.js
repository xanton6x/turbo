// APP.JS - לוגיקה מרכזית
let currentLang = 'ru', currentCatId = null, currentPostId = null;

// Auth State
auth.onAuthStateChanged(async user => {
    const zone = document.getElementById('auth-zone');
    if (user) {
        const isAdmin = user.uid === ADMIN_UID;
        if (isAdmin) document.getElementById('admin-controls').classList.remove('hidden');
        zone.innerHTML = `<div class="flex items-center gap-3"><div class="w-8 h-8 ${isAdmin ? 'bg-red-500' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white text-xs font-black">${user.email[0].toUpperCase()}</div><button onclick="auth.signOut()" class="text-[10px] text-slate-400 font-bold">LOGOUT</button></div>`;
    } else {
        zone.innerHTML = `<button onclick="openModal('auth-modal')" class="bg-blue-600 text-white px-5 py-2 rounded-full text-[10px] font-black">SIGN IN</button>`;
        document.getElementById('admin-controls').classList.add('hidden');
    }
    loadCategories();
    updateLiveStats();
});

// Navigation
function switchView(id) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-' + id).classList.remove('hidden');
    window.scrollTo(0,0);
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// Data Loading
async function loadCategories() {
    db.collection("categories").orderBy("createdAt", "asc").onSnapshot(snap => {
        const cont = document.getElementById('categories-container');
        const select = document.getElementById('topic-cat-select');
        cont.innerHTML = ''; select.innerHTML = '';
        snap.forEach(doc => {
            const cat = doc.data();
            cont.innerHTML += `<div class="sc-card shadow-md"><div class="bg-slate-50 px-6 py-4 border-b flex justify-between items-center cursor-pointer" onclick="openCategory('${doc.id}', '${cat.name}')"><h3 class="font-black text-slate-600 uppercase tracking-tighter">${cat.name}</h3><span class="text-[10px] font-bold text-slate-300">VIEW ALL</span></div><div id="cat-preview-${doc.id}" class="divide-y text-sm"></div></div>`;
            select.innerHTML += `<option value="${doc.id}">${cat.name}</option>`;
            loadCategoryPreview(doc.id);
        });
    });
}

function loadCategoryPreview(catId) {
    db.collection("posts").where("catId", "==", catId).orderBy("createdAt", "desc").limit(3).onSnapshot(snap => {
        const cont = document.getElementById('cat-preview-' + catId);
        cont.innerHTML = '';
        snap.forEach(doc => {
            const p = doc.data();
            cont.innerHTML += `<div class="p-4 px-6 hover:bg-slate-50 cursor-pointer flex justify-between" onclick="openPost('${doc.id}')"><div><div class="font-bold text-blue-600">${p.title}</div><div class="text-[10px] text-slate-400 uppercase font-black">${p.author.split('@')[0]}</div></div><div class="text-[10px] font-black text-slate-300">${p.views || 0} VIEWS</div></div>`;
        });
    });
}

async function openPost(id) {
    currentPostId = id;
    const doc = await db.collection("posts").doc(id).get();
    const p = doc.data();
    db.collection("posts").doc(id).update({ views: (p.views || 0) + 1 });
    switchView('post');
    document.getElementById('post-content').innerHTML = `<div class="sc-card shadow-md"><div class="p-8"><h1 class="text-3xl font-black mb-6">${p.title}</h1><div class="text-slate-600 leading-relaxed text-lg">${p.content}</div></div></div>`;
    loadComments(id);
}

function loadComments(postId) {
    db.collection("comments").where("postId", "==", postId).orderBy("createdAt", "asc").onSnapshot(snap => {
        const list = document.getElementById('comments-list');
        list.innerHTML = '';
        snap.forEach(doc => {
            const c = doc.data();
            list.innerHTML += `<div class="bg-white p-5 border rounded-xl shadow-sm flex gap-4"><div class="w-10 h-10 bg-blue-50 rounded flex items-center justify-center text-blue-500 font-black">${c.author[0].toUpperCase()}</div><div><div class="text-[10px] font-black text-blue-600 uppercase mb-1">${c.author.split('@')[0]}</div><div class="text-slate-600">${c.text}</div></div></div>`;
        });
    });
}

// Actions
async function handleAuth() {
    const e = document.getElementById('auth-email').value, p = document.getElementById('auth-pass').value;
    try { await auth.signInWithEmailAndPassword(e, p); showToast("Welcome back!"); }
    catch { await auth.createUserWithEmailAndPassword(e, p); await db.collection("users").doc(auth.currentUser.uid).set({ email: e, postsCount: 0 }); showToast("Account created!"); }
    closeModal('auth-modal');
}

async function createTopic() {
    const catId = document.getElementById('topic-cat-select').value, title = document.getElementById('topic-title').value, content = document.getElementById('topic-content').value;
    if (!title || !auth.currentUser) return;
    await db.collection("posts").add({ catId, title, content, author: auth.currentUser.email, uid: auth.currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp(), views: 0 });
    await db.collection("users").doc(auth.currentUser.uid).update({ postsCount: firebase.firestore.FieldValue.increment(1) });
    closeModal('topic-modal');
    showToast("Thread published!");
}

async function addComment() {
    const txt = document.getElementById('comm-input').value;
    if (!txt || !auth.currentUser) return;
    await db.collection("comments").add({ postId: currentPostId, text: txt, author: auth.currentUser.email, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    document.getElementById('comm-input').value = '';
    showToast("Reply posted");
}

function updateLiveStats() {
    db.collection("posts").onSnapshot(snap => document.getElementById('stat-threads').innerText = snap.size);
    db.collection("users").onSnapshot(snap => document.getElementById('stat-users').innerText = snap.size);
}

function showToast(m, type = 'success') {
    const t = document.createElement('div');
    t.className = `toast animate__animated animate__fadeInUp ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    t.innerText = m; document.body.appendChild(t);
    setTimeout(() => { t.classList.replace('animate__fadeInUp', 'animate__fadeOutDown'); setTimeout(() => t.remove(), 500); }, 3000);
}

function changeLang(l) { document.body.classList.toggle('rtl', l === 'he'); }
function handleNewThreadClick() { if(!auth.currentUser) openModal('auth-modal'); else openModal('topic-modal'); }