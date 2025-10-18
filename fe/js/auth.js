// js/auth.js — FULL SOLUTION
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  console.log("🔧 auth.js loaded");
  console.log("📄 Current page:", currentPage);
  console.log("🔍 URL params:", window.location.search);
  console.log("💾 Stored user:", localStorage.getItem("user"));

  let userData = null;

  // A. FASE 1: MEMBACA TOKEN DARI URL (Hanya saat callback terjadi)
  if (currentPage.includes("dashboard.html") && params.has("token")) {
    try {
      const email = params.get("email");
      const username = params.get("username");
      const rolesParam = params.get("roles");
      const token = params.get("token");

      console.log("🎯 Processing login data from URL...");

      const roles = JSON.parse(rolesParam || "[]");

      console.log("🎭 ALL ROLES dari Keycloak:", roles);

      // PRIORITAS ROLE: Mahasiswa > Dosen > Tendik
      let primaryRole = "Mahasiswa";

      // Filter role technical
      const filteredRoles = roles.filter(
        (role) =>
          !role.includes("default-") &&
          !role.includes("offline_") &&
          !role.includes("uma_")
      );

      console.log("🎯 Filtered roles:", filteredRoles);

      // Priority selection - case insensitive
      const rolesLower = filteredRoles.map((r) => r.toLowerCase());
      if (rolesLower.includes("mahasiswa")) {
        primaryRole = "Mahasiswa";
      } else if (rolesLower.includes("dosen")) {
        primaryRole = "Dosen";
      } else if (rolesLower.includes("tendik")) {
        primaryRole = "Tendik";
      }

      // Fallback berdasarkan username
      if (username && username.includes("mahasiswa")) primaryRole = "Mahasiswa";
      if (username && username.includes("dosen")) primaryRole = "Dosen";
      if (username && username.includes("tendik")) primaryRole = "Tendik";

      console.log("✅ FINAL ROLE:", primaryRole);

      userData = {
        email: email,
        username: username,
        roles: [primaryRole],
        role: primaryRole,
        token: token,
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Bersihkan URL
      window.history.replaceState({}, document.title, "dashboard.html");

      console.log("💾 Data saved to localStorage");

      // PANGGIL RENDERING LANGSUNG
      console.log("🚀 Calling initDashboard...");
      setTimeout(() => {
        if (typeof initDashboard === "function") {
          initDashboard(userData);
        } else {
          console.error("❌ initDashboard not found, reloading...");
          location.reload();
        }
      }, 100);
    } catch (e) {
      console.error("❌ Gagal memproses data login dari URL:", e);
      localStorage.clear();
      window.location.href = "login.html";
    }
  }

  // B. FASE 2: MEMUAT DATA DARI LOCAL STORAGE
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    userData = JSON.parse(storedUser);
    console.log("👤 User aktif ditemukan di storage:", userData);

    // Render dashboard jika di halaman dashboard
    if (currentPage.includes("dashboard.html")) {
      console.log("🎨 Rendering from localStorage...");
      setTimeout(() => {
        if (typeof initDashboard === "function") {
          initDashboard(userData);
        }
      }, 200);
    }
  } else {
    // C. FASE 3: PROTEKSI (Jika data tidak ada)
    if (currentPage.includes("dashboard.html")) {
      console.warn("🚫 Tidak ada user, redirect ke login");
      window.location.href = "login.html";
      return;
    }
  }
});

// ==================== DASHBOARD RENDERING FUNCTION ====================
function initDashboard(userData) {
  console.log("🎨 initDashboard called with:", userData);

  if (!userData) {
    console.error("❌ initDashboard: userData is null");
    return;
  }

  // Update user info
  const greeting = document.getElementById("greeting");
  const userRoleEl = document.getElementById("userRole");
  const authStatus = document.getElementById("authStatus");

  if (greeting) {
    greeting.textContent = `${userData.username || "User"} (${
      userData.email || "No email"
    })`;
  }

  if (userRoleEl) {
    userRoleEl.textContent = userData.role || "Unknown";
  }

  if (authStatus) {
    authStatus.querySelector("span").textContent = "Connected";
  }

  console.log("✅ Basic UI updated");

  // Menu definitions
  const menus = {
    Mahasiswa: [
      { href: "./dashboard.html", label: "Dashboard" },
      { href: "./jadwal.html", label: "Jadwal Kuliah" },
      { href: "./hasil-studi.html", label: "Hasil Studi" },
      { href: "./pengajuan-krs.html", label: "Pengajuan KRS" },
      { href: "./cetak-krp.html", label: "Cetak KRP" },
    ],
    Dosen: [
      { href: "./dashboard.html", label: "Dashboard" },
      { href: "./jadwal-dosen.html", label: "Jadwal Dosen" },
      { href: "./mahasiswa.html", label: "Daftar Mahasiswa" },
    ],
    Tendik: [
      { href: "./dashboard.html", label: "Dashboard" },
      { href: "./dosen.html", label: "Data Dosen" },
      { href: "./mahasiswa.html", label: "Data Mahasiswa" },
    ],
  };

  // Announcement definitions
  const announcements = {
    Mahasiswa: [
      {
        title: "Perwalian",
        text: "Anda telah melakukan perwalian Semester Gasal 2025/2026",
        date: "23 Juli 2025 07:54",
      },
      {
        title: "Keringanan SKS",
        text: "Anda tidak mengajukan keringanan 6 SKS",
      },
      {
        title: "Tunggakan",
        text: "Tidak ada tunggakan",
      },
    ],
    Dosen: [
      {
        title: "Input Nilai",
        text: "Jangan lupa input nilai sebelum 30 Juli 2025",
      },
      {
        title: "Perwalian",
        text: "Perwalian mahasiswa bimbingan sudah dibuka",
      },
    ],
    Tendik: [
      {
        title: "Update Data",
        text: "Segera update data dosen dan mahasiswa semester ini",
      },
      {
        title: "Pengumuman",
        text: "Rapat tendik diadakan 25 Juli 2025 pukul 09:00",
      },
    ],
  };

  // Academic info definitions
  const academicInfo = {
    Mahasiswa: [
      { label: "Fakultas", value: "Fakultas Teknik Industri" },
      { label: "Program Studi", value: "Teknik Informatika" },
      {
        label: "Dosen Wali",
        value: "Frans Richard Kodong, S.T., M.Kom., Ph.D",
      },
      { label: "IPK", value: "3.85" },
    ],
    Dosen: [
      { label: "Fakultas", value: "Fakultas Teknik Industri" },
      { label: "Program Studi", value: "Teknik Informatika" },
      { label: "NIDN", value: "123456789" },
    ],
    Tendik: [
      { label: "Fakultas", value: "Fakultas Teknik Industri" },
      { label: "Unit Kerja", value: "Bagian Akademik" },
    ],
  };

  // Get current role
  const role = userData?.role || "Mahasiswa";
  console.log("🎭 Rendering untuk role:", role);

  // Render navigation menu
  const navMenu = document.getElementById("navMenu");
  if (navMenu) {
    navMenu.innerHTML = "";
    const menuItems = menus[role] || menus["Mahasiswa"];

    menuItems.forEach((item) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;

      if (window.location.pathname.endsWith(item.href.replace("./", ""))) {
        a.classList.add("active");
      }

      li.appendChild(a);
      navMenu.appendChild(li);
    });
    console.log("✅ Menu rendered with", menuItems.length, "items");
  }

  // Render academic info
  const academicInfoBox = document.getElementById("academicInfoBox");
  if (academicInfoBox) {
    academicInfoBox.innerHTML = "";
    const infoItems = academicInfo[role] || academicInfo["Mahasiswa"];

    infoItems.forEach((item) => {
      const div = document.createElement("div");
      div.innerHTML = `<p><strong>${item.label}</strong></p><p><span>${item.value}</span></p>`;
      academicInfoBox.appendChild(div);
    });
    console.log("✅ Academic info rendered");
  }

  // Render announcements
  const announcementBox = document.getElementById("announcementBox");
  if (announcementBox) {
    announcementBox.innerHTML = "";
    const announcementItems = announcements[role] || announcements["Mahasiswa"];

    announcementItems.forEach((item) => {
      const div = document.createElement("div");
      div.className = "announcement";
      div.innerHTML = `
                <h3>${item.title}</h3>
                <p>${item.text}</p>
                ${item.date ? `<p class='date'>${item.date}</p>` : ""}
            `;
      announcementBox.appendChild(div);
    });
    console.log("✅ Announcements rendered");
  }

  // Setup logout handler
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      console.log("🚪 Logging out...");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "http://localhost:5000/logout";
    });
    console.log("✅ Logout handler setup");
  }

  console.log("🎉 Dashboard rendering completed!");
}

// Fallback: Auto-reload if data exists but UI not updated
setTimeout(() => {
  const storedUser = localStorage.getItem("user");
  const greeting = document.getElementById("greeting");

  if (storedUser && greeting && greeting.textContent === "(belum login)") {
    console.log("🔄 Fallback: Reloading page...");
    location.reload();
  }
}, 1000);
