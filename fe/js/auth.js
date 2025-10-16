// frontend simple untuk register, login, profile
// use full backend URL when serving frontend from a different origin (e.g. Live Server)
const apiBase = "http://localhost:3000/api/v1/auth";

const qs = (s) => document.querySelector(s);
const qsa = (s) => document.querySelectorAll(s);

// helper pesan
function showMsg(text, isError = false) {
  const msg = qs("#msg");
  if (!msg) return;
  msg.textContent = text;
  msg.className = isError ? "msg error" : "msg success";
  setTimeout(() => {
    msg.textContent = "";
    msg.className = "";
  }, 4000);
}

// register
const registerForm = qs("#registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(registerForm);
    const data = Object.fromEntries(form.entries());
    try {
      const res = await fetch(apiBase + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Register gagal");
      showMsg("Register berhasil. Silakan login.");
      setTimeout(() => (window.location = "login.html"), 1000);
    } catch (err) {
      showMsg(err.message, true);
    }
  });
}

// login
const loginForm = qs("#loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(loginForm);
    const data = Object.fromEntries(form.entries());
    try {
      const res = await fetch(apiBase + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Login gagal");
      // simpan token di localStorage
      localStorage.setItem("token", body.token);
      localStorage.setItem("user", JSON.stringify({ fullName: body.fullName, username: body.username, role: body.role }));
      showMsg("Login berhasil.");
      setTimeout(() => (window.location = "profile.html"), 800);
    } catch (err) {
      showMsg(err.message, true);
    }
  });
}

// profile
const profileBox = qs("#profileBox");
if (profileBox) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const greeting = qs("#greeting");
  const userRaw = qs("#userRaw");
  const authStatus = qs("#authStatus");
  const logoutBtn = qs("#logoutBtn");
  const dashMahasiswa = qs("#dashMahasiswa");
  const dashDosen = qs("#dashDosen");
  const dashTendik = qs("#dashTendik");
  const roleDash = qs("#roleDash");

  if (!token) {
    greeting.textContent = "(belum login)";
    userRaw.textContent = "";
  } else {
    (async () => {
      try {
        // cek koneksi ke endpoint /me dengan token
        const res = await fetch(apiBase + "/me", { headers: { Authorization: `Bearer ${token}` } });
        if (authStatus) authStatus.querySelector("span").textContent = `Checking...`;
        if (!res.ok) {
          // tampilkan status koneksi jika server merespon namun token invalid
          if (authStatus) authStatus.querySelector("span").textContent = `Disconnected (status ${res.status})`;
          throw new Error("Token tidak valid");
        }
        const body = await res.json();
        greeting.textContent = `Hi, ${body.user.fullName} (role: ${body.user.role})`;
        userRaw.textContent = JSON.stringify(body.user, null, 2);
        // tampilkan dashboard sesuai role (static demo)
        const role = body.user.role;
        if (roleDash) roleDash.style.display = "block";
        if (dashMahasiswa) dashMahasiswa.style.display = role === "Mahasiswa" ? "block" : "none";
        if (dashDosen) dashDosen.style.display = role === "Dosen" ? "block" : "none";
        if (dashTendik) dashTendik.style.display = role === "Tendik" ? "block" : "none";
        if (authStatus) authStatus.querySelector("span").textContent = `Connected (status ${res.status})`;
      } catch (err) {
        greeting.textContent = "(token invalid or expired)";
        userRaw.textContent = "";
        if (authStatus && authStatus.querySelector("span").textContent.indexOf("Connected") === -1) {
          authStatus.querySelector("span").textContent = `Disconnected (${err.message})`;
        }
      }
    })();
  }

  if (logoutBtn)
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect ke halaman login (Live Server)
      window.location.href = "login.html";
    });
  // handler action demo: tampilkan pesan sesuai hak akses
  const actionButtons = roleDash ? roleDash.querySelectorAll("button[data-action]") : [];
  actionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      const stored = localStorage.getItem("user");
      const currentRole = stored ? JSON.parse(stored).role : null;
      // mapping aksi yang diizinkan per role (static)
      const allowed = {
        "view-schedule": ["Mahasiswa"],
        "view-grades": ["Mahasiswa"],
        "fill-krs": ["Mahasiswa"],
        "input-grades": ["Dosen"],
        "list-students": ["Dosen"],
        "manage-dosen": ["Tendik"],
        "manage-mahasiswa": ["Tendik"],
      };
      const ok = allowed[action] && allowed[action].includes(currentRole);
      showMsg(ok ? "Aksi berhasil: " + action : "Forbidden: Anda tidak punya hak untuk aksi ini", !ok);
    });
  });
  // tombol navigasi ke list (data-href)
  const navButtons = roleDash ? roleDash.querySelectorAll("button[data-href]") : [];
  navButtons.forEach((b) => {
    b.addEventListener("click", () => {
      const href = b.getAttribute("data-href");
      const stored = localStorage.getItem("user");
      const currentRole = stored ? JSON.parse(stored).role : null;
      // simple client-side check untuk akses halaman
      // use href as-is: it can be absolute ("/fe/...") or relative ("jadwal-dosen.html")
      if (href.endsWith("dosen.html") && currentRole !== "Tendik") {
        showMsg("Forbidden: Hanya Tendik yang dapat melihat data dosen", true);
        return;
      }
      if (href.endsWith("mahasiswa.html") && !["Tendik", "Dosen"].includes(currentRole)) {
        showMsg("Forbidden: Hanya Tendik atau Dosen yang dapat melihat data mahasiswa", true);
        return;
      }
      if (href.endsWith("jadwal.html") && currentRole !== "Mahasiswa") {
        showMsg("Forbidden: Halaman ini khusus untuk Mahasiswa", true);
        return;
      }
      if (href.endsWith("jadwal-dosen.html") && currentRole !== "Dosen") {
        showMsg("Forbidden: Halaman ini khusus untuk Dosen", true);
        return;
      }
      // navigasi - set location to the provided href (absolute or relative)
      window.location.href = href;
    });
  });
}
