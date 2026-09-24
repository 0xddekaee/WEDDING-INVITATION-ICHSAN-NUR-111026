const API_BASE = '/api/rsvps';

let currentFilter = 'all';
let currentSort = 'newest';
let currentSearch = '';
let rsvpData = [];

function showLockError(msg) {
  const el = document.getElementById('lockError');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

document.getElementById('unlockBtn').addEventListener('click', () => {
  const token = document.getElementById('adminToken').value.trim();
  if (!token) {
    showLockError('Masukkan token admin terlebih dahulu.');
    return;
  }
  fetch(`${API_BASE}?token=${encodeURIComponent(token)}`)
    .then(r => {
      if (!r.ok) throw new Error('Token salah.');
      localStorage.setItem('admin_token', token);
      document.getElementById('lockScreen').style.display = 'none';
      document.getElementById('adminApp').style.display = 'block';
      loadStats();
      loadRsvps();
    })
    .catch(err => {
      showLockError(err.message);
    });
});

document.getElementById('adminToken').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('unlockBtn').click();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('admin_token');
  window.location.reload();
});

const token = localStorage.getItem('admin_token');
if (token) {
  document.getElementById('lockScreen').style.display = 'none';
  document.getElementById('adminApp').style.display = 'block';
  loadStats();
  loadRsvps();
}

function authHeader() {
  return { headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } };
}

async function loadStats() {
  try {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/stats?token=${encodeURIComponent(token)}`);
    if (!res.ok) throw new Error('Unauthorized');
    const stats = await res.json();
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statHadir').textContent = stats.hadir;
    document.getElementById('statRagu').textContent = stats.masihRagu;
    document.getElementById('statTidak').textContent = stats.tidakHadir;
  } catch (e) {
    showToast('Gagal memuat statistik.', 'error');
  }
}

async function loadRsvps() {
  try {
    const token = localStorage.getItem('admin_token');
    let url = `${API_BASE}?token=${encodeURIComponent(token)}&sort=${currentSort}`;
    if (currentFilter !== 'all') url += `&filter=${encodeURIComponent(currentFilter)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Unauthorized');
    const data = await res.json();
    rsvpData = data;
    renderTable();
  } catch (e) {
    showToast('Gagal memuat data RSVP.', 'error');
  }
}

function renderTable() {
  const tbody = document.getElementById('rsvpTableBody');
  let filtered = rsvpData;
  if (currentSearch) {
    const s = currentSearch.toLowerCase();
    filtered = filtered.filter(r => r.name.toLowerCase().includes(s));
  }
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><div class="empty-table"><i class="fa-solid fa-inbox"></i><p>Tidak ada data RSVP.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map((r, i) => {
    const statusClass = r.status.toLowerCase() === 'hadir' ? 'status-hadir' :
                        r.status.toLowerCase() === 'tidak hadir' ? 'status-tidak' : 'status-ragu';
    const ts = new Date(r.timestamp).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
    return `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${escapeHtml(r.name)}</strong></td>
        <td><span class="status-badge ${statusClass}">${escapeHtml(r.status)}</span></td>
        <td class="wish-cell">
          <span class="wish-preview">${escapeHtml(r.msg).substring(0, 60)}...</span>
          <span class="wish-full">${escapeHtml(r.msg)}</span>
          <button class="btn-action btn-expand" title="Lihat selengkapnya"><i class="fa-solid fa-chevron-down"></i></button>
        </td>
        <td class="time-cell">${ts}</td>
        <td class="text-end">
          <button class="btn-action btn-delete" title="Hapus" onclick="deleteRsvp('${r.id}')"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');
  document.querySelectorAll('.btn-expand').forEach(btn => {
    btn.addEventListener('click', function() {
      const tr = this.closest('tr');
      tr.classList.toggle('show-full');
      this.classList.toggle('active');
      this.innerHTML = tr.classList.contains('show-full') ?
        '<i class="fa-solid fa-chevron-up"></i>' : '<i class="fa-solid fa-chevron-down"></i>';
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

async function deleteRsvp(id) {
  if (!confirm('Hapus RSVP ini?')) return;
  try {
    const res = await fetch(`${API_BASE}/${id}?token=${encodeURIComponent(localStorage.getItem('admin_token'))}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Gagal hapus');
    showToast('RSVP berhasil dihapus.', 'success');
    loadStats();
    loadRsvps();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

document.getElementById('refreshBtn').addEventListener('click', loadRsvps);

document.getElementById('searchBox').addEventListener('input', (e) => {
  currentSearch = e.target.value;
  renderTable();
});

document.getElementById('searchBtn').addEventListener('click', () => {
  currentSearch = document.getElementById('searchBox').value;
  renderTable();
});

document.getElementById('filterStatus').addEventListener('change', (e) => {
  currentFilter = e.target.value;
  loadRsvps();
});

document.getElementById('sortOrder').addEventListener('change', (e) => {
  currentSort = e.target.value;
  loadRsvps();
});

document.getElementById('deleteAllBtn').addEventListener('click', async () => {
  if (!confirm('Hapus SEMUA RSVP? Tindakan ini tidak dapat dibatalkan.')) return;
  try {
    const res = await fetch(`${API_BASE}?token=${encodeURIComponent(localStorage.getItem('admin_token'))}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Gagal');
    showToast('Semua RSVP berhasil dihapus.', 'success');
    loadStats();
    loadRsvps();
  } catch (e) {
    showToast(e.message, 'error');
  }
});

function showToast(msg, type = 'success') {
  const container = document.querySelector('.toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => container.removeChild(toast), 300);
  }, 3000);
}

loadStats();
