# ✨ Dokumen Fitur Terimplementasi (Implemented Features)

Dokumen ini merangkum seluruh struktur, alur kerja (workflow), dan fitur yang telah berhasil dibangun pada sistem **UPJ Otomotif & AHASS BLPT DIY** hingga saat ini. Dokumen ini bertujuan untuk menjadi acuan dasar analisis agar penyusunan PRD (Product Requirements Document) lanjutan dapat lebih tajam, spesifik, dan meminimalisir gap ekspektasi.

---

## 🏗️ 1. Arsitektur & Teknologi

- **Backend:** Laravel 12 (RESTful API, sistem otentikasi menggunakan Laravel Sanctum, Middleware Role-based access).
- **Frontend:** ReactJS + TypeScript + Vite.
- **Routing:** React Router v6 dengan proteksi halaman berdasarkan Role Kredensial.
- **Styling:** Custom CSS Modules (Premium UI, Glassmorphism, Micro-animations)
- **Database:** PostgreSQL (Melalui Migrasi Eloquent dengan pemisahan tabel secara normalisasi).

---

## 👥 2. Sistem Hak Akses (Role-Based Access Control)

Sistem telah memiliki kapabilitas login multi-user yang terpisah menjadi 4 hak akses utama. (Saat ini UI telah optimal untuk 3 role inti operasional: **Admin, Front Office, dan Koperasi**).

### A. Fitur Administrator (Supervisi Master Data)

Admin bertugas mengelola data inti (Master Data) sebelum operasi harian berjalan.

- **Manajemen Suku Cadang (CRUD):** Tambah, edit, hapus data suku cadang (Nama, Harga Jual, Harga Koperasi, Jenis/Tipe, Stok Minimum, Kategori).
- **Manajemen Pengguna:** Penambahan staf dengan role FO, Koperasi, Admin.
- **Manajemen Mekanik:** Pengelolaan database mekanik bengkel (nama, spesialisasi, kontak).

### B. Fitur Front Office (FO) - Kasir & Ujung Tombak Operasional

FO berhadapan langsung dengan pelanggan bengkel dan memantau ketersediaan suku cadang secara real-time.

- **Dashboard Kasir:** Metrik transaksi harian, total pendapatan (hari ini & bulan ini), serta alert peringatan jika ada "Stok Kritis (Batas Minimum)".
- **Transaksi Servis / Penjualan:**
  - Pembuatan nota baru (mengisi nama pelanggan, plat nomor, tanggal).
  - Pemotongan stok otomatis saat menambah suku cadang ke dalam nota.
  - Input biaya jasa mekanik.
  - _(Masih bisa diperluas untuk fitur cetak struk termal)._
- **Manajemen Pengajuan Logistik (Order ke Koperasi):**
  - FO dapat membuat surat pengajuan pesanan (PO) suku cadang ke Koperasi jika stok menipis.
  - Sistem chat-thread catatan 2-arah (FO ↔ Koperasi) pada setiap pengajuan.
- **Verifikasi Penerimaan Barang (Goods Receipt):**
  - FO berwenang memeriksa kedatangan barang dari vendor/koperasi.
  - **Auto-Sync Database:** Apabila FO memverifikasi status "Disetujui/Lunas", maka **`stok_sekarang` di database secara otomatis bertambah.**

### C. Fitur Logistik Koperasi (Pengadaan Barang)

Koperasi bertindak sebagai _supplier internal_ yang menyetujui pengajuan modal barang dan menyuplai kebutuhan FO.

- **Dashboard Koperasi (Metrik Status Pengadaan):**
  - _Order Baru:_ Menghitung tiket pengajuan FO yang belum disentuh (`status: Menunggu`).
  - _Sedang Diproses:_ Menghitung tiket yang telah di-_Approve_ Koperasi, namun belum selesai diverifikasi lunas oleh FO.
  - _Order Ditolak:_ Jumlah pengajuan yang direject (ditolak).
  - _Selesai Bulan Ini:_ Akumulasi order yang sukses terverifikasi logistiknya dalam siklus bulan berjalan.
- **Keputusan Order Logistik:**
  - Menerima, Menolak, atau Mem-pending pesanan dari FO lewat Modal Interaktif.
  - Memberikan balasan alasan (Catatan Koperasi) yang akan dibaca FO di layar mereka.
- **Log Penerimaan (View Only):** Memonitor catatan FO atas barang yang sudah sah mendarat di gudang.

---

## 🔄 3. Skema Database yang Telah Dibuat (Relational Mapping)

1.  **`users`**: Data identitas & role pegawai.
2.  **`mechanics`**: Data mekanik bengkel.
3.  **`spare_parts`**: Katalog induk persediaan (termasuk kolom trigger stok & harga).
4.  **`transactions` & `transaction_details`**: Perekaman penjualan ke pelanggan luar (pemasukan).
5.  **`spare_part_orders`**: Form pengajuan logistik internal FO -> Koperasi (Catatan 2 Arah: `catatan_fo`, `catatan_koperasi`).
6.  **`spare_part_receipts`**: Log serah-terima/kedatangan fisik stok dan verifikasi FO (menjadi trigger auto-tambah stok inventory utama).

---

## 📌 4. Ruang Lingkup Evaluasi (Untuk PRD Berikutnya)

Berikut beberapa titik fleksibilitas yang secara teknis _bisa/belum dipertajam_ pada PRD berikutnya:

1. **Laporan & Exporting:** Apakah butuh fitur Export PDF/Excel rekap transaksi untuk keperluan auditing pimpinan?
2. **Detail Pembayaran Pelanggan:** Apakah pendaftaran struk servis Front Office memerlukan multi-payment (Cash/Transfer) dan penghitungan Kembalian?
3. **Mekanisme Cetak/Printing:** Nota kasir atau Memo Permintaan Logistik (Koperasi).
4. **Pembatalan Logistik:** Bagaimana prosedur jika Koperasi sudah "Membeli" namun FO ternyata salah memesan (Retur / Void receipt)?

_Silahkan di-copy dokumen ini untuk mempermudah perancangan PRD Spesifik selanjutnya, bro!_
