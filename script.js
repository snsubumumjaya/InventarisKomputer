// Firebase Config
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGyH-yVAgQU4iJ1tIz3cpWiWa65BdMsJ8",
  authDomain: "inventariskomputer.firebaseapp.com",
  databaseURL: "https://inventariskomputer-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "inventariskomputer",
  storageBucket: "inventariskomputer.firebasestorage.app",
  messagingSenderId: "915927761008",
  appId: "1:915927761008:web:a4b2e71159d00501fdf4b5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let role = 'staff';
let editingKey = null;

// === AUTH FUNCTIONS ===
window.login = async () => {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    window.location.href = "dashboard.html";
  } catch (e) {
    document.getElementById('msg').innerText = "Login gagal: " + e.message;
  }
};

window.register = async () => {
  const nama = document.getElementById('nama').value;
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await set(ref(db, 'users/' + cred.user.uid), {
      nama, email, role: 'staff', createdAt: new Date().toISOString()
    });
    document.getElementById('msg').innerText = "Register sukses! Silakan login.";
    setTimeout(() => location.href = "login.html", 2000);
  } catch (e) {
    document.getElementById('msg').innerText = e.message;
  }
};

window.logout = async () => {
  await signOut(auth);
  location.href = "login.html";
};

// === DASHBOARD ONLY ===
if (location.pathname.includes('dashboard.html')) {
  onAuthStateChanged(auth, user => {
    if (!user) return location.href = "login.html";

    // Ambil role user
    onValue(ref(db, 'users/' + user.uid), snap => {
      if (snap.exists()) {
        const data = snap.val();
        role = data.role || 'staff';
        document.getElementById('userInfo').innerText = `${data.nama} (${role.toUpperCase()})`;

        if (role === 'admin') {
          document.getElementById('adminOnly').style.display = 'block';
          document.getElementById('aksiHeader').style.display = 'table-cell';
        }
      }
    });

    // Load data inventaris
    onValue(ref(db, 'inventaris'), snap => {
      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = '';
      if (!snap.exists()) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Belum ada data</td></tr>';
        return;
      }
      snap.forEach(child => {
        const item = child.val();
        const key = child.key;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${item.kode}</td>
          <td>${item.merk}</td>
          <td>${item.tipe}</td>
          <td>${item.lokasi}</td>
          <td><span class="status-${item.status.toLowerCase()}">${item.status}</span></td>
          <td style="display:${role==='admin'?'table-cell':'none'}">
            <button class="btn-edit" onclick="editItem('${key}',${JSON.stringify(item)})">Edit</button>
            <button class="btn-delete" onclick="deleteItem('${key}')">Hapus</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    });
  });
}

// === CRUD FUNCTIONS ===
window.showForm = () => {
  if (role !== 'admin') return alert('Hanya admin!');
  editingKey = null;
  document.getElementById('formTitle').innerText = "Tambah Komputer";
  document.getElementById('formInput').style.display = 'block';
  ['kode','merk','tipe','lokasi','status'].forEach(id => document.getElementById(id).value = '');
};

window.editItem = (key, item) => {
  editingKey = key;
  document.getElementById('formTitle').innerText = "Edit Komputer";
  document.getElementById('formInput').style.display = 'block';
  document.getElementById('kode').value = item.kode;
  document.getElementById('merk').value = item.merk;
  document.getElementById('tipe').value = item.tipe;
  document.getElementById('lokasi').value = item.lokasi;
  document.getElementById('status').value = item.status;
};

window.cancelForm = () => {
  editingKey = null;
  document.getElementById('formInput').style.display = 'none';
};

window.saveData = async () => {
  if (role !== 'admin') return;
  const data = {
    kode: document.getElementById('kode').value,
    merk: document.getElementById('merk').value,
    tipe: document.getElementById('tipe').value,
    lokasi: document.getElementById('lokasi').value,
    status: document.getElementById('status').value,
  };
  const key = editingKey || Date.now().toString();
  await set(ref(db, 'inventaris/' + key), data);
  cancelForm();
};

window.deleteItem = async (key) => {
  if (role !== 'admin') return;
  if (confirm('Yakin hapus data ini?')) {
    await remove(ref(db, 'inventaris/' + key));
  }
};
