// CONFIG.JS - הגדרות ליבה
const firebaseConfig = {
     apiKey: "AIzaSyDiCZR0dPnvjcxajI6fswQot0z4SSMiDI0",
  authDomain: "turbo-f5f6d.firebaseapp.com",
  databaseURL: "https://turbo-f5f6d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "turbo-f5f6d",
  storageBucket: "turbo-f5f6d.firebasestorage.app",
  messagingSenderId: "778985009405",
  appId: "1:778985009405:web:85b798b9c97d581822ce94"
};

// ה-UID שלך כדי לקבל גישת אדמין
const ADMIN_UID = "YOUR_ADMIN_UID_HERE"; 

// אתחול
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();