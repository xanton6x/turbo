// ADMIN.JS - פונקציות ניהול
function checkAdmin() {
    return auth.currentUser && auth.currentUser.uid === ADMIN_UID;
}

async function createCategory() {
    if (!checkAdmin()) return showToast("Permission Denied", "error");
    const name = document.getElementById('new-cat-name').value.trim();
    if (!name) return;

    try {
        await db.collection("categories").add({
            name: name,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('new-cat-name').value = '';
        closeModal('cat-modal');
        showToast("Category created!");
    } catch (e) { showToast("Error creating category", "error"); }
}

async function deletePost(id) {
    if (!checkAdmin()) return;
    if (confirm("Are you sure?")) {
        await db.collection("posts").doc(id).delete();
        showToast("Post deleted");
        switchView('home');
    }
}