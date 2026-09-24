# Undangan Pernikahan — Ichsan & Nur

## Struktur File
```
index.html          -> struktur halaman (HTML)
css/style.css        -> semua styling (warna, font, animasi)
js/main.js           -> logika interaktif (gerbang buka, hitung mundur, form ucapan, confetti)
server.js            -> backend Express (REST API RSVP)
package.json         -> dependensi Node.js
data/wishes.json     -> penyimpanan RSVP (JSON)
admin/               -> dashboard admin RSVP
  index.html         -> halaman dashboard admin
  style.css          -> styling dashboard admin
  app.js             -> logika dashboard admin (fetch API, filter, hapus)
assets/images/        -> taruh foto-foto Anda di sini
```

## Cara membuka
Jalankan backend server, lalu buka di browser:

```bash
npm install      # satu kali saja
npm start        # atau: node server.js
```

Buka di browser: http://localhost:3000

Untuk mengakses dashboard admin RSVP: http://localhost:3000/admin
- Token default: `admin-ichsan-nur-2026`
- Ganti lewat env var: `ADMIN_TOKEN="password-anda" npm start`

## Bagian yang perlu diedit

1. **Foto mempelai & galeri** — cari `src="https://images.unsplash.com/..."` di `index.html`,
   ganti dengan foto Anda sendiri. Taruh file foto di `assets/images/` lalu tulis misalnya
   `src="assets/images/ichsan.jpg"`.
2. **Nama orang tua** — cari teks `Ganti dengan nama lengkap orang tua...` di bagian Mempelai.
3. **Alamat lengkap venue akad & resepsi** — cari class `.venue` di bagian Save The Date.
4. **Lokasi peta** — cari `#location` di `index.html`, ganti query pada URL Google Maps
   (`https://www.google.com/maps?q=Bekasi,+Jawa+Barat&output=embed`) dengan alamat lengkap.
5. **Nomor rekening / amplop digital** — cari `id="accNum"` di bagian Amplop Digital.
6. **Warna & font** — semua warna dan font diatur lewat variabel CSS di bagian paling atas
   `css/style.css` (`:root { --maroon-deep: ...; --gold: ...; }`), jadi cukup ubah di satu tempat.
7. **Tanggal countdown** — cari `weddingDate` di `js/main.js` jika tanggal berubah.

## Nama tamu otomatis
Bagikan link dengan parameter `?to=Nama+Tamu`, contoh:
`index.html?to=Budi+Santoso` akan menampilkan "Kepada Yth. Budi Santoso" di halaman sampul.
