const apiBase = "http://localhost:3000/api/v1/auth";
const qs = (s) => document.querySelector(s);

const listMsg = qs('#listMsg');
const listData = qs('#listData');
const backBtn = qs('#backBtn');

// tentukan endpoint berdasarkan pathname
const path = location.pathname;
let endpoint = null;
if (path.endsWith('/fe/dosen.html')) endpoint = '/list/dosen';
if (path.endsWith('/fe/mahasiswa.html')) endpoint = '/list/mahasiswa';

async function load() {
  const token = localStorage.getItem('token');
  if (!token) {
    sessionStorage.setItem('authRedirectMsg', 'Silakan login terlebih dahulu.');
    window.location.replace('http://127.0.0.1:5500/fe/login.html');
    return;
  }

  if (!endpoint) {
    listMsg.textContent = 'Endpoint tidak diketahui';
    return;
  }

  try {
    const res = await fetch(apiBase + endpoint, { headers: { Authorization: `Bearer ${token}` } });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Gagal');
    const items = body.data || [];
    listMsg.textContent = `Menampilkan ${items.length} entri`;
    listData.innerHTML = items.map(i => `<li>${i.fullName} — ${i.username} — ${i.email} — (${i.role})</li>`).join('');
  } catch (err) {
    listMsg.textContent = 'Error: ' + err.message;
  }
}

if (backBtn) backBtn.addEventListener('click', () => {
  window.location.href = '/fe/profile.html';
});

load();
