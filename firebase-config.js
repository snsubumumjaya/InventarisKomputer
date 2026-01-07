// firebase-config.js
// Konfigurasi Firebase (bisa publik; keamanan tetap harus lewat Firebase Auth + Security Rules)

export const firebaseConfig = {
  apiKey: "AIzaSyCGyH-yVAgQU4iJ1tIz3cpWiWa65BdMsJ8",
  authDomain: "inventariskomputer.firebaseapp.com",
  projectId: "inventariskomputer",
  storageBucket: "inventariskomputer.firebasestorage.app",
  messagingSenderId: "915927761008",
  appId: "1:915927761008:web:a4b2e71159d00501fdf4b5",

  // Realtime Database URL (wajib untuk RTDB)
  databaseURL: "https://inventariskomputer-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
