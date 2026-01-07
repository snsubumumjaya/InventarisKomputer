import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const el = (id) => document.getElementById(id);

const notice = el("notice");

const tabLogin = el("tabLogin");
const tabRegister = el("tabRegister");
const panelLogin = el("panelLogin");
const panelRegister = el("panelRegister");

const loginEmail = el("loginEmail");
const loginPassword = el("loginPassword");
const btnLogin = el("btnLogin");
const btnLogout = el("btnLogout");
const authStatus = el("authStatus");

const regEmail = el("regEmail");
const regPassword = el("regPassword");
const regPassword2 = el("regPassword2");
const btnRegister = el("btnRegister");
const regStatus = el("regStatus");

const uidBox = el("uidBox");
const uidText = el("uidText");
const btnCopyUid = el("btnCopyUid");

function showTab(which) {
  const isLogin = which === "login";
  panelLogin.hidden = !isLogin;
  panelRegister.hidden = isLogin;

  tabLogin.style.borderColor = isLogin ? "rgba(122,162,255,0.55)" : "rgba(255,255,255,0.10)";
  tabRegister.style.borderColor = !isLogin ? "rgba(122,162,255,0.55)" : "rgba(255,255,255,0.10)";
}

function getReason() {
  const url = new URL(window.location.href);
  return url.searchParams.get("reason") || "";
}

tabLogin.addEventListener("click", () => showTab("login"));
tabRegister.addEventListener("click", () => showTab("register"));

btnLogin.addEventListener("click", async () => {
  authStatus.textContent = "Logging in...";
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value.trim(), loginPassword.value);
    authStatus.textContent = "Login OK. Mengalihkan...";
    location.href = "./index.html";
  } catch (e) {
    console.error(e);
    authStatus.textContent = `Login gagal: ${e?.message || e}`;
  }
});

btnLogout.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error(e);
  }
});

btnRegister.addEventListener("click", async () => {
  regStatus.textContent = "";
  uidBox.hidden = true;

  const em = regEmail.value.trim();
  const p1 = regPassword.value;
  const p2 = regPassword2.value;

  if (!em) {
    regStatus.textContent = "Email wajib diisi.";
    return;
  }
  if (!p1 || p1.length < 6) {
    regStatus.textContent = "Password minimal 6 karakter.";
    return;
  }
  if (p1 !== p2) {
    regStatus.textContent = "Ulangi password tidak sama.";
    return;
  }

  regStatus.textContent = "Membuat akun...";
  try {
    const cred = await createUserWithEmailAndPassword(auth, em, p1);
    regStatus.textContent = "Akun berhasil dibuat.";

    uidText.textContent = cred.user.uid;
    uidBox.hidden = false;
  } catch (e) {
    console.error(e);
    regStatus.textContent = `Register gagal: ${e?.message || e}`;
  }
});

btnCopyUid.addEventListener("click", async () => {
  const text = uidText.textContent || "";
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    btnCopyUid.textContent = "Copied";
    setTimeout(() => (btnCopyUid.textContent = "Copy"), 900);
  } catch {
    alert("Tidak bisa copy otomatis. Silakan blok UID lalu copy manual.");
  }
});

onAuthStateChanged(auth, (u) => {
  const loggedIn = !!u;
  btnLogout.disabled = !loggedIn;

  const reason = getReason();
  if (reason === "noaccess") {
    notice.textContent = "Akun kamu belum diberi akses (belum terdaftar sebagai staff/admin). Silakan kirim UID ke admin.";
  } else {
    notice.textContent = "";
  }

  if (loggedIn) {
    authStatus.textContent = `Login sebagai: ${u.email || u.uid}`;

    // tampilkan UID jika ada kasus noaccess atau ada pending_uid
    const pending = sessionStorage.getItem("pending_uid");
    const uidToShow = pending || u.uid;

    uidText.textContent = uidToShow;
    uidBox.hidden = false;
  } else {
    authStatus.textContent = "Belum login.";
    uidBox.hidden = true;
  }
});

// default tab
showTab("login");
