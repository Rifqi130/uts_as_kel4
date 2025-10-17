// gunakan apiBase dari global jika sudah ada
// gunakan qs dari global jika sudah ada

const listMsg = qs("#listMsg");
const listData = qs("#listData");
const backBtn = qs("#backBtn");
const navMenu = qs("#navMenu");

// Init sidebar menu
function initSidebar() {
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  if (!user) return;

  const role = user.role;
  const menuItems = [];

  menuItems.push(`<li><a href="dashboard.html">Dashboard</a></li>`);
  
  if (role === "Mahasiswa") {
    menuItems.push(`<li><a href="jadwal.html">Jadwal Kuliah</a></li>`);
  }
  if (role === "Dosen") {
    menuItems.push(`<li><a href="jadwal-dosen.html">Jadwal Mengajar</a></li>`);
    menuItems.push(`<li><a href="mahasiswa.html">Daftar Mahasiswa</a></li>`);
  }
  if (role === "Tendik") {
    menuItems.push(`<li><a href="mahasiswa.html">Daftar Mahasiswa</a></li>`);
    menuItems.push(`<li><a href="dosen.html">Daftar Dosen</a></li>`);
  }

  menuItems.push(`<li><a href="profile.html">Profile</a></li>`);
  navMenu.innerHTML = menuItems.join("");

  // Set active menu
  const currentPath = location.pathname;
  const activeLink = navMenu.querySelector(`a[href="${currentPath.split("/").pop()}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }
}

// tentukan endpoint berdasarkan pathname
const path = location.pathname;
let endpoint = null;
if (path.endsWith("dosen.html")) endpoint = "/list/dosen";
if (path.endsWith("mahasiswa.html")) endpoint = "/list/mahasiswa";

async function load() {
  const token = localStorage.getItem("token");
  if (!token) {
    sessionStorage.setItem("authRedirectMsg", "Silakan login terlebih dahulu.");
    window.location.replace("login.html");
    return;
  }

  if (!endpoint) {
    listMsg.textContent = "Endpoint tidak diketahui";
    return;
  }

  try {
    console.log("Memanggil endpoint:", apiBase + endpoint);
    const res = await fetch(apiBase + endpoint, { headers: { Authorization: `Bearer ${token}` } });
    const body = await res.json();
    console.log("Response:", body);
    if (!res.ok) throw new Error(body.message || "Gagal");
    const items = body.data || [];
    if (items.length === 0) {
      listMsg.textContent = "Tidak ada data mahasiswa.";
      listData.innerHTML = "";
    } else {
      listMsg.textContent = `Menampilkan ${items.length} entri`;
      listData.innerHTML = items.map((i) => `<li>${i.fullName} — ${i.username} — ${i.email} — (${i.role})</li>`).join("");
    }
  } catch (err) {
    listMsg.textContent = "Error: " + err.message;
    console.error("List error:", err);
  }
}

// Initialize sidebar menu and load data
initSidebar();
load();
