const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

const DATA_FILE = path.join(__dirname, 'data', 'wishes.json');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-ichsan-nur-2026';

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/api/rsvps', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const data = readData();
  const filter = req.query.filter;
  let result = data;
  if (filter) {
    result = data.filter(r => r.status.toLowerCase() === filter.toLowerCase());
  }
  if (req.query.sort === 'oldest') {
    result = [...result].reverse();
  } else {
    result = [...result];
  }
  res.json(result);
});

app.get('/api/rsvps/stats', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const data = readData();
  const stats = data.reduce((acc, r) => {
    const s = r.status.toLowerCase();
    if (s === 'hadir') acc.hadir++;
    else if (s === 'tidak hadir') acc.tidakHadir++;
    else acc.masihRagu++;
    acc.total++;
    return acc;
  }, { hadir: 0, tidakHadir: 0, masihRagu: 0, total: 0 });
  res.json(stats);
});

app.post('/api/rsvps', (req, res) => {
  const { name, status, msg } = req.body;
  if (!name || !msg) {
    return res.status(400).json({ error: 'Nama dan ucapan wajib diisi' });
  }
  const data = readData();
  const id = crypto.randomBytes(8).toString('hex');
  const entry = {
    id,
    name: name.trim(),
    status: status || 'Hadir',
    msg: msg.trim(),
    timestamp: new Date().toISOString()
  };
  data.push(entry);
  writeData(data);
  res.status(201).json({ success: true, id });
});

app.delete('/api/rsvps/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const data = readData();
  const idx = data.findIndex(r => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  data.splice(idx, 1);
  writeData(data);
  res.json({ success: true });
});

app.delete('/api/rsvps', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  writeData([]);
  res.json({ success: true, deleted: 'all' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
