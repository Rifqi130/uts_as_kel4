const qs = (s) => document.querySelector(s);
const backBtn = qs("#backBtn");

// cek token & role
const stored = localStorage.getItem("user");
const token = localStorage.getItem("token");
if (!token || !stored) {
  sessionStorage.setItem("authRedirectMsg", "Silakan login untuk melihat jadwal");
  window.location.replace("./login.html");
} else {
  const role = JSON.parse(stored).role;
  if (role !== "Mahasiswa" && role !== "Dosen") {
    sessionStorage.setItem("authRedirectMsg", "Hanya Mahasiswa yang dapat melihat jadwal.");
    window.location.replace("./dashboard.html");
  }
}

if (backBtn)
  backBtn.addEventListener("click", () => {
    window.location.href = "./dashboard.html";
  });
