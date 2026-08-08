# KONTEKS BESAR & LINIERISASI SKRIPSI (UPJ OTOMOTIF & AHASS BLPT DIY)

Dokumen ini adalah **titik jangkar (Anchor Context)** bagi Antigravity IDE (AI Assistant). Gunakan referensi di bawah ini setiap kali melakukan modifikasi, analisis, penjabaran, atau penulisan naskah terkait **Bab 4 (Implementasi \& Pengujian)** dan **Garis Linier (Benang Merah) Skripsi**.

---

## 1. IDENTITAS PENELITIAN

- **Judul**: Implementasi Sistem Informasi Penjualan Suku Cadang dan Jasa Service Berbasis Web
- **Studi Kasus**: Balai Latihan Pendidikan Teknik (BLPT) DIY – Bagian UPJ Otomotif dan AHASS
- **Fokus Utama**: Menghubungkan alur operasional antara Front Office (Area Bengkel/Kasir) dengan Koperasi (Gudang/Supply).

---

## 2. LINIERISASI ALUR (BAB I - BAB V)

- **BAB I (Latar Belakang & Masalah)**
  - _Masalah_: Pencatatan jasa service dan penjualan suku cadang masih manual (mengandalkan Microsoft Excel).
  - _Dampak_: Persediaan stok barang (inventori) sulit dilacak, rentan ketidakakuratan, dan pelaporan pendapatan lambat.
  - _Solusi_: Membangun sistem informasi berbasis web yang terintegrasi (menghilangkan proses konvensional).
- **BAB II & BAB III (Teori & Perancangan)**
  - Dasar teori tentang Inventory, Jasa Service, dan Blackbox Testing.
  - Rancangan ERD (Entity Relationship Diagram) dan DFD (Data Flow Diagram) yang menjembatani peran Admin, FO, Koperasi, dan Kepala UPJ.
- **BAB IV (Implementasi & Pengujian - CORE FOCUS)**
  - Eksekusi nyata dari Bab III berupa visual aplikasi web (Antarmuka / UI).
  - Pengujian (Blackbox) memastikan kode program mengakomodir janji di Bab I secara fungsional.
- **BAB V (Penutup)**
  - Kesimpulan bahwa keterbatasan Excel berhasil diatasi menggunakan aplikasi terpusat, mempermudah kerja Koperasi dan FO.

---

## 3. MATRIKS HAK AKSES & ALUR BISNIS UTAMA (IMPLEMENTASI BAB IV)

Terdapat **4 Hak Akses (Role) Fundamental** yang menopang sistem. Dilarang keluar dari batasan otoritas ini saat menjelaskan fungsi sistem:

### A. ADMIN (System Maintenance)

- **Fungsi**: Mengurus master dasar yang jarang berubah.
- **Wewenang**: Data Kategori Suku Cadang, Identitas Personil/Pegawai, Manajemen Hak Akses Pengguna (User), Database Mekanik, dan Database seluruh Master Suku Cadang Awal.

### B. FRONT OFFICE / FO (Operasional Bengkel & Kasir)

- **Fungsi**: Ujung tombak yang berhadapan langsung dengan Pelanggan & Kendaraan.
- **Wewenang**:
  - Meregistrasi pelanggan dan antrean keluhan masuk.
  - Mencetak Nota Transaksi dan menagih pembayaran (Kasir).
  - **Sinkronisasi Stok**: Saat FO menagih transaksi spare part, stok di gudang akan otomatis terpotong secara _real-time_.
  - Pembuatan _Surat Order / PO_: FO meminta suplai barang dari Koperasi saat stok menipis.
  - Penerimaan dari Koperasi (Penerimaan DO / Surat Jalan).
  - Proses Retur (pengembalian part cacat) ke Koperasi (RPL / Replacement).

### C. KOPERASI (Manajemen Gudang & Suppy)

- **Fungsi**: Titik pusat kontrol sirkulasi barang/suku cadang ke bengkel.
- **Wewenang**:
  - Validasi Order FO: Menyetujui _(Approve)_ Surat Order dari Front Office.
  - Menerima stok mentah dari _Supplier_ eksternal.
  - Melakukan penyetelan harga master penjualan (Koreksi Log Harga Aktif).
  - Memvalidasi Retur/rusak yang diajukan oleh FO.

### D. KEPALA UPJ (Eksekutif)

- **Fungsi**: Pemantauan murni (Hanya baca & Unduh Laporan).
- **Wewenang**:
  - Melihat rangkuman Laporan Transaksi Jasa Service.
  - Melihat agregasi Laporan Penjualan (Omzet) Suku Cadang.
  - Melihat grafik analitik secara instan tanpa perlu menunggu rekap Excel.

---

## 4. PEDOMAN BLACKBOX TESTING

Saat menyusun ulang atau menajamkan _Blackbox Testing_ untuk Bab IV, pengujian harus secara mutlak mengevaluasi 8 hal krusial berikut:

1. Validasi pembuatan entitas Auth/Master oleh **Admin**.
2. Keberhasilan pembuatan Nota Jasa Service oleh **FO** secara tunai.
3. Alur PO Otomatis (Order) dari **FO** yang masuk tanpa kendala.
4. Uji _Retur_ cacat yang divalidasi silang antara **FO** dan **Koperasi**.
5. Kemampuan **Koperasi** menolak atau mengkonfirmasi Order FO (Penerbitan Surat Jalan).
6. Kemampuan **Koperasi** mengontrol _Harga Aktif_ parts dalam Master.
7. Akurasi Grafik Laporan yang terbentuk otomatis di Portal **Kepala UPJ**.
8. Uji potong stok sistematis (Real-time synchronization).

_End of Document. Disusun oleh Antigravity._
