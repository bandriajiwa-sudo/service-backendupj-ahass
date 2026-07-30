# Dokumen Keputusan Revisi Arsitektur: Normalisasi Master Suku Cadang

**Tanggal:** 30 Juli 2026
**Konteks:** Perancangan Sistem Informasi Penjualan Suku Cadang dan Jasa Servis (UPJ Otomotif & AHASS BLPT DIY)
**Pengaruh Dokumen Skripsi:** DFD (Data Flow Diagram) dan ERD (Entity Relationship Diagram)

---

## 1. Latar Belakang Masalah (Urgensi Revisi)

Pada rancangan awal, entitas `spare_parts` (Master Suku Cadang) diciptakan untuk menampung seluruh atribut statis sekaligus dinamis, termasuk penginputan tipe teks mentah (_String_) untuk kolom Kategori, serta ditanamkannya kolom `harga_jual`.

Setelah dilakukan peninjauan arsitektur sistem berbasis _best practice_ manajemen inventaris, ditemukan dua kelemahan fundamental yang wajib direvisi:

1. **Risiko Anomali Data Kategori:** Penginputan kategori berbasis _String_ langsung di tabel suku cadang rawan terhadap _typo_ (salah ketik) atau ketidakseragaman (contoh: "Oli Mesin", "Olie Mesin", "oly"). Ini akan merusak integritas sistem pelaporan (_reporting_).
2. **Kekakuan Entitas Harga:** Harga jual adalah atribut dinamis yang mengalami fluktuasi/perubahan berjalannya waktu. Menempatkan harga ke dalam data Master Suku Cadang (yang bernilai statis) menyalahi konsep rekam jejak finansial.

---

## 2. Resolusi dan Keputusan Revisi Struktur (Normalisasi 3NF)

Untuk memenuhi standar keamanan dan integritas Skripsi, struktur Master Sistem akan direvisi dengan menerapkan prinsip **Normalisasi ke-3 (3NF)**.

### A. Evaluasi Atribut Tabel `spare_parts`

Tabel `spare_parts` **hanya** akan menampung atribut identitas barang yang bersifat statis, mutlak, dan tidak terpengaruh oleh aliran waktu maupun uang.

- **Dihapus:** `harga_jual` tidak akan lagi berada di tabel ini. Harga akan dipindahkan menjadi tanggung jawab form Transaksi (atau Tabel _Price History_ / _Order_).
- **Dipertahankan:** `batas_minimum` dipertahankan di entitas ini karena ia merupakan karakteristik standar operasional penumpukan _(stock threshold)_ dari entitas barang tunggal.

### B. Pemisahan Entitas Kategori (Category Isolation)

Melahirkan entitas baru bernama **Master Kategori (`categories`)** guna mengeliminasi redundansi. Tabel `spare_parts` nantinya hanya akan menyimpan "Kunci Tamu" (_Foreign Key_) dari id entitas kategori.

---

## 3. Penyesuaian pada ERD (Entity Relationship Diagram)

Di dalam naskah Skripsi Anda, Diagram Hubungan Entitas (ERD) harus mengalami modifikasi berikut:

1. **Entitas Baru: `Categories`**
   - _Atribut:_ `id` (PK), `kode_kategori` (opsional), `nama_kategori`.
2. **Perubahan Entitas: `Spare_Parts`**
   - _Atribut Lama:_ `id`, `kode_suku_cadang`, `nama_suku_cadang`, `kategori`, `harga_jual`, dll.
   - **_Atribut Baru:_** `id` (PK), `category_id` (FK), `kode_suku_cadang`, `nama_suku_cadang`, `batas_minimum`, `satuan`.
3. **Kardinalitas (Hubungan):**
   - `Categories` (1) ---> (M) `Spare_Parts`
   - _Penjelasan Dosen / Sidang:_ "Satu Kategori dapat menaungi banyak Suku Cadang _(One-to-Many)_".

---

## 4. Penyesuaian pada DFD (Data Flow Diagram)

### DFD Level 0 (Context Diagram)

- Tetap sama. Admin menangani Input Master, sistem memberikan Output Laporan.

### DFD Level 1

- **Proses Master Data (Misal Proses 1.0):** Akan dipecah menjadi dua sub-proses independen:
  - _Proses 1.1 - Kelola Master Kategori_ (Menyimpan data ke _Data Store_ `D1: Kategori`).
  - _Proses 1.2 - Kelola Master Suku Cadang_ (Menyimpan data ke _Data Store_ `D2: Suku Cadang`, dimana proses ini _membutuhkan aliran data reference_ dari `D1: Kategori`).

### DFD Level 2 (Ekspansi Kelola Suku Cadang)

- Ketika Admin melakukan input Master Suku Cadang, sistem akan memvalidasi _Dropdown_ kategori yang diambil dari _Data Store_ Kategori.

---

## 5. Ringkasan Implementasi UI/UX (Frontend)

Pada antarmuka sistem (React UI):

- Form **"Tambah Suku Cadang"** tidak lagi meminta Admin mengetikkan nama kategori, melainkan memberikan _Dropdown / Select Option_ yang isinya mengambil daftar (_fetch API_) dari tabel Kategori Suku Cadang.
- Disediakan satu sub-menu (halaman) baru khusus untuk **"Kelola Kategori Suku Cadang"** di pojok kiri bawah _Sidebar_ Admin sebagai tempat untuk mendaftarkan kategori-kategori baru sesuai kebutuhan operasional bengkel secara mandiri.
