# IMPLEMENTATION FINAL
## Penyelarasan Implementasi Aplikasi, DFD, ERD, dan Relasi Tabel

**Sistem:** Sistem Informasi Penjualan Suku Cadang dan Jasa Service Berbasis Web  
**Unit:** UPJ Otomotif dan AHASS BLPT DIY  
**Tanggal penyelarasan:** 31 Juli 2026  
**Status dokumen:** Acuan gabungan antara kondisi aplikasi saat ini dan rancangan final yang harus dicapai

---

## 1. Tujuan Dokumen

Dokumen ini menjadi acuan utama untuk menyelaraskan:

1. alur logika aplikasi;
2. aktor dan hak akses;
3. data input, proses, dan output;
4. struktur tabel dan field;
5. hubungan antartabel;
6. penamaan pada DFD dengan penamaan fisik pada aplikasi;
7. modul profil/personel;
8. kondisi implementasi saat ini dan perubahan yang masih diperlukan.

Dokumen ini tidak membentuk sistem baru yang berbeda dari rancangan. Struktur akhirnya tetap mengikuti alur utama pada flowchart, diagram konteks, HIPO, overview, detail input, detail proses, detail output, ERD, dan relasi tabel yang telah disusun.

> **Batas verifikasi:** status implementasi saat ini dalam dokumen ini disusun dari `implementation_clear_full.md`. Kode sumber, migration, route, controller, dan database aktif tidak diperiksa langsung. Karena itu, label **Sudah Ada** berarti sudah tercatat dalam dokumen implementasi yang diberikan, bukan hasil audit source code secara langsung.

---

## 2. Keputusan Final yang Digunakan

| No. | Topik | Keputusan Final |
|---:|---|---|
| 1 | Bentuk dokumen | Menampilkan kondisi aplikasi saat ini sekaligus target final, dengan status **Sudah Ada**, **Perlu Penyesuaian**, atau **Belum Terdokumentasi**. |
| 2 | Nama tabel profil | Menggunakan tabel fisik `personnels`. |
| 3 | Data profil | `user_id`, `nama_pegawai`, `unit_kerja`, dan `posisi`, ditambah key dan timestamp teknis. |
| 4 | Pengelola profil | Hanya Admin yang dapat membuat dan mengubah data personel. User lain hanya menggunakan atau melihat profil sesuai kebutuhan antarmuka. |
| 5 | Relasi petugas pada penerimaan | Tetap berelasi langsung ke tabel `users`, bukan ke tabel `personnels`. Tabel `personnels` hanya berfungsi sebagai profil user. |
| 6 | Harga pada penerimaan | Hanya menyimpan `harga_jual`. Field `harga_beli` tidak digunakan pada struktur final. |
| 7 | Batas minimum stok | Hanya disimpan pada tabel `spare_part_stocks` melalui field `stok_minimum`. Tidak diduplikasi pada `spare_parts`. |
| 8 | Order banyak barang | Setiap jenis suku cadang disimpan sebagai satu baris `spare_part_orders`. Satu keranjang berisi tiga barang menghasilkan tiga record order. |
| 9 | Notifikasi stok | Tidak menggunakan tabel khusus. Notifikasi dihitung otomatis ketika `stok_sekarang <= stok_minimum`. |
| 10 | Master kategori | Menggunakan tabel terpisah `categories`; `spare_parts` menyimpan FK kategori, bukan teks kategori bebas. |
| 11 | Harga di master suku cadang | `harga_jual` dihapus dari `spare_parts`. Harga aktif berasal dari penerimaan terakhir yang telah disetujui. |
| 12 | Estimasi order | `tanggal_awal` dan `tanggal_akhir` merupakan rentang estimasi ketersediaan barang yang diisi Koperasi ketika order berstatus `menunggu`. |
| 13 | Riwayat harga | Tidak membuat tabel riwayat harga terpisah. Record penerimaan tetap menyimpan harga pada setiap stok masuk sehingga riwayat harga dapat ditelusuri dari data penerimaan. |
| 14 | Istilah pengiriman/penerimaan | Pada rancangan bisnis digunakan istilah **Penerimaan Suku Cadang**. Nama fisik tabel aplikasi dapat tetap `spare_part_shipments` agar kompatibel dengan implementasi yang sudah ada, tetapi tidak boleh dibuat tabel penerimaan kedua yang menduplikasi data. |

---

## 3. Aktor dan Hak Akses Final

### 3.1 Admin

Admin bertanggung jawab atas data master dan pengelolaan akun:

- login ke sistem;
- CRUD user;
- CRUD profil/personel;
- CRUD mekanik;
- CRUD master kategori;
- CRUD master suku cadang;
- mengatur stok minimum;
- melihat laporan administratif;
- melihat riwayat login.

Admin tidak menjalankan transaksi penjualan, verifikasi penerimaan, atau keputusan order operasional kecuali memang diberikan role berbeda.

### 3.2 Front Office

Front Office bertanggung jawab atas kegiatan transaksi dan kontrol stok operasional:

- login ke sistem;
- mencatat transaksi jasa servis;
- mencatat penjualan suku cadang;
- mencetak nota transaksi;
- melihat stok dan notifikasi stok minimum;
- membuat order suku cadang;
- memverifikasi penerimaan suku cadang;
- menerima atau menolak barang berdasarkan jumlah, jenis, dan kondisi;
- membuat return jika barang tidak sesuai atau rusak;
- mengunggah bukti barang rusak/cacat jika diperlukan;
- melihat laporan transaksi, stok, order, dan penerimaan sesuai hak akses.

### 3.3 Koperasi

Koperasi bertanggung jawab atas pemenuhan order:

- login ke sistem;
- melihat order suku cadang dari Front Office;
- mengisi rentang estimasi ketersediaan barang;
- menyetujui atau menolak order;
- mencatat data penerimaan yang akan diverifikasi Front Office;
- menginput `harga_jual` terbaru pada setiap barang masuk;
- mengunggah bukti pengiriman/penyerahan;
- menangani return;
- mencatat pengiriman ulang atau barang pengganti;
- melihat laporan order, status penerimaan, dan return.

### 3.4 Kepala UPJ

Kepala UPJ memiliki akses baca dan pelaporan:

- login ke sistem;
- melihat laporan jasa servis;
- melihat laporan penjualan suku cadang;
- melihat laporan stok suku cadang;
- melihat ringkasan operasional;
- mencetak atau mengekspor laporan yang tersedia.

---

## 4. Alur Logika Sistem Final

## 4.1 Login dan Profil User

1. Admin membuat data `users`.
2. Admin membuat kredensial pada `logins`.
3. Admin membuat satu profil pada `personnels` untuk user tersebut.
4. User login menggunakan `username` dan `password`.
5. Sistem memverifikasi kredensial dan menghasilkan Bearer Token Sanctum.
6. Sistem mencatat aktivitas login ke `login_logs`.
7. Menu ditampilkan berdasarkan `role`.

Ketentuan profil:

- satu user maksimal memiliki satu personel;
- `personnels.user_id` wajib unique;
- personel bukan pengganti user untuk autentikasi atau audit transaksi;
- semua FK petugas transaksi tetap mengarah ke `users.id`;
- profil hanya dapat diedit Admin.

## 4.2 Pengelolaan Master Kategori

1. Admin membuka modul Master Kategori.
2. Admin memasukkan `kode_kategori` dan `nama_kategori`.
3. Sistem memvalidasi keunikan data.
4. Sistem menyimpan data ke `categories`.
5. Data kategori menjadi referensi dropdown pada form Master Suku Cadang.

Kategori tidak boleh lagi diketik bebas pada tabel suku cadang. Tujuannya mencegah variasi penulisan seperti kategori yang sama dengan ejaan berbeda.

## 4.3 Pengelolaan Master Suku Cadang dan Stok

1. Admin memilih kategori dari `categories`.
2. Admin mengisi kode, nama suku cadang, dan satuan.
3. Sistem menyimpan identitas barang ke `spare_parts`.
4. Sistem membuat atau memperbarui satu record stok pada `spare_part_stocks`.
5. Admin menentukan `stok_minimum` pada record stok.

Ketentuan:

- `spare_parts` hanya menyimpan identitas barang yang relatif statis;
- `kategori` tidak disimpan sebagai string;
- `harga_jual` tidak disimpan di `spare_parts`;
- `stok_minimum` tidak disimpan di `spare_parts`;
- satu suku cadang memiliki satu record stok aktif.

## 4.4 Transaksi Jasa Servis dan Penjualan Suku Cadang

1. Front Office membuat transaksi induk pada `transactions`.
2. Nomor nota dibuat unik.
3. Jika terdapat jasa, detail disimpan ke `transaction_services` dan dikaitkan dengan mekanik.
4. Jika terdapat penjualan suku cadang, detail disimpan ke `transaction_spare_parts`.
5. Harga satuan transaksi diambil dari `harga_jual` pada penerimaan terakhir yang:
   - berstatus `disetujui`;
   - sudah diverifikasi;
   - memiliki `harga_jual`;
   - terkait dengan suku cadang yang dijual.
6. Harga tersebut disalin ke `transaction_spare_parts.harga_satuan` agar transaksi lama tidak berubah ketika ada harga penerimaan baru.
7. `total_harga` detail dihitung dari `jumlah × harga_satuan`.
8. Sistem mengurangi `stok_sekarang` dalam transaksi database atomik.
9. Sistem mencetak nota.
10. Setelah stok berkurang, sistem menjalankan pemeriksaan stok minimum secara terpisah.

> Flow penjualan tidak digabung menjadi satu proses input-output dengan order. Penjualan hanya mengurangi stok dan memicu pemeriksaan kondisi stok. Order dibuat melalui proses tersendiri.

## 4.5 Pemeriksaan dan Notifikasi Stok Minimum

Notifikasi tidak disimpan pada tabel khusus.

Logika final:

```text
stok_kritis = stok_sekarang <= stok_minimum
```

Alur:

1. Pemeriksaan dijalankan setelah penjualan, penerimaan, koreksi stok, atau saat dashboard dibuka.
2. Jika stok belum mencapai batas minimum, proses selesai tanpa notifikasi.
3. Jika stok sama dengan atau di bawah batas minimum, sistem menampilkan notifikasi stok minimum kepada Front Office.
4. Front Office dapat membuka form order dari notifikasi tersebut.
5. Notifikasi dapat hilang otomatis setelah stok kembali di atas batas minimum.

## 4.6 Order Suku Cadang

1. Front Office memilih suku cadang dan jumlah.
2. Setiap jenis suku cadang disimpan sebagai satu record `spare_part_orders`.
3. Nilai awal `status` adalah `menunggu`.
4. `tanggal` menyimpan tanggal order dibuat.
5. Koperasi melihat order berstatus `menunggu`.
6. Selama status masih `menunggu`, Koperasi mengisi:
   - `tanggal_awal`: awal estimasi barang tersedia;
   - `tanggal_akhir`: akhir estimasi barang tersedia.
7. Koperasi dapat memberi catatan dan mengambil keputusan:
   - `disetujui`; atau
   - `ditolak`.
8. Waktu keputusan disimpan pada `tanggal_keputusan`.
9. Jika ditolak, `catatan_koperasi` wajib menjelaskan alasan.
10. Jika disetujui, Koperasi dapat melanjutkan ke pencatatan penerimaan/barang masuk.

Ketentuan keranjang multi-item:

- keranjang hanya mekanisme UI;
- backend mengubah setiap item menjadi satu record order;
- tidak dibuat tabel header dan detail order baru;
- pengelompokan satu kali submit dapat dilakukan melalui waktu pembuatan atau reference tambahan jika kelak diperlukan, tetapi bukan bagian struktur final saat ini.

## 4.7 Penerimaan Suku Cadang dan Harga Jual

Istilah bisnis pada DFD adalah **Penerimaan Suku Cadang**. Implementasi fisik yang sudah ada menggunakan `spare_part_shipments`. Keduanya merujuk ke data yang sama.

Alur:

1. Koperasi memilih order yang telah disetujui.
2. Koperasi mencatat jumlah barang.
3. Koperasi menentukan jenis penerimaan:
   - `initial` untuk barang awal;
   - `replacement` untuk barang pengganti.
4. Koperasi menginput `harga_jual` terbaru.
5. Koperasi mengunggah bukti.
6. Record dibuat dengan status `menunggu_verifikasi`.
7. Front Office memeriksa jumlah, jenis, dan kondisi barang.
8. Front Office memilih:
   - setujui; atau
   - tolak dengan catatan dan bukti barang rusak/cacat.
9. Jika disetujui:
   - status menjadi `disetujui`;
   - waktu verifikasi disimpan;
   - stok ditambahkan tepat satu kali;
   - `stock_posted_at` diisi sebagai pengaman idempoten;
   - `harga_jual` pada record ini menjadi kandidat harga aktif terbaru.
10. Jika ditolak:
    - status menjadi `ditolak`;
    - stok tidak bertambah;
    - alasan penolakan disimpan;
    - proses return dibuat.

Ketentuan harga:

- hanya `harga_jual` yang digunakan;
- `harga_beli` dihapus dari struktur final;
- tidak dibuat tabel price history;
- setiap record penerimaan tetap menyimpan harga pada saat stok masuk;
- transaksi lama mempertahankan harga melalui `transaction_spare_parts.harga_satuan`.

Ketentuan relasi petugas:

- petugas Koperasi tetap direkam melalui FK ke `users`;
- petugas Front Office yang memverifikasi tetap direkam melalui FK ke `users`;
- tidak menggunakan FK ke `personnels` pada tabel penerimaan;
- detail nama pegawai, unit kerja, dan posisi dapat diperoleh melalui relasi `users → personnels`.

## 4.8 Return dan Pengiriman Ulang

1. Front Office menolak penerimaan yang tidak sesuai.
2. Sistem menyimpan alasan penolakan.
3. Front Office mengunggah bukti kerusakan/cacat jika diperlukan.
4. Sistem membuat `spare_part_returns` yang terkait dengan order dan penerimaan yang ditolak.
5. Status awal return adalah `menunggu_pengiriman_ulang`.
6. Koperasi memproses barang pengganti.
7. Koperasi mencatat penerimaan baru dengan jenis `replacement`.
8. Bukti pengiriman ulang disimpan pada `shipment_evidences`.
9. Front Office memverifikasi kembali barang pengganti.
10. Jika diterima dan stok telah diposting, return dapat menjadi `selesai`.
11. Jika proses dibatalkan berdasarkan keputusan operasional, status dapat menjadi `dibatalkan`.

---

## 5. Pemetaan Nama DFD dan Nama Fisik Aplikasi

| Nama Logis pada DFD/ERD | Nama Fisik Aplikasi | Catatan Final |
|---|---|---|
| User | `users` | Akun, role, dan status pengguna. |
| Login | `logins` | Username dan password hash. |
| Riwayat Login | `login_logs` | Audit aktivitas login. |
| Personel | `personnels` | Profil satu-ke-satu milik user. |
| Mekanik | `mechanics` | Master mekanik jasa servis. |
| Master Kategori | `categories` | Referensi kategori suku cadang. |
| Master Suku Cadang | `spare_parts` | Identitas barang tanpa harga dan tanpa stok minimum. |
| Stok Suku Cadang | `spare_part_stocks` | Stok real-time dan batas minimum. |
| Transaksi | `transactions` | Header transaksi dan nomor nota. |
| Transaksi Jasa | `transaction_services` | Detail jasa dan mekanik. |
| Transaksi Suku Cadang | `transaction_spare_parts` | Detail barang yang dijual dan harga saat transaksi. |
| Order Suku Cadang | `spare_part_orders` | Satu record untuk satu item order. |
| Penerimaan Suku Cadang | `spare_part_shipments` | Nama fisik dipertahankan untuk kompatibilitas; secara bisnis diperlakukan sebagai penerimaan. |
| Return Suku Cadang | `spare_part_returns` | Return dari penerimaan yang ditolak. |
| Bukti Pengiriman | `shipment_evidences` | Bukti awal, rusak/cacat, atau replacement. |
| Notifikasi Stok Minimum | Tidak memiliki tabel | Dihitung secara real-time dari tabel stok. |
| Nota Transaksi | Output dari transaksi | Bukan tabel terpisah; bersumber dari transaksi dan detailnya. |

---

## 6. Struktur Database Final

## 6.1 Tabel `users`

**Status saat ini:** Sudah Ada  
**Perubahan final:** Tetap digunakan.

| Field | Tipe/Constraint | Keterangan |
|---|---|---|
| `id` | bigint, PK, auto increment | ID user. |
| `nama_user` | string | Nama tampilan akun. |
| `role` | enum/string | `admin`, `front_office`, `koperasi`, `kepala_upj`. |
| `status` | enum/string | `active`, `inactive`. |
| `created_at` | timestamp | Waktu dibuat. |
| `updated_at` | timestamp | Waktu diperbarui. |

Relasi utama:

- hasOne `logins`;
- hasOne `personnels`;
- hasMany `transactions`;
- hasMany `spare_part_orders`;
- hasMany `spare_part_shipments` sebagai penginput/penyerah;
- hasMany `spare_part_shipments` sebagai verifier;
- hasMany `spare_part_returns`;
- hasMany `shipment_evidences`.

## 6.2 Tabel `logins`

**Status saat ini:** Sudah Ada

| Field | Tipe/Constraint | Keterangan |
|---|---|---|
| `id` | bigint, PK | ID login. |
| `user_id` | FK → `users.id`, unique | Satu login untuk satu user. |
| `username` | string, unique | Username autentikasi. |
| `password` | string | Password hash. |
| `remember_token` | nullable | Token kompatibilitas bila masih diperlukan. |
| `created_at` | timestamp | Waktu dibuat. |
| `updated_at` | timestamp | Waktu diperbarui. |

Password hanya disimpan pada `logins`, tidak diduplikasi pada `users`.

## 6.3 Tabel `login_logs`

**Status saat ini:** Sudah Ada

| Field | Tipe/Constraint | Keterangan |
|---|---|---|
| `id` | bigint, PK | ID log. |
| `user_id` | FK/nullable → `users.id` | User yang berhasil dikenali. |
| `username` | string | Username pada percobaan login. |
| `role` | nullable | Role pada saat login. |
| `logged_in_at` | timestamp | Waktu login. |
| `created_at` | timestamp | Waktu dibuat. |
| `updated_at` | timestamp | Waktu diperbarui. |

## 6.4 Tabel `personal_access_tokens`

**Status saat ini:** Sudah Ada

Struktur mengikuti Laravel Sanctum dan tidak perlu dimasukkan sebagai entitas utama pada DFD bisnis karena bersifat teknis autentikasi.

## 6.5 Tabel `personnels`

**Status saat ini:** Belum Terdokumentasi pada implementasi saat ini  
**Perubahan final:** Wajib ditambahkan sebagai modul profil.

| Field | Tipe/Constraint | Keterangan |
|---|---|---|
| `id` | bigint, PK, auto increment | ID personel. |
| `user_id` | FK → `users.id`, unique | Satu profil untuk satu user. |
| `nama_pegawai` | string | Nama lengkap pegawai. |
| `unit_kerja` | string | Unit kerja pegawai. |
| `posisi` | string | Jabatan atau posisi. |
| `created_at` | timestamp | Waktu dibuat. |
| `updated_at` | timestamp | Waktu diperbarui. |

Aturan:

- CRUD hanya oleh Admin;
- data ini tidak menggantikan `users` sebagai pemilik transaksi;
- penghapusan user dapat menghapus personel melalui cascade;
- `user_id` harus unique.

## 6.6 Tabel `mechanics`

**Status saat ini:** Sudah Ada

| Field | Tipe/Constraint | Keterangan |
|---|---|---|
| `id` | bigint, PK | ID mekanik. |
| `mechanic_code` | string(50), nullable/unique | Kode mekanik. |
| `nama_mekanik` | string | Nama mekanik. |
| `status` | string/enum | Aktif atau nonaktif. |
| `created_at` | timestamp | Waktu dibuat. |
| `updated_at` | timestamp | Waktu diperbarui. |

Data mekanik tetap terpisah dari personel.

## 6.7 Tabel `categories`

**Status saat ini:** Belum Terdokumentasi pada implementasi saat ini  
**Perubahan final:** Wajib ditambahkan.

| Field | Tipe/Constraint | Keterangan |
|---|---|---|
| `id` | bigint, PK, auto increment | ID kategori. |
| `kode_kategori` | string, nullable, unique | Kode kategori. |
| `nama_kategori` | string, unique | Nama kategori. |
| `created_at` | timestamp | Waktu dibuat. |
| `updated_at` | timestamp | Waktu diperbarui. |

Relasi: satu kategori memiliki banyak suku cadang.

## 6.8 Tabel `spare_parts`

**Status saat ini:** Sudah Ada tetapi Perlu Penyesuaian

Struktur final:

| Field | Tipe/Constraint | Keterangan |
|---|---|---|
| `id` | bigint, PK | ID suku cadang. |
| `category_id` | FK → `categories.id` | Kategori terpilih dari master kategori. |
| `kode_suku_cadang` | string, unique | Kode suku cadang. |
| `nama_suku_cadang` | string | Nama suku cadang. |
| `satuan` | string | Contoh: pcs, botol, set. |
| `created_at` | timestamp | Waktu dibuat. |
| `updated_at` | timestamp | Waktu diperbarui. |

Perubahan dari implementasi lama:

- hapus `kategori` string;
- tambah `category_id`;
- hapus `harga_jual`;
- tambah `satuan`;
- jangan tambahkan `batas_minimum` pada tabel ini.

## 6.9 Tabel `spare_part_stocks`

**Status saat ini:** Sudah Ada  
**Perubahan final:** Menjadi satu-satunya lokasi stok minimum.

| Field | Tipe/Constraint | Keterangan |
|---|---|---|
| `id` | bigint, PK | ID stok. |
| `spare_part_id` | FK → `spare_parts.id`, unique | Satu record stok per suku cadang. |
| `stok_sekarang` | unsigned integer | Stok real-time. |
| `stok_minimum` | unsigned integer | Ambang notifikasi. |
| `terakhir_diperbarui` | timestamp, nullable | Waktu perubahan stok terakhir. |
| `created_at` | timestamp | Waktu dibuat. |
| `updated_at` | timestamp | Waktu diperbarui. |

## 6.10 Tabel `transactions`

**Status saat ini:** Sudah Ada

| Field | Tipe/Constraint | Keterangan |
|---|---|---|
| `id` | bigint, PK | ID transaksi. |
| `user_id` | FK → `users.id` | Front Office pembuat transaksi. |
| `tanggal` | datetime | Tanggal transaksi. |
| `no_nota` | string, unique | Nomor nota. |
| `catatan` | text, nullable | Catatan transaksi. |
| `created_at` | timestamp | Waktu dibuat. |
| `updated_at` | timestamp | Waktu diperbarui. |

`total_harga` diperlakukan sebagai atribut turunan dari detail jasa dan detail suku cadang, bukan FK dan tidak wajib disimpan pada header.

## 6.11 Tabel `transaction_services`

**Status saat ini:** Sudah Ada

| Field | Tipe/Constraint | Keterangan |
|---|---|---|
| `id` | bigint, PK | ID detail jasa. |
| `transaction_id` | FK → `transactions.id` | Transaksi induk. |
| `mechanic_id` | FK → `mechanics.id` | Mekanik. |
| `nama_jasa` | string | Nama jasa. |
| `biaya_jasa` | decimal(15,2) | Biaya jasa. |
| `keterangan_jasa` | text, nullable | Keterangan. |
| `created_at` | timestamp | Waktu dibuat. |
| `updated_at` | timestamp | Waktu diperbarui. |

## 6.12 Tabel `transaction_spare_parts`

**Status saat ini:** Sudah Ada

| Field | Tipe/Constraint | Keterangan |
|---|---|---|
| `id` | bigint, PK | ID detail penjualan. |
| `transaction_id` | FK → `transactions.id` | Transaksi induk. |
| `spare_part_id` | FK → `spare_parts.id` | Barang yang dijual. |
| `jumlah` | unsigned integer | Jumlah terjual. |
| `harga_satuan` | decimal(15,2) | Snapshot harga pada transaksi. |
| `total_harga` | decimal(15,2) | `jumlah × harga_satuan`. |
| `created_at` | timestamp | Waktu dibuat. |
| `updated_at` | timestamp | Waktu diperbarui. |

## 6.13 Tabel `spare_part_orders`

**Status saat ini:** Sudah Ada tetapi Perlu Penyesuaian

| Field | Tipe/Constraint | Keterangan |
|---|---|---|
| `id` | bigint, PK | ID order. |
| `user_id` | FK → `users.id` | Front Office pembuat order. |
| `spare_part_id` | FK → `spare_parts.id` | Item yang dipesan. |
| `jumlah` | unsigned integer | Jumlah pesanan. |
| `tanggal` | datetime/date | Tanggal order dibuat. |
| `tanggal_awal` | date/datetime, nullable | Awal estimasi ketersediaan. |
| `tanggal_akhir` | date/datetime, nullable | Akhir estimasi ketersediaan. |
| `status` | enum/string | `menunggu`, `disetujui`, `ditolak`. |
| `catatan_fo` | text, nullable | Catatan Front Office. |
| `catatan_koperasi` | text, nullable | Catatan Koperasi. |
| `tanggal_keputusan` | timestamp, nullable | Waktu keputusan. |
| `created_at` | timestamp | Waktu dibuat. |
| `updated_at` | timestamp | Waktu diperbarui. |

Aturan:

- tidak menggunakan dua field `status_order` dan `status`; gunakan satu field `status`;
- saat `menunggu`, Koperasi dapat mengisi `tanggal_awal` dan `tanggal_akhir`;
- satu item keranjang menjadi satu record;
- tidak membuat tabel order detail tambahan.

## 6.14 Tabel `spare_part_shipments`

**Nama logis:** Penerimaan Suku Cadang  
**Status saat ini:** Sudah Ada tetapi Perlu Penyesuaian

| Field Fisik | Padanan DFD | Tipe/Constraint | Keterangan |
|---|---|---|---|
| `id` | `id_penerimaan_suku_cadang` | bigint, PK | ID penerimaan. |
| `spare_part_order_id` | `id_order_suku_cadang` | FK → `spare_part_orders.id` | Order sumber. |
| `shipment_type` | `jenis_penerimaan` | enum | `initial`, `replacement`. |
| `quantity` | `jumlah` | unsigned integer | Jumlah barang. |
| `harga_jual` | `harga_jual` | decimal(12,2) | Harga terbaru dari Koperasi. |
| `status` | `status` | enum | `menunggu_verifikasi`, `disetujui`, `ditolak`. |
| `shipped_by` | `id_user_penyerah` | FK → `users.id` | User Koperasi yang mencatat/menyerahkan. |
| `shipped_at` | waktu input/penyerahan | timestamp | Waktu data dibuat oleh Koperasi. |
| `verified_by` | `id_user_penerima` | FK nullable → `users.id` | User FO yang memverifikasi. |
| `verified_at` | `tanggal_penerimaan` | timestamp, nullable | Waktu barang diterima/diverifikasi FO. |
| `rejection_note` | `catatan_penolakan` | text, nullable | Alasan penolakan. |
| `stock_posted_at` | penanda update stok | timestamp, nullable | Pencegah stok masuk ganda. |
| `created_at` | — | timestamp | Waktu dibuat. |
| `updated_at` | — | timestamp | Waktu diperbarui. |
| `deleted_at` | — | timestamp, nullable | Soft delete. |

Perubahan:

- hapus `harga_beli`;
- jangan menambahkan FK ke `personnels`;
- relasi suku cadang diperoleh melalui `spare_part_order_id → spare_part_id`, sehingga tidak wajib menduplikasi `spare_part_id` pada penerimaan;
- jangan membuat tabel `penerimaan_suku_cadang` kedua selama tabel ini masih digunakan aplikasi.

## 6.15 Tabel `spare_part_returns`

**Status saat ini:** Sudah Ada

| Field | Tipe/Constraint | Keterangan |
|---|---|---|
| `id` | bigint, PK | ID return. |
| `spare_part_order_id` | FK → `spare_part_orders.id` | Order sumber. |
| `spare_part_shipment_id` | FK unique → `spare_part_shipments.id` | Penerimaan yang ditolak. |
| `quantity` | unsigned integer | Jumlah return. |
| `reason` | text | Alasan return. |
| `status` | enum | `menunggu_pengiriman_ulang`, `dikirim_ulang`, `selesai`, `dibatalkan`. |
| `created_by` | FK → `users.id` | Front Office pembuat return. |
| `resolved_by` | FK nullable → `users.id` | Koperasi penyelesai. |
| `resolved_at` | timestamp, nullable | Waktu penyelesaian. |
| `created_at` | timestamp | Waktu dibuat. |
| `updated_at` | timestamp | Waktu diperbarui. |

## 6.16 Tabel `shipment_evidences`

**Status saat ini:** Sudah Ada

| Field | Tipe/Constraint | Keterangan |
|---|---|---|
| `id` | bigint, PK | ID bukti. |
| `spare_part_shipment_id` | FK nullable → `spare_part_shipments.id` | Bukti penerimaan/pengiriman. |
| `spare_part_return_id` | FK nullable → `spare_part_returns.id` | Bukti return. |
| `evidence_type` | enum | `shipment_initial`, `damage_or_defect`, `shipment_replacement`. |
| `storage_disk` | string | Disk penyimpanan. |
| `storage_path` | string, unique | Lokasi file. |
| `original_filename` | string | Nama file asli. |
| `mime_type` | string | MIME file. |
| `size_bytes` | bigint | Ukuran file. |
| `sha256` | char(64), nullable | Hash integritas. |
| `uploaded_by` | FK → `users.id` | User pengunggah. |
| `uploaded_at` | timestamp | Waktu unggah. |
| `created_at` | timestamp | Waktu dibuat. |
| `updated_at` | timestamp | Waktu diperbarui. |

---

## 7. Relasi dan Kardinalitas Final

| Relasi | Kardinalitas | Penjelasan |
|---|---|---|
| `users` → `logins` | 1 : 1 | Satu user mempunyai satu kredensial login. |
| `users` → `personnels` | 1 : 0..1 | Satu user mempunyai maksimal satu profil. |
| `categories` → `spare_parts` | 1 : M | Satu kategori menaungi banyak suku cadang. |
| `spare_parts` → `spare_part_stocks` | 1 : 1 | Satu barang mempunyai satu record stok aktif. |
| `users` → `transactions` | 1 : M | Satu FO dapat membuat banyak transaksi. |
| `transactions` → `transaction_services` | 1 : M | Satu transaksi dapat memiliki banyak jasa. |
| `transactions` → `transaction_spare_parts` | 1 : M | Satu transaksi dapat memiliki banyak item suku cadang. |
| `mechanics` → `transaction_services` | 1 : M | Satu mekanik dapat menangani banyak detail jasa. |
| `spare_parts` → `transaction_spare_parts` | 1 : M | Satu suku cadang dapat muncul dalam banyak transaksi. |
| `spare_parts` → `spare_part_orders` | 1 : M | Satu suku cadang dapat dipesan berkali-kali. |
| `users` → `spare_part_orders` | 1 : M | Satu FO dapat membuat banyak order. |
| `spare_part_orders` → `spare_part_shipments` | 1 : M | Satu order dapat memiliki penerimaan awal dan replacement. |
| `users` → `spare_part_shipments.shipped_by` | 1 : M | User Koperasi dapat mencatat banyak penerimaan. |
| `users` → `spare_part_shipments.verified_by` | 1 : M | User FO dapat memverifikasi banyak penerimaan. |
| `spare_part_shipments` → `spare_part_returns` | 1 : 0..1 | Satu penerimaan yang ditolak memiliki maksimal satu return aktif. |
| `spare_part_returns` → `shipment_evidences` | 1 : M | Satu return dapat memiliki beberapa bukti. |
| `spare_part_shipments` → `shipment_evidences` | 1 : M | Satu penerimaan dapat memiliki beberapa bukti. |

---

## 8. Status Penyelarasan Implementasi

| Modul/Struktur | Kondisi Saat Ini | Target Final | Status |
|---|---|---|---|
| Auth Sanctum | Tercatat sudah aktif | Tetap | **Sudah Ada** |
| User dan Login | Tercatat sudah aktif | Tetap, pastikan password hanya di `logins` | **Sudah Ada / Cek Struktur** |
| Login Log | Tercatat sudah aktif | Tetap | **Sudah Ada** |
| Profil Personel | Tidak tercatat | Tambah `personnels` dan CRUD Admin | **Belum Terdokumentasi** |
| Mekanik | Tercatat sudah aktif | Tetap terpisah dari personel | **Sudah Ada** |
| Master Kategori | Tidak tercatat | Tambah `categories`, controller, menu, dropdown | **Belum Terdokumentasi** |
| Master Suku Cadang | Masih menyimpan kategori string dan harga | Normalisasi kategori, hapus harga, tambah satuan | **Perlu Penyesuaian** |
| Stok Suku Cadang | Sudah ada | `stok_minimum` hanya di tabel stok | **Sudah Ada / Cek Duplikasi** |
| Transaksi | Sudah ada | Pertahankan header dan detail | **Sudah Ada** |
| Order | Sudah ada tanpa field estimasi lengkap | Tambah `tanggal`, `tanggal_awal`, `tanggal_akhir` | **Perlu Penyesuaian** |
| Penerimaan | Sudah ada sebagai shipment | Gunakan harga jual saja dan istilah logis penerimaan | **Perlu Penyesuaian** |
| Return | Sudah ada | Pertahankan | **Sudah Ada** |
| Bukti | Sudah ada | Pertahankan | **Sudah Ada** |
| Notifikasi stok | Widget stok kritis tercatat | Query real-time, tanpa tabel notifikasi | **Sudah Ada / Perlu Diselaraskan** |
| Laporan stok | Tercatat aktif | Pertahankan | **Sudah Ada** |
| Laporan penjualan | Tercatat aktif | Pertahankan | **Sudah Ada** |
| Laporan jasa servis | Tercatat aktif | Pertahankan | **Sudah Ada** |
| Laporan administratif dan operasional lain | Tidak seluruhnya tercatat | Tambahkan bertahap sesuai DFD output | **Belum Lengkap** |

---

## 9. Backend API Final

## 9.1 Controller yang Dipertahankan

- `AuthorizerController`;
- `UserController`;
- `MechanicController`;
- `SparePartController`;
- `TransactionController`;
- `SparePartOrderController`;
- `SparePartShipmentController`;
- `SparePartReturnController`;
- `DashboardController`;
- `ReportController`.

## 9.2 Controller yang Perlu Ditambahkan

### `PersonnelController`

Prefix yang disarankan: `/personnels`

Fungsi:

- list personel;
- create personel;
- show personel;
- update personel;
- delete personel;
- mengambil profil berdasarkan `user_id`.

Akses perubahan hanya role Admin.

### `CategoryController`

Prefix yang disarankan: `/categories`

Fungsi:

- list kategori untuk tabel dan dropdown;
- create kategori;
- update kategori;
- delete kategori dengan validasi apakah masih digunakan suku cadang.

## 9.3 Penyesuaian Controller Suku Cadang

`SparePartController` harus:

- menerima `category_id`, bukan kategori teks;
- menerima `satuan`;
- tidak menerima `harga_jual`;
- membuat record stok jika belum ada;
- menyimpan `stok_minimum` di `spare_part_stocks`;
- mengembalikan relasi kategori dan stok.

## 9.4 Penyesuaian Controller Order

`SparePartOrderController` harus:

- menerima item order satu per satu atau array yang dipecah menjadi banyak record;
- menyimpan `tanggal`;
- menyediakan aksi Koperasi untuk mengisi `tanggal_awal` dan `tanggal_akhir` saat status `menunggu`;
- memvalidasi `tanggal_akhir >= tanggal_awal`;
- menyimpan keputusan dan catatan Koperasi;
- tidak membuat header/detail order baru.

## 9.5 Penyesuaian Controller Penerimaan

`SparePartShipmentController` secara bisnis menangani penerimaan dan harus:

- menerima order yang berstatus disetujui;
- menerima `shipment_type`, `quantity`, dan `harga_jual`;
- tidak lagi menerima atau menyimpan `harga_beli`;
- menyimpan user Koperasi pada `shipped_by`;
- menyimpan user Front Office pada `verified_by`;
- melakukan verifikasi dalam `DB::transaction`;
- menggunakan `lockForUpdate()` pada stok;
- menambah stok hanya ketika status disetujui;
- mengisi `stock_posted_at` satu kali;
- tidak menambah stok ketika penerimaan ditolak;
- menyediakan query harga aktif dari penerimaan terakhir yang disetujui.

## 9.6 Service Harga Aktif

Logika harga aktif harus tersentralisasi agar tidak berbeda antarmodul.

Contoh aturan query:

```text
Ambil spare_part_shipments terbaru
WHERE status = 'disetujui'
  AND verified_at IS NOT NULL
  AND harga_jual IS NOT NULL
  AND order.spare_part_id = barang yang dipilih
ORDER BY verified_at DESC, id DESC
LIMIT 1
```

Catatan: karakter nama field pada kode harus menggunakan `spare_part_id` normal; potongan di atas hanya menjelaskan logika relasi melalui order.

Jika tidak ada harga penerimaan yang valid, sistem tidak boleh diam-diam menggunakan nilai nol. Form penjualan harus menampilkan bahwa harga belum tersedia atau meminta tindakan Admin/Koperasi sesuai prosedur.

## 9.7 Service Notifikasi Stok

Tidak membuat model atau migration `stock_notifications`.

Endpoint dashboard dapat mengambil:

```text
spare_part_stocks
WHERE stok_sekarang <= stok_minimum
```

Respons minimal:

- ID suku cadang;
- kode;
- nama;
- stok sekarang;
- stok minimum;
- selisih kebutuhan;
- tautan/aksi membuat order.

---

## 10. Frontend Final

## 10.1 Modul Admin

### User

Pertahankan `UserList.tsx` untuk:

- nama user;
- role;
- status;
- username;
- password saat create/reset.

### Personel/Profile

Tambahkan halaman seperti `PersonnelList.tsx` atau integrasikan ke detail User.

Field:

- user;
- nama pegawai;
- unit kerja;
- posisi.

Hak edit hanya Admin. User biasa dapat melihat informasi profilnya jika tersedia halaman profil, tetapi tidak dapat mengubahnya.

### Master Kategori

Tambahkan `CategoryList.tsx`:

- kode kategori;
- nama kategori;
- aksi tambah, ubah, hapus.

### Master Suku Cadang

Perbarui `SparePartList.tsx`:

- kategori menggunakan dropdown dari API `categories`;
- field `harga` dihapus;
- field `satuan` ditambahkan;
- stok dan stok minimum dikelola melalui data stok;
- harga aktif hanya ditampilkan sebagai informasi hasil penerimaan terakhir, bukan diedit di master.

## 10.2 Modul Front Office

### Transaksi

- memilih barang hanya jika stok cukup;
- mengambil harga aktif dari penerimaan terakhir;
- menyimpan harga snapshot pada detail transaksi;
- mengurangi stok atomik;
- mencetak nota;
- setelah transaksi, memperbarui indikator stok minimum.

### Order

- notifikasi stok dapat membuka form order;
- keranjang multi-item tetap boleh digunakan;
- submit menghasilkan satu record per item;
- daftar order menampilkan status dan rentang estimasi;
- estimasi ditampilkan sebagai `tanggal_awal – tanggal_akhir`.

### Verifikasi Penerimaan

- menampilkan order, jumlah, jenis penerimaan, harga jual, dan bukti;
- tombol Setujui;
- tombol Tolak dengan catatan wajib;
- unggah bukti rusak/cacat saat penolakan sesuai aturan UI;
- stok hanya berubah setelah Setujui berhasil.

## 10.3 Modul Koperasi

### Keputusan Order

- daftar order menunggu;
- input tanggal awal dan akhir estimasi;
- setujui atau tolak;
- catatan penolakan wajib ketika ditolak.

### Input Penerimaan

- pilih order disetujui;
- pilih jenis `initial` atau `replacement`;
- input jumlah;
- input `harga_jual` terbaru;
- unggah bukti;
- kirim untuk verifikasi FO.

### Return

- melihat return menunggu;
- memproses replacement;
- mengunggah bukti pengiriman ulang;
- memperbarui status return.

## 10.4 Modul Kepala UPJ

- dashboard baca-saja;
- laporan penjualan;
- laporan jasa servis;
- laporan stok;
- ringkasan operasional;
- export PDF/HTML.

---

## 11. Output dan Laporan

## 11.1 Laporan yang Tercatat Sudah Aktif

1. Laporan Stok Suku Cadang.
2. Laporan Penjualan Suku Cadang.
3. Laporan Jasa Servis Motor.

## 11.2 Output DFD yang Perlu Diselaraskan atau Ditambahkan

### Admin

- laporan riwayat login;
- laporan data user;
- laporan data personel;
- laporan data mekanik;
- laporan master kategori;
- laporan master suku cadang.

### Front Office

- nota transaksi;
- notifikasi stok minimum;
- laporan transaksi jasa dan suku cadang;
- laporan stok;
- laporan penerimaan suku cadang.

### Koperasi

- laporan order suku cadang;
- laporan status penerimaan/pengiriman;
- laporan return suku cadang.

### Kepala UPJ

- laporan jasa servis dan produktivitas mekanik;
- laporan penjualan suku cadang;
- laporan stok suku cadang;
- laporan operasional.

Laporan yang belum aktif harus diberi status backlog dan tidak boleh ditulis sebagai sudah selesai sebelum route, controller, template, dan pengujian tersedia.

---

## 12. Ketidaksesuaian DFD yang Harus Mengikuti Keputusan Final

Bagian ini tidak mengubah struktur utama diagram, tetapi menjadi pedoman koreksi label atau field agar rancangan tidak bertentangan dengan implementasi final.

1. **Diagram konteks:** input dan output Master Kategori perlu dicantumkan karena telah ada pada detail input, overview, HIPO, ERD, dan relasi tabel.
2. **Personel pada penerimaan:** jika ERD masih menghubungkan penerimaan ke Personel sebagai penyerah/penerima, hubungan tersebut harus dialihkan ke User. Personel hanya profil user.
3. **Batas minimum:** hapus `batas_minimum` dari Master Suku Cadang pada relasi tabel/ERD. Gunakan `stok_minimum` pada Stok Suku Cadang.
4. **Harga master:** hapus `harga_jual` dari Master Suku Cadang. Harga berada pada Penerimaan Suku Cadang.
5. **Order:** gunakan satu field status saja, yaitu `status`. Jangan menyimpan `status_order` dan `status` sekaligus.
6. **Login:** password disimpan pada Login, bukan diduplikasi pada User.
7. **Transaksi:** `no_nota` adalah atribut unique, bukan foreign key.
8. **Penerimaan:** istilah `Pengiriman Suku Cadang` pada aliran masuk utama perlu dipahami sebagai `Penerimaan Suku Cadang dan Harga Jual`; istilah pengiriman tetap boleh digunakan khusus pada aksi Koperasi dan pengiriman ulang.
9. **Kategori:** Master Suku Cadang harus menerima referensi kategori dari data store Master Kategori.
10. **Notifikasi:** notifikasi stok adalah output perhitungan, bukan data store baru.
11. **Order multi-item:** tidak perlu menambahkan entitas Detail Order karena keputusan final menggunakan satu record per item.
12. **Riwayat harga:** tidak perlu menambahkan entitas Riwayat Harga; data harga tersimpan per penerimaan.
13. **Overview:** input eksternal order, return, dan pengiriman ulang tidak perlu digambar sebagai data store tambahan jika sudah diwakili data store proses.
14. **Detail proses order:** proses Kelola Order seharusnya menghasilkan status/record order dan menjadi sumber proses penerimaan, bukan langsung dianggap sebagai proses laporan stok.
15. **Penerimaan dan replacement:** satu order dapat menghasilkan lebih dari satu record penerimaan karena terdapat penerimaan awal dan barang pengganti.

---

## 13. Urutan Implementasi yang Disarankan

### Prioritas 1 — Struktur Dasar

1. migration dan model `categories`;
2. migration dan model `personnels`;
3. normalisasi `spare_parts`;
4. pastikan `spare_part_stocks.spare_part_id` unique;
5. tambah tanggal order;
6. hapus `harga_beli` dari penerimaan jika sudah tidak digunakan.

### Prioritas 2 — Backend

1. `CategoryController`;
2. `PersonnelController`;
3. update `SparePartController`;
4. update `SparePartOrderController`;
5. update `SparePartShipmentController`;
6. service harga aktif;
7. query notifikasi stok.

### Prioritas 3 — Frontend

1. menu dan form kategori;
2. menu dan form personel;
3. dropdown kategori pada suku cadang;
4. hapus input harga di master;
5. input harga pada penerimaan Koperasi;
6. tampilan estimasi order;
7. profile viewer read-only untuk user bila diperlukan;
8. sinkronisasi istilah Penerimaan pada UI.

### Prioritas 4 — Laporan dan Dokumentasi

1. sesuaikan laporan admin;
2. tambah laporan order, penerimaan, dan return;
3. sesuaikan label DFD;
4. perbarui ERD dan relasi tabel;
5. uji seluruh role.

---

## 14. Kriteria Penerimaan Implementasi

Implementasi dianggap selaras jika seluruh kondisi berikut terpenuhi:

- [ ] User memiliki maksimal satu personel.
- [ ] Personel hanya dapat dikelola Admin.
- [ ] FK petugas transaksi dan penerimaan mengarah ke `users`.
- [ ] Tabel kategori tersedia dan digunakan sebagai dropdown.
- [ ] Tidak ada kategori string bebas pada `spare_parts`.
- [ ] Tidak ada `harga_jual` pada `spare_parts`.
- [ ] Tidak ada `stok_minimum` pada `spare_parts`.
- [ ] `stok_minimum` tersedia pada `spare_part_stocks`.
- [ ] Tidak ada tabel notifikasi stok.
- [ ] Dashboard menampilkan barang dengan `stok_sekarang <= stok_minimum`.
- [ ] Penjualan dan order merupakan proses terpisah.
- [ ] Satu item order disimpan sebagai satu record.
- [ ] Order memiliki `tanggal`, `tanggal_awal`, dan `tanggal_akhir`.
- [ ] Estimasi dapat diisi Koperasi ketika order masih menunggu.
- [ ] Penerimaan menyimpan `harga_jual` dan tidak menyimpan `harga_beli`.
- [ ] Penerimaan ditolak tidak menambah stok.
- [ ] Penerimaan disetujui menambah stok tepat satu kali.
- [ ] Harga transaksi disalin ke detail transaksi.
- [ ] Return terhubung dengan order dan penerimaan yang ditolak.
- [ ] Replacement diverifikasi kembali oleh Front Office.
- [ ] Diagram konteks, overview, detail, ERD, dan relasi tabel menggunakan definisi data yang konsisten.
- [ ] Modul atau laporan yang belum aktif ditandai sebagai backlog, bukan diklaim selesai.

---

## 15. Kesimpulan Final

Arsitektur final mempertahankan sistem yang telah dibangun, tetapi menambahkan dua master penting, yaitu `categories` dan `personnels`. Master suku cadang dinormalisasi agar hanya menyimpan identitas barang. Stok minimum berada pada tabel stok, sedangkan harga jual berasal dari setiap penerimaan yang dicatat Koperasi dan disetujui Front Office.

Proses penjualan, pemeriksaan stok minimum, dan order dipisahkan secara logis. Penjualan mengurangi stok, sistem menghitung kondisi kritis tanpa tabel notifikasi, dan Front Office membuat order melalui proses tersendiri. Setiap item order menjadi satu record. Koperasi mengisi estimasi ketersediaan, mencatat penerimaan dan harga jual, lalu Front Office melakukan verifikasi. Barang yang ditolak masuk ke alur return dan pengiriman ulang.

Tabel `personnels` berfungsi sebagai profil user, tetapi seluruh relasi audit transaksi tetap menuju `users`. Dengan aturan ini, kebutuhan profil dapat dipenuhi tanpa mengubah mekanisme autentikasi dan tanggung jawab user pada transaksi.
