# PROMPT UNTUK ANTIGRAVITY
## Pembangunan Ulang Landing Page (Dashboard Utama) — Sistem Informasi Penjualan Suku Cadang & Jasa Servis UPJ Otomotif & AHASS BLPT DIY

---

## 0. RINGKASAN TUGAS

Perbaiki dan lengkapi halaman **landing page** (route `/`) pada aplikasi ini agar:
1. Terlihat **profesional** dan siap dipresentasikan ke pihak BLPT DIY.
2. Informasinya **lengkap** — tidak hanya hero section, tapi juga fitur, alur kerja, peran pengguna, dan notice akses.
3. **Konsisten secara visual** dengan halaman `/login` dan halaman internal `/front-office/dashboard` yang SUDAH ADA di project ini (warna, tipografi, radius, shadow, gaya kartu/card, ikon).

Ini adalah **sistem internal** (bukan e-commerce publik), jadi tidak perlu elemen seperti keranjang belanja, daftar akun mandiri, checkout, dsb. Fokus ke citra sistem informasi resmi milik instansi pemerintah (BLPT DIY / Dinas terkait Yogyakarta).

---

## 1. LANGKAH WAJIB SEBELUM MENULIS KODE

**Jangan menebak desain dari nol.** Sebelum membuat komponen apa pun:

1. Baca komponen/halaman `/login` yang sudah ada — catat: warna background gradient/pattern, warna card, warna tombol "Masuk", border radius, font-family, ukuran font judul.
2. Baca komponen `/front-office/dashboard` yang sudah ada — catat: warna sidebar (navy gelap), warna active state menu, gaya 4 stat card di atas (icon bulat berwarna + angka besar + label + subtext), gaya chart, gaya badge status stok (merah/oranye untuk stok kritis).
3. Kalau project ini pakai Tailwind config atau file theme/CSS variables, **gunakan token warna yang sudah didefinisikan di sana**. Jangan bikin palet warna baru yang berbeda dari yang sudah dipakai.
4. Kalau ternyata tidak ada design token terpusat (warna di-hardcode di tiap file), **ekstrak nilainya lalu buat file token terpusat** (`tailwind.config.js` theme extend atau `globals.css` dengan CSS variables) supaya ke depannya konsisten dan mudah di-maintain — bukan cuma untuk landing page ini saja.

> Catatan penting soal konsistensi warna yang perlu diselaraskan:
> Saat ini terlihat ada 3 warna aksen berbeda di produk: **merah** (tombol "Cek Katalog Parts" di landing lama), **biru** (tombol "Masuk" di login page & active state menu sidebar), dan **navy gelap** (sidebar dashboard). Pilih **satu warna aksen utama** (rekomendasi: biru, karena sudah dipakai di login & active state dashboard — jadi lebih dominan) dan pakai warna itu secara konsisten untuk semua primary button & elemen interaktif di landing page. Merah cukup dipakai untuk elemen branding Honda (logo, aksen kecil) atau status "kritis/bahaya", bukan untuk CTA utama.

---

## 2. DESIGN SYSTEM (fallback token — pakai ini HANYA jika tidak ditemukan token asli di codebase)

```css
:root {
  /* Base */
  --color-navy-900: #0f1a2e;     /* sidebar dashboard, footer */
  --color-navy-800: #16233d;
  --color-primary-600: #2563eb;  /* tombol utama, link aktif — konsisten dgn tombol "Masuk" */
  --color-primary-700: #1d4ed8;  /* hover state */
  --color-honda-red: #d71920;    /* aksen branding Honda saja, bukan CTA utama */

  /* Status stok (dipakai di badge "Stok Kritis") */
  --color-status-critical: #ef4444;  /* stok 1-2 */
  --color-status-warning: #f97316;   /* stok 3-4 */
  --color-status-safe: #22c55e;      /* stok aman */

  /* Netral */
  --color-neutral-50: #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-400: #94a3b8;
  --color-neutral-600: #475569;
  --color-neutral-900: #0f172a;

  /* Layout */
  --radius-card: 1rem;      /* rounded-2xl */
  --radius-button: 0.75rem; /* rounded-xl */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
  --font-family: 'Inter', 'Poppins', system-ui, sans-serif;
}
```

**Aturan pemakaian:**
- Card statistik & fitur: background putih, `--radius-card`, `--shadow-card`, padding generous (min 24px).
- Icon di dalam card statistik: bulat (circle), background soft-tint dari warna kategorinya (contoh: icon keranjang = bg biru muda `#dbeafe` dengan icon biru `#2563eb`), ukuran ±40-48px — **ikuti pola yang sudah ada di 4 stat card dashboard front-office**.
- Badge status stok: pill/rounded-full kecil, background soft-tint sesuai level (merah muda utk kritis, oranye muda utk warning), teks bold warna solid.
- Semua heading pakai font-weight bold/extrabold, body text regular dengan warna `--color-neutral-600` supaya hierarki jelas (ikuti gaya subjudul hero yang sudah abu-abu di desain lama).

---

## 3. PETA HALAMAN (urutan section dari atas ke bawah)

1. Navbar (sticky)
2. Hero Section
3. Statistik Ringkas / Trust Indicators
4. Fitur Unggulan Sistem
5. Alur Kerja Sistem (workflow diagram)
6. Peran & Hak Akses Pengguna
7. Notice Akses Terbatas / Keamanan Sistem
8. Footer

---

## 4. SPESIFIKASI DETAIL PER SECTION

### 4.1 Navbar (sticky top, background putih/blur saat scroll)

- **Kiri:** Logo Garuda BLPT DIY (pakai asset yang sama dengan login page) + teks 2 baris: `UPJ Otomotif & AHASS` (bold) / `BLPT DIY` (kecil, abu-abu) — persis seperti navbar landing lama.
- **Tengah/kanan:** Menu horizontal: `Beranda`, `Katalog Suku Cadang`, `Layanan Servis`, `Informasi`. Menu ini scroll ke anchor section di halaman yang sama (bukan halaman terpisah), kecuali memang sudah ada route publik untuk katalog.
- **Paling kanan:** Tombol `Masuk ke Sistem` dengan icon gembok kecil, warna solid sesuai warna primary yang dipilih di §1, mengarah ke route `/login`.
- Responsive: di mobile, menu jadi hamburger, tombol "Masuk ke Sistem" tetap terlihat di navbar (jangan disembunyikan di dalam hamburger).

### 4.2 Hero Section

- Badge kecil di atas judul: `● Portal Informasi Resmi • UPJ AHASS BLPT DIY` (dot indikator hijau kecil untuk kesan "live/aktif").
- Judul H1 besar (48-56px desktop): **"Sistem Informasi Penjualan Suku Cadang & Jasa Servis"**
- Subjudul (abu-abu, 18px): *"Pengelolaan transaksi dan persediaan suku cadang yang terintegrasi, akurat, dan berstandar resmi Honda."*
- 2 tombol CTA:
  - Primary (solid, warna utama): `Cek Katalog Parts →`
  - Secondary (outline): `Lihat Layanan Servis →`
- Gambar di kanan: foto bengkel AHASS asli (pakai asset yang sama dari landing lama), dengan caption di bawahnya: *"Bengkel Resmi Honda AHASS — BLPT Daerah Istimewa Yogyakarta"*
- Gambar diberi rounded corner besar (`--radius-card`) dan subtle shadow supaya menyatu dengan gaya card lain.

### 4.3 Statistik Ringkas (4 kartu, horizontal — style samakan dengan 4 stat card di `/front-office/dashboard`)

Gunakan pola **icon bulat berwarna + angka besar + label**, bukan cuma teks polos seperti landing lama. Contoh isi (sesuaikan dengan data asli sistem):

| Icon | Angka | Label | Keterangan kecil |
|---|---|---|---|
| 📦 (box, biru) | 150+ | Jenis Sparepart | Terdaftar dalam katalog |
| 👥 (users, ungu) | 4 | Peran Sistem | Front Office, Gudang, Mekanik, Admin |
| ✅ (check-circle, hijau) | Aktif | Status Layanan Servis | Beroperasi setiap hari kerja |
| 🏢 (building, oranye) | 1 | Unit AHASS Terdaftar | BLPT Daerah Istimewa Yogyakarta |

> Item ke-4 ("Unit AHASS Terdaftar") tambahan baru dari versi lama — beri nilai riil sesuai kondisi aktual (kalau BLPT punya lebih dari 1 unit servis, ganti angkanya). Kalau ada data transaksi bulanan yang aman untuk ditampilkan ke publik (angka agregat, bukan detail sensitif), itu juga bagus dipakai sebagai pengganti salah satu statistik supaya makin meyakinkan saat presentasi.

### 4.4 Fitur Unggulan Sistem

Section dengan heading `Fitur Unggulan Sistem` + subheading singkat (contoh: *"Dirancang untuk mendukung operasional bengkel AHASS secara efisien dan akurat"*).

Grid 4 kolom (2 kolom di tablet, 1 kolom di mobile), tiap card: icon di kotak rounded soft-tint + judul bold + deskripsi 1-2 kalimat.

1. **Manajemen Transaksi Real-time** — Pencatatan transaksi suku cadang dan jasa servis secara langsung dan akurat.
2. **Kontrol Stok Otomatis** — Notifikasi otomatis saat stok suku cadang mendekati batas minimum.
3. **Multi-Peran & Hak Akses** — Setiap pengguna (Front Office, Gudang, Mekanik, Admin) memiliki akses sesuai tanggung jawabnya.
4. **Laporan & Riwayat Servis** — Rekap transaksi dan riwayat servis tersimpan rapi dan mudah ditelusuri.

### 4.5 Alur Kerja Sistem (section baru — penting untuk presentasi ke BLPT)

Heading: `Alur Kerja Sistem`. Tampilkan sebagai **stepper horizontal** (5 langkah bernomor, dihubungkan garis/panah), masing-masing dengan icon kecil:

1. Pelanggan Datang
2. Input Transaksi *(Front Office)*
3. Cek & Alokasi Stok *(Gudang)*
4. Servis Dikerjakan *(Mekanik)*
5. Laporan & Rekap *(Admin)*

Di mobile, stepper berubah jadi vertikal (list bernomor ke bawah).

### 4.6 Peran & Hak Akses Pengguna (section baru)

Heading: `Peran Pengguna dalam Sistem`. 4 card kecil (grid 2x2 di mobile, 4 kolom di desktop), masing-masing berisi nama peran + 2-3 tugas utamanya. Ini membantu audiens BLPT memahami cakupan sistem secara cepat saat presentasi:

- **Front Office** — Input transaksi baru, cetak nota, cek status stok.
- **Gudang** — Kelola penerimaan stok, update ketersediaan barang, buat order stok.
- **Mekanik** — Update status pengerjaan servis, catat penggunaan suku cadang.
- **Admin** — Kelola akun pengguna, lihat laporan menyeluruh, atur data master.

*(Sesuaikan nama peran ini dengan role yang benar-benar ada di sistem — ambil dari menu sidebar dashboard yang sudah dibangun.)*

### 4.7 Notice Akses Terbatas / Keamanan Sistem

Box khusus dengan background soft (misal navy-50 atau slate-50), border-left aksen warna, icon shield/lock:

> **Sistem Internal — Akses Terbatas**
> Sistem ini digunakan secara internal oleh pegawai UPJ AHASS BLPT DIY. Login hanya dapat dilakukan menggunakan akun yang telah didaftarkan oleh administrator sistem.

*(Kalimat ini sengaja disamakan nuansanya dengan teks kecil di bawah tombol "Masuk" pada halaman login — cek juga typo "diberiakan" pada teks login page saat ini, sebaiknya diperbaiki jadi "diberikan" supaya konsisten dan terlihat profesional saat presentasi.)*

### 4.8 Footer

- Kolom kiri: logo + `UPJ Otomotif & AHASS — BLPT DIY`, alamat singkat (jika tersedia).
- Kolom kanan: `© 2026 BLPT Daerah Istimewa Yogyakarta. Seluruh hak cipta dilindungi.`
- Tidak perlu ikon media sosial (bukan sistem publik/konsumen). Bisa tambahkan link kontak internal (email/ext. telepon) jika relevan untuk dukungan teknis.
- Background footer: pakai `--color-navy-900` (senada sidebar dashboard) supaya ada "jangkar warna gelap" yang menyatukan landing page dengan tampilan sistem internal.

---

## 5. ATURAN KONSISTENSI & HAL YANG HARUS DIHINDARI

- **Jangan** memakai font, warna, atau radius berbeda dari yang sudah dipakai di `/login` dan `/front-office/dashboard`.
- **Jangan** menambahkan elemen e-commerce publik (keranjang, checkout, daftar akun mandiri, rating produk publik).
- **Jangan** membuat data statistik palsu yang tidak masuk akal secara operasional — semua angka harus mudah diedit dari satu tempat (constant/config file), supaya gampang diupdate menjelang presentasi.
- **Konsisten istilah:** gunakan "Masuk ke Sistem" (bukan "Login" atau "Sign In"), gunakan bahasa Indonesia formal di seluruh halaman.
- Semua tombol yang mengarah ke fitur yang belum tersedia publik sebaiknya scroll ke section terkait di halaman yang sama, bukan link mati (404).

---

## 6. SPESIFIKASI TEKNIS

- **Routing:** Tombol "Masuk ke Sistem" → `/login`. Menu navbar → anchor scroll (`#fitur`, `#layanan`, `#informasi`, dst).
- **Responsive:** Mobile-first, breakpoint standar Tailwind (`sm`, `md`, `lg`, `xl`). Wajib dicek di lebar ±375px (HP) karena kemungkinan dashboard ini juga dibuka dari HP saat presentasi.
- **Aksesibilitas:** kontras warna teks minimal WCAG AA, semua gambar punya `alt` text deskriptif, tombol punya `aria-label` jika hanya berupa icon.
- **Performa:** optimasi gambar bengkel (gunakan format WebP/lazy-load) supaya loading cepat saat demo langsung.
- **Konsistensi komponen:** jika project sudah punya komponen reusable (`<Card />`, `<Button />`, `<Badge />`) dari halaman dashboard, **pakai ulang komponen tersebut** di landing page ini, jangan buat versi baru yang mirip tapi terpisah.

---

## 7. CHECKLIST AKHIR (Definition of Done)

- [ ] Warna, font, radius, shadow landing page terbukti diambil dari token/komponen yang sama dengan `/login` dan `/front-office/dashboard`.
- [ ] Semua 8 section pada §3 ada dan berisi konten sesuai §4 (bukan lorem ipsum).
- [ ] Statistik ringkas mudah diedit dari satu file config.
- [ ] Tombol "Masuk ke Sistem" berfungsi mengarah ke `/login`.
- [ ] Tampilan rapi di desktop (≥1280px), tablet (≥768px), dan mobile (≤400px).
- [ ] Tidak ada elemen e-commerce publik yang tidak relevan dengan sistem internal.
- [ ] Teks "diberiakan" pada login page dicek/diperbaiki jadi "diberikan" untuk konsistensi bahasa.
- [ ] Halaman sudah dites tanpa error console dan tanpa broken image/link.
