# Rekapitulasi Implementasi Sistem (Per 31 Juli 2026)

Dokumen ini merupakan **Tracker Global** seluruh elemen yang telah dibangun dan di-deploy. Semua fields database dicantumkan secara eksplisit untuk keperluan Data Input/Output pada DFD & ERD Skripsi.

---

## 1. STRUKTUR DATABASE — DAFTAR TABEL & FIELDS LENGKAP

### 1.1 Tabel `users`

| No  | Nama Kolom   | Tipe Data         | Keterangan                                               |
| --- | ------------ | ----------------- | -------------------------------------------------------- |
| 1   | `id`         | bigint (PK, auto) | Primary Key                                              |
| 2   | `nama_user`  | string            | Nama lengkap pengguna                                    |
| 3   | `role`       | string (Enum)     | Peran: `admin`, `front_office`, `koperasi`, `kepala_upj` |
| 4   | `status`     | string (Enum)     | Status akun: `active`, `inactive`                        |
| 5   | `created_at` | timestamp         | Waktu pembuatan                                          |
| 6   | `updated_at` | timestamp         | Waktu pembaruan                                          |

---

### 1.2 Tabel `logins`

| No  | Nama Kolom       | Tipe Data              | Keterangan                               |
| --- | ---------------- | ---------------------- | ---------------------------------------- |
| 1   | `id`             | bigint (PK, auto)      | Primary Key                              |
| 2   | `user_id`        | bigint (FK → users.id) | Relasi ke tabel users, cascade on delete |
| 3   | `username`       | string (unique)        | Nama pengguna untuk login                |
| 4   | `password`       | string                 | Password terenkripsi (Hash)              |
| 5   | `remember_token` | string (nullable)      | Token ingat sesi                         |
| 6   | `created_at`     | timestamp              | Waktu pembuatan                          |
| 7   | `updated_at`     | timestamp              | Waktu pembaruan                          |

---

### 1.3 Tabel `login_logs`

| No  | Nama Kolom     | Tipe Data         | Keterangan                                     |
| --- | -------------- | ----------------- | ---------------------------------------------- |
| 1   | `id`           | bigint (PK, auto) | Primary Key                                    |
| 2   | `user_id`      | bigint (nullable) | ID pengguna yang login                         |
| 3   | `username`     | string            | Username yang digunakan saat login             |
| 4   | `role`         | string (nullable) | Role pengguna pada saat login                  |
| 5   | `logged_in_at` | timestamp         | Waktu login tercatat (default: waktu saat ini) |
| 6   | `created_at`   | timestamp         | Waktu pembuatan                                |
| 7   | `updated_at`   | timestamp         | Waktu pembaruan                                |

---

### 1.4 Tabel `personal_access_tokens` (Sanctum)

| No  | Nama Kolom       | Tipe Data                     | Keterangan                             |
| --- | ---------------- | ----------------------------- | -------------------------------------- |
| 1   | `id`             | bigint (PK, auto)             | Primary Key                            |
| 2   | `tokenable_type` | string                        | Tipe model pemilik token (morph)       |
| 3   | `tokenable_id`   | bigint                        | ID model pemilik token (morph)         |
| 4   | `name`           | text                          | Nama/label token (misal: "auth-token") |
| 5   | `token`          | string(64, unique)            | Hash SHA-256 dari token                |
| 6   | `abilities`      | text (nullable)               | Hak akses token (JSON)                 |
| 7   | `last_used_at`   | timestamp (nullable)          | Terakhir digunakan                     |
| 8   | `expires_at`     | timestamp (nullable, indexed) | Waktu kedaluwarsa                      |
| 9   | `created_at`     | timestamp                     | Waktu pembuatan                        |
| 10  | `updated_at`     | timestamp                     | Waktu pembaruan                        |

---

### 1.5 Tabel `mechanics`

| No  | Nama Kolom      | Tipe Data                  | Keterangan                                               |
| --- | --------------- | -------------------------- | -------------------------------------------------------- |
| 1   | `id`            | bigint (PK, auto)          | Primary Key                                              |
| 2   | `mechanic_code` | string(50, nullable)       | Kode unik mekanik (ditambahkan via migrasi tambahan)     |
| 3   | `nama_mekanik`  | string                     | Nama lengkap mekanik                                     |
| 4   | `status`        | string (default: 'active') | Status aktif/nonaktif (ditambahkan via migrasi tambahan) |
| 5   | `created_at`    | timestamp                  | Waktu pembuatan                                          |
| 6   | `updated_at`    | timestamp                  | Waktu pembaruan                                          |

---

### 1.6 Tabel `spare_parts`

| No  | Nama Kolom         | Tipe Data         | Keterangan                                    |
| --- | ------------------ | ----------------- | --------------------------------------------- |
| 1   | `id`               | bigint (PK, auto) | Primary Key                                   |
| 2   | `kode_suku_cadang` | string (unique)   | Kode identifikasi suku cadang (misal: SC-001) |
| 3   | `nama_suku_cadang` | string            | Nama suku cadang (misal: Busi NGK)            |
| 4   | `kategori`         | string            | Kategori suku cadang (misal: Oli, Busi)       |
| 5   | `harga_jual`       | decimal(15,2)     | Harga jual per satuan                         |
| 6   | `created_at`       | timestamp         | Waktu pembuatan                               |
| 7   | `updated_at`       | timestamp         | Waktu pembaruan                               |

---

### 1.7 Tabel `spare_part_stocks`

| No  | Nama Kolom            | Tipe Data                    | Keterangan                                     |
| --- | --------------------- | ---------------------------- | ---------------------------------------------- |
| 1   | `id`                  | bigint (PK, auto)            | Primary Key                                    |
| 2   | `spare_part_id`       | bigint (FK → spare_parts.id) | Relasi ke tabel spare_parts, cascade on delete |
| 3   | `stok_sekarang`       | unsigned int (default: 0)    | Jumlah stok real-time saat ini                 |
| 4   | `stok_minimum`        | unsigned int (default: 0)    | Batas minimum stok sebelum peringatan          |
| 5   | `terakhir_diperbarui` | timestamp (nullable)         | Waktu terakhir stok diperbarui                 |
| 6   | `created_at`          | timestamp                    | Waktu pembuatan                                |
| 7   | `updated_at`          | timestamp                    | Waktu pembaruan                                |

---

### 1.8 Tabel `transactions`

| No  | Nama Kolom   | Tipe Data              | Keterangan                                                    |
| --- | ------------ | ---------------------- | ------------------------------------------------------------- |
| 1   | `id`         | bigint (PK, auto)      | Primary Key                                                   |
| 2   | `user_id`    | bigint (FK → users.id) | Petugas FO yang membuat transaksi, restrict on delete         |
| 3   | `tanggal`    | datetime               | Tanggal dan waktu transaksi                                   |
| 4   | `no_nota`    | string (unique)        | Nomor nota/invoice unik                                       |
| 5   | `catatan`    | text (nullable)        | Catatan tambahan transaksi (ditambahkan via migrasi tambahan) |
| 6   | `created_at` | timestamp              | Waktu pembuatan                                               |
| 7   | `updated_at` | timestamp              | Waktu pembaruan                                               |

---

### 1.9 Tabel `transaction_services`

| No  | Nama Kolom        | Tipe Data                     | Keterangan                                   |
| --- | ----------------- | ----------------------------- | -------------------------------------------- |
| 1   | `id`              | bigint (PK, auto)             | Primary Key                                  |
| 2   | `transaction_id`  | bigint (FK → transactions.id) | Relasi ke transaksi induk, cascade on delete |
| 3   | `mechanic_id`     | bigint (FK → mechanics.id)    | Mekanik penanggung jawab, restrict on delete |
| 4   | `nama_jasa`       | string                        | Nama jasa servis (misal: Ganti Oli)          |
| 5   | `biaya_jasa`      | decimal(15,2)                 | Biaya jasa servis                            |
| 6   | `keterangan_jasa` | text (nullable)               | Keterangan tambahan                          |
| 7   | `created_at`      | timestamp                     | Waktu pembuatan                              |
| 8   | `updated_at`      | timestamp                     | Waktu pembaruan                              |

---

### 1.10 Tabel `transaction_spare_parts`

| No  | Nama Kolom       | Tipe Data                     | Keterangan                                   |
| --- | ---------------- | ----------------------------- | -------------------------------------------- |
| 1   | `id`             | bigint (PK, auto)             | Primary Key                                  |
| 2   | `transaction_id` | bigint (FK → transactions.id) | Relasi ke transaksi induk, cascade on delete |
| 3   | `spare_part_id`  | bigint (FK → spare_parts.id)  | Suku cadang yang dijual, restrict on delete  |
| 4   | `jumlah`         | unsigned int                  | Jumlah unit yang dijual                      |
| 5   | `harga_satuan`   | decimal(15,2)                 | Harga per satuan saat transaksi              |
| 6   | `total_harga`    | decimal(15,2)                 | Total harga (jumlah × harga_satuan)          |
| 7   | `created_at`     | timestamp                     | Waktu pembuatan                              |
| 8   | `updated_at`     | timestamp                     | Waktu pembaruan                              |

---

### 1.11 Tabel `spare_part_orders`

| No  | Nama Kolom          | Tipe Data                    | Keterangan                                                       |
| --- | ------------------- | ---------------------------- | ---------------------------------------------------------------- |
| 1   | `id`                | bigint (PK, auto)            | Primary Key                                                      |
| 2   | `user_id`           | bigint (FK → users.id)       | FO yang membuat pesanan, restrict on delete                      |
| 3   | `spare_part_id`     | bigint (FK → spare_parts.id) | Suku cadang yang dipesan, restrict on delete                     |
| 4   | `jumlah`            | unsigned int                 | Jumlah unit yang dipesan                                         |
| 5   | `status`            | string                       | Status pesanan: `menunggu`, `disetujui`, `ditolak`               |
| 6   | `catatan_fo`        | text (nullable)              | Catatan dari Front Office (semula `catatan`, di-rename)          |
| 7   | `catatan_koperasi`  | text (nullable)              | Catatan balasan dari Koperasi (ditambahkan via migrasi tambahan) |
| 8   | `tanggal_keputusan` | timestamp (nullable)         | Waktu Koperasi mengambil keputusan                               |
| 9   | `created_at`        | timestamp                    | Waktu pembuatan                                                  |
| 10  | `updated_at`        | timestamp                    | Waktu pembaruan                                                  |

---

### 1.12 Tabel `spare_part_shipments`

| No  | Nama Kolom            | Tipe Data                          | Keterangan                                            |
| --- | --------------------- | ---------------------------------- | ----------------------------------------------------- |
| 1   | `id`                  | bigint (PK, auto)                  | Primary Key                                           |
| 2   | `spare_part_order_id` | bigint (FK → spare_part_orders.id) | Pesanan yang dikirim, cascade on delete               |
| 3   | `shipment_type`       | enum                               | Tipe pengiriman: `initial`, `replacement`             |
| 4   | `quantity`            | unsigned int                       | Jumlah unit yang dikirim                              |
| 5   | `harga_beli`          | decimal(12,2, nullable)            | Harga beli definitif saat penerimaan                  |
| 6   | `harga_jual`          | decimal(12,2, nullable)            | Harga jual definitif saat penerimaan                  |
| 7   | `status`              | enum                               | Status: `menunggu_verifikasi`, `disetujui`, `ditolak` |
| 8   | `shipped_by`          | bigint (FK → users.id)             | Koperasi yang mengirim, cascade on delete             |
| 9   | `shipped_at`          | timestamp                          | Waktu pengiriman (default: waktu saat ini)            |
| 10  | `verified_by`         | bigint (FK → users.id, nullable)   | FO yang memverifikasi, null on delete                 |
| 11  | `verified_at`         | timestamp (nullable)               | Waktu verifikasi                                      |
| 12  | `rejection_note`      | text (nullable)                    | Catatan alasan penolakan oleh FO                      |
| 13  | `stock_posted_at`     | timestamp (nullable)               | Penanda stok sudah diposting (cegah duplikasi)        |
| 14  | `created_at`          | timestamp                          | Waktu pembuatan                                       |
| 15  | `updated_at`          | timestamp                          | Waktu pembaruan                                       |
| 16  | `deleted_at`          | timestamp (nullable)               | Soft delete                                           |

---

### 1.13 Tabel `spare_part_returns`

| No  | Nama Kolom               | Tipe Data                                     | Keterangan                                                                    |
| --- | ------------------------ | --------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | `id`                     | bigint (PK, auto)                             | Primary Key                                                                   |
| 2   | `spare_part_order_id`    | bigint (FK → spare_part_orders.id)            | Pesanan yang dikembalikan, cascade on delete                                  |
| 3   | `spare_part_shipment_id` | bigint (FK, unique → spare_part_shipments.id) | Pengiriman yang ditolak, cascade on delete                                    |
| 4   | `quantity`               | unsigned int                                  | Jumlah unit yang dikembalikan                                                 |
| 5   | `reason`                 | text                                          | Alasan retur (wajib diisi oleh FO)                                            |
| 6   | `status`                 | enum                                          | Status: `menunggu_pengiriman_ulang`, `dikirim_ulang`, `selesai`, `dibatalkan` |
| 7   | `created_by`             | bigint (FK → users.id)                        | FO yang melaporkan retur                                                      |
| 8   | `resolved_by`            | bigint (FK → users.id, nullable)              | Koperasi yang menyelesaikan retur                                             |
| 9   | `resolved_at`            | timestamp (nullable)                          | Waktu penyelesaian retur                                                      |
| 10  | `created_at`             | timestamp                                     | Waktu pembuatan                                                               |
| 11  | `updated_at`             | timestamp                                     | Waktu pembaruan                                                               |

---

### 1.14 Tabel `shipment_evidences`

| No  | Nama Kolom               | Tipe Data                                       | Keterangan                                                           |
| --- | ------------------------ | ----------------------------------------------- | -------------------------------------------------------------------- |
| 1   | `id`                     | bigint (PK, auto)                               | Primary Key                                                          |
| 2   | `spare_part_shipment_id` | bigint (FK, nullable → spare_part_shipments.id) | Bukti terikat pengiriman                                             |
| 3   | `spare_part_return_id`   | bigint (FK, nullable → spare_part_returns.id)   | Bukti terikat retur                                                  |
| 4   | `evidence_type`          | enum                                            | Tipe: `shipment_initial`, `damage_or_defect`, `shipment_replacement` |
| 5   | `storage_disk`           | string (default: 'local')                       | Disk penyimpanan                                                     |
| 6   | `storage_path`           | string (unique)                                 | Path file di server                                                  |
| 7   | `original_filename`      | string                                          | Nama file asli saat diunggah                                         |
| 8   | `mime_type`              | string                                          | Tipe MIME (image/jpeg, image/png, dll)                               |
| 9   | `size_bytes`             | bigint                                          | Ukuran file dalam bytes                                              |
| 10  | `sha256`                 | char(64, nullable)                              | Hash SHA-256 file untuk integritas                                   |
| 11  | `uploaded_by`            | bigint (FK → users.id)                          | Pengguna yang mengunggah                                             |
| 12  | `uploaded_at`            | timestamp                                       | Waktu unggah (default: waktu saat ini)                               |
| 13  | `created_at`             | timestamp                                       | Waktu pembuatan                                                      |
| 14  | `updated_at`             | timestamp                                       | Waktu pembaruan                                                      |

---

## 2. LOGIKA BACKEND (LARAVEL API)

### Otorisasi & Keamanan

- **Stateless Bearer Token (Sanctum):** Migrasi penuh dari Session Cookie ke Personal Access Token untuk kompatibilitas Serverless (Vercel).
- **Middleware `auth:sanctum`:** Seluruh rute terproteksi menggunakan guard Sanctum, bukan guard web.
- **RoleMiddleware:** Pembatasan akses berdasarkan enum role (`admin`, `front_office`, `koperasi`, `kepala_upj`).
- **Global Exception Handler:** Semua error API dikembalikan sebagai JSON standar tanpa mengekspos path/trace internal.

### Integritas Data

- **Idempoten `lockForUpdate()`:** Diterapkan pada verifikasi shipment dan transaksi kasir. Mencegah race-condition penambahan stok ganda.
- **Atomic Transaction (`DB::transaction`):** Seluruh operasi yang melibatkan perubahan stok dibalut transaksi database.
- **File Upload Handler:** Controller Shipment menerima `multipart/form-data`, memvalidasi MIME, ukuran, dan menyimpan ke storage lokal.

### Controller API yang Aktif

| Controller                    | Endpoint Prefix         | Fungsi Utama                         |
| ----------------------------- | ----------------------- | ------------------------------------ |
| `AuthorizerController`        | `/authorizer`           | Login, Me, Logout (Bearer Token)     |
| `UserController`              | `/users`                | CRUD pengguna sistem                 |
| `SparePartController`         | `/spare-parts`          | CRUD master suku cadang + stok       |
| `TransactionController`       | `/transactions`         | CRUD transaksi servis + penjualan    |
| `SparePartOrderController`    | `/spare-part-orders`    | Pemesanan FO ke Koperasi             |
| `SparePartShipmentController` | `/spare-part-shipments` | Pengiriman, verifikasi, upload bukti |
| `SparePartReturnController`   | `/spare-part-returns`   | Manajemen retur barang cacat         |
| `DashboardController`         | `/dashboard`            | Widget statistik per-role            |
| `ReportController`            | `/reports`              | Cetak laporan PDF/HTML               |
| `MechanicController`          | `/mechanics`            | CRUD data mekanik                    |

---

## 3. FRONTEND (REACT VITE + TYPESCRIPT)

### Modul Otentikasi

- **Login.tsx:** Halaman login dengan desain premium, animasi CSS, auto-redirect per role.
- **AuthContext.tsx:** Context provider menyimpan Bearer Token di localStorage, Axios interceptor otomatis.
- **ProtectedRoute.tsx:** Guard gerbang ganda, validasi role sebelum render halaman.

### Dashboard Multi-Role

- **Admin:** Panel master data, statistik login log, total pengguna.
- **Front Office:** Widget stok kritis/restock, transaksi harian, motor selesai servis.
- **Koperasi:** Panel pesanan masuk, barang ditolak FO, status pengiriman.
- **Kepala UPJ:** Statistik penjualan, laba rugi, ringkasan operasional.

### Modul Master Data (Admin)

- **UserList.tsx:** CRUD pengguna sistem (nama, role, status, username, password).
- **SparePartList.tsx:** CRUD suku cadang (kode, nama, kategori, harga, stok, batas minimum).
- **MechanicList.tsx:** CRUD mekanik (kode, nama, status aktif/nonaktif).

### Modul Transaksi (Front Office)

- **TransactionList.tsx:** Daftar transaksi servis dengan filter, pencarian, dan detail.
- **Form Transaksi Baru:** Layout 2 kolom — data pelanggan (kendaraan, nopol) + keranjang kasir (sparepart + jasa mekanik).

### Modul Pesanan Suku Cadang (Front Office ↔ Koperasi)

- **OrderList.tsx:** FO membuat pesanan ke Koperasi, keranjang multi-item.
- **KoperasiPenerimaan.tsx:** Koperasi melihat dan merespons pesanan masuk.

### Modul Pengiriman & Retur (Fase P1)

- **ShipmentList.tsx:** UI pengiriman barang + upload foto bukti pengemasan. FO memverifikasi dengan SweetAlert2 — tombol Tolak wajib sertakan foto barang cacat.
- **KoperasiReturns.tsx:** Panel manajemen retur untuk Koperasi — fasilitasi kirim ulang (replacement).

### Modul Pelaporan

- **ReportsDashboard.tsx:** Pusat unduh/cetak laporan dalam format PDF/HTML melalui Blade Templates:
  1. Laporan Stok Suku Cadang
  2. Laporan Penjualan Suku Cadang
  3. Laporan Jasa Servis Motor

### Navigasi & Layout

- **BaseLayout.tsx:** Sidebar responsif dengan menu dinamis berdasarkan role pengguna.
