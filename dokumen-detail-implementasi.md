Spesifikasi Kebutuhan Perangkat Lunak dan Arsitektur Sistem Informasi UPJ Otomotif AHASS BLPT DIY

## Pendahuluan dan Konteks Latar Belakang Operasional
Unit Produksi dan Jasa (UPJ) merupakan ekosistem operasional krusial yang dikelola oleh Balai Latihan Pendidikan Teknik (BLPT) Daerah Istimewa Yogyakarta, yang beroperasi di bawah mandat Seksi Layanan Pendidikan Teknik. Secara spesifik, UPJ Otomotif, yang terafiliasi secara resmi sebagai Astra Honda Authorized Service Station (AHASS), mengemban fungsionalitas ganda. Di satu sisi, unit ini berfungsi sebagai instrumen pendukung proses pendidikan mekanikal presisi; di sisi lain, unit ini merupakan entitas komersial independen yang melayani perbaikan dan perawatan kendaraan roda dua bagi masyarakat umum. Dalam tata kelola finansial dan penetapan harga dasar layanan (HET), operasional UPJ AHASS BLPT DIY diatur secara rigid oleh regulasi pemerintah daerah, yakni Peraturan Gubernur Nomor 1 Tahun 2020 Tentang Tarif Layanan Pada Balai Latihan Pendidikan Teknik.

Dinamika operasional di bengkel AHASS modern melibatkan sirkulasi ratusan pelanggan setiap harinya, yang menuntut keberadaan sistem pengelolaan yang tidak hanya reaktif, melainkan prediktif dan highly-structured. Implementasi sistem yang bertumpu pada pencatatan manual atau semi-digital parsial telah terbukti memicu berbagai disfungsi operasional, mulai dari antrean yang tidak tertib yang mencederai prinsip kelayakan pelayanan konsumen, inefisiensi pengontrolan inventaris suku cadang, hingga hilangnya potensi retensi pelanggan akibat tidak adanya perekaman rekam jejak servis historis. Ketiadaan sistem terintegrasi sering kali memberikan ruang bagi mekanik untuk melakukan pemilihan kendaraan secara subjektif tanpa mematuhi urutan kedatangan asli, sebuah anomali alur kerja yang merugikan pelanggan secara langsung.

Dokumen Product Requirement Document (PRD) versi pertama (PRD_V1.md) ini disusun sebagai cetak biru definitif dan komprehensif bagi tim pengembang perangkat lunak ("antigravity") untuk melakukan rekayasa sistem informasi penjualan suku cadang dan jasa servis berbasis web. Dokumen ini didasarkan pada sintesis arsitektur sistem ideal yang secara empiris terbukti mampu meningkatkan akurasi data operasional hingga menyentuh angka 95% dan mengakselerasi efisiensi alur kerja hingga 40%. Perancangan sistem ini mengadopsi metodologi arsitektur Three-Tier berorientasi objek yang mengisolasi lapisan presentasi pengguna, logika bisnis aplikasi, dan manajemen basis data secara absolut. Melalui pembedahan mendalam terhadap Diagram Konteks, Data Flow Diagram (DFD), Entity Relationship Diagram (ERD), dan Flowchart alur kerja yang ada, spesifikasi ini dirancang untuk meminimalisasi ambiguitas teknis dan memastikan skalabilitas jangka panjang.

## Dekomposisi Aktor dan Matriks Hak Akses (Role-Based Access Control)
Sistem Informasi Penjualan Suku Cadang dan Jasa Service Berbasis Web ini dikelilingi oleh empat entitas pengguna utama yang berinteraksi secara asinkron dalam satu ekosistem tersentralisasi. Setiap aktor memiliki parameter kewenangan yang dibatasi oleh matriks Create, Read, Update, Delete (CRUD) yang ketat demi menjaga integritas data dan mencegah manipulasi operasional.

1. **Admin**: Bertindak sebagai pemegang kendali data fundamental atau data master. Admin memiliki otorisasi penuh untuk melakukan operasi masukan (Input) terhadap `Data_User` (mengelola kredensial pegawai atau pengguna sistem lainnya), `Data_Master_Suku_Cadang` (mendefinisikan katalog inventori, kode unik, dan harga dasar), serta `Data_Mekanik` (mencatat profil teknisi yang akan dialokasikan pada setiap pekerjaan). Admin memastikan bahwa seluruh parameter dasar sistem selalu relevan dengan kondisi fisik di lapangan.
2. **Front Office / Service Advisor beserta Kasir**: Merupakan ujung tombak operasional harian dan mengeksekusi volume transaksi tertinggi. Front Office berwenang mencatat `Data_Transaksi_Jasa_Servis` dan `Data_Transaksi_Suku_Cadang` ketika pelanggan datang, memproses pencetakan `Nota_Transaksi`, serta bertanggung jawab melakukan pengawasan stok secara proaktif. Ketika sistem memancarkan `Notifikasi_Stok_Minimum`, Front Office diwajibkan menyusun dan mengajukan `Data_Order_Suku_Cadang` kepada pihak otorisator logistik.
3. **Koperasi**: Bertindak sebagai otoritas logistik dan finansial internal yang mengelola suplai barang. Koperasi menerima pengajuan `Data_Order_Suku_Cadang` dari Front Office dan memiliki kebebasan prosedural untuk menyetujui atau menolak pengajuan tersebut beserta `Catatan_Penolakan`. Apabila disetujui dan barang tiba dari penyuplai, Koperasi mengeksekusi pemasukan `Data_Penerimaan_Suku_Cadang` untuk memverifikasi kedatangan fisik barang sebelum sistem mengonversi data tersebut menjadi pembaruan pada tabel stok nyata.
4. **Kepala UPJ**: Menduduki puncak hierarki manajerial. Kepala UPJ tidak berpartisipasi dalam transaksi operasional atau modifikasi data CRUD harian. Kewenangan Kepala UPJ bersifat representatif dan analitikal (hanya Read), di mana entitas ini bertugas mengonsumsi hasil keluaran (Output) dari proses sistem, seperti `Laporan_Penjualan_Suku_Cadang`, `Laporan_Jasa_dan_Produktivitas_Mekanik`, serta `Laporan_Stok_Suku_Cadang`. Akses dasbor Kepala UPJ difokuskan pada pemantauan metrik kinerja utama (KPI) guna menentukan strategi bisnis UPJ ke depan dan mendukung audit akuntabilitas.

### Matriks Modul Basis Data dan Fungsionalitas

| Modul Basis Data dan Fungsionalitas | Admin | Front Office | Koperasi | Kepala UPJ |
|---|---|---|---|---|
| **Manajemen Pengguna & Mekanik** | CRUD | R | R | R |
| **Katalog Master Suku Cadang** | CRUD | R | R | R |
| **Inventaris & Stok Fisik** | R | R (Trigger Order) | CRU (Update Receipt) | R |
| **Pencatatan Work Order / Jasa Servis** | R | CRU | - | R |
| **Transaksi Suku Cadang Pelanggan** | R | CRU | - | R |
| **Manajemen Pemesanan (Order) Stok** | R | CRU (Ajukan) | RU (Approve/Reject) | R |
| **Validasi Penerimaan Barang (GR)** | R | R | CRU | R |
| **Pembuatan Laporan & Cetak Nota** | R (Log) | C (Cetak Nota) | R (Laporan Order) | R (Full Reporting) |

> **Catatan Eksekusi:** Matriks di atas menuntut implementasi otentikasi berbasis token (seperti JWT) di mana role dari tabel User akan mendikte visibilitas elemen antarmuka (UI conditional rendering) dan proteksi endpoint API pada lapis peladen (server-side route protection).

## Arsitektur Basis Data Relasional: Normalisasi dan Spesifikasi Entitas
Fondasi dari kestabilan sistem inventori berskala industri dan sistem manajemen bengkel terletak pada perancangan model relasional (Entity Relationship Diagram) yang solid. Arsitektur basis data harus mengeliminasi redundansi data dengan mematuhi prinsip normalisasi bentuk ketiga (3NF), serta menggunakan konstrain kunci asing (foreign key constraints) untuk menegakkan integritas referensial. Berdasarkan Conceptual Data Model dan cetak biru ERD yang disepakati, berikut adalah penjabaran teknis mendalam mengenai tabel-tabel yang wajib dikonstruksi pada subsistem manajemen UPJ AHASS BLPT DIY.

### Entitas Autentikasi dan Otorisasi (Security Domain)
Perancangan ini secara eksplisit memisahkan profil pengguna dari kredensial login mereka, sebuah taktik arsitektural yang melindungi kata sandi dari kueri pemanggilan data profil umum.

#### Tabel User
Menyimpan identitas personal dan penugasan struktural dari entitas yang mengoperasikan sistem.

| Nama Field | Tipe Data SQL | Konstrain & Properti | Analisis Fungsi & Logika Bisnis |
|---|---|---|---|
| `Id_User` | VARCHAR(36) | Primary Key, Not Null | Menggunakan UUIDv4 (Universal Unique Identifier) untuk mencegah enumerasi ID oleh pihak yang tidak berwenang, memberikan lapisan keamanan obscurity. |
| `Nama_User` | VARCHAR(150) | Not Null | Menyimpan nama lengkap pegawai. Data ini akan tercetak pada Nota Transaksi untuk tujuan pertanggungjawaban kasir. |
| `Role` | ENUM | Not Null | Menentukan level otorisasi sistematik. Nilai yang diizinkan meliputi: 'ADMIN', 'FRONT_OFFICE', 'KOPERASI', 'KEPALA_UPJ'. Parameter ini memetakan operasi CRUD di backend. |

#### Tabel Login
Berfokus murni pada mekanisme otentikasi sesi. Terdapat relasi One-to-One (1:1) antara entitas `User` dan `Login`.

| Nama Field | Tipe Data SQL | Konstrain & Properti | Analisis Fungsi & Logika Bisnis |
|---|---|---|---|
| `Id_Login` | VARCHAR(36) | Primary Key, Not Null | Pengidentifikasi sesi otentikasi unik. |
| `Username` | VARCHAR(50) | Unique, Not Null | Kredensial unik untuk proses masuk sistem. |
| `Password` | VARCHAR(255) | Not Null | Wajib mengimplementasikan algoritma hashing kriptografis satu arah (seperti Argon2id atau bcrypt) dengan integrasi salt. Dilarang keras menyimpan sandi dalam format plain-text. |
| `Id_User` | VARCHAR(36) | Foreign Key, Unique | Merujuk pada `Id_User` di tabel User. Eksekusi aturan ON DELETE CASCADE harus diterapkan agar penghapusan pegawai secara presisi mencabut akses otentikasinya. |

#### Tabel Mekanik
Didedikasikan untuk merekam data teknisi operasional di lapangan. Mekanik merupakan entitas independen yang mungkin tidak membutuhkan akses login ke dalam sistem secara langsung, namun identitas mereka wajib ditautkan pada setiap tindakan transaksional servis.

| Nama Field | Tipe Data SQL | Konstrain & Properti | Analisis Fungsi & Logika Bisnis |
|---|---|---|---|
| `Id_Mekanik` | VARCHAR(36) | Primary Key, Not Null | Identifier teknisi. |
| `Nama_Mekanik` | VARCHAR(150) | Not Null | Nama lengkap teknisi yang krusial untuk pelaporan Produktivitas Mekanik yang diakses oleh Kepala UPJ. Data ini menentukan penghitungan insentif kinerja. |

### Entitas Manajemen Inventarisasi Logistik (Inventory Domain)
Pengolahan data suku cadang (sparepart) memerlukan akurasi absolut guna mencegah kebocoran finansial dan menjamin kelancaran layanan perbaikan. Perancangan ERD memisahkan antara entitas master (katalog) dengan entitas kuantitas dinamis (stok). Relasi antara Master Suku Cadang dan Stok Suku Cadang digambarkan sebagai One-to-One (1:1).

#### Tabel Master_Suku_Cadang
Mendefinisikan entri katalog global yang diregistrasi oleh Admin.

| Nama Field | Tipe Data SQL | Konstrain & Properti | Analisis Fungsi & Logika Bisnis |
|---|---|---|---|
| `Id_Master_Suku_Cadang` | VARCHAR(36) | Primary Key, Not Null | Kunci utama sistematis. |
| `Kode_Suku_Cadang` | VARCHAR(50) | Unique, Not Null | Parameter esensial yang merepresentasikan Part Number resmi Honda Genuine Parts (HGP). Berguna untuk sinkronisasi pesanan dengan supplier. |
| `Nama_Suku_Cadang` | VARCHAR(200) | Not Null | Deskripsi komponen secara harfiah. |
| `Kategori` | VARCHAR(100) | Not Null | Kategorisasi fungsional, krusial untuk filterisasi UI, seperti Fast Moving, Slow Moving, Oli, Aksesoris, atau Material Kimia. |
| `Harga_Jual` | DECIMAL(15,2)| Not Null | Valuasi moneter yang mengikat kepada harga konsumen (HET). Menggunakan DECIMAL untuk menjamin kepresisian kalkulasi perpajakan dan menghindari anomali floating point. |

#### Tabel Stok_Suku_Cadang
Bertindak sebagai buku besar kuantitas fisik yang berfluktuasi seiring terjadinya penerimaan (GR) dan penjualan.

| Nama Field | Tipe Data SQL | Konstrain & Properti | Analisis Fungsi & Logika Bisnis |
|---|---|---|---|
| `Id_Stok_Suku_Cadang` | VARCHAR(36) | Primary Key, Not Null | Identifier fungsional baris stok. |
| `Id_Master_Suku_Cadang` | VARCHAR(36) | Foreign Key, Unique | Kaitan referensial tunggal ke master katalog. ON DELETE RESTRICT diaplikasikan untuk mencegah penghapusan histori barang. |
| `Stok_Sekerang` | INT | Not Null, Default 0 | Residu kuantitas inventori. Sebuah fungsi trigger atau Stored Procedure di basis data wajib menolak mutasi jika nilai dipaksa menuju digit negatif. |
| `Stok_Minimum` | INT | Not Null | Ambang batas kritis. Setiap kali ada perubahan, logika aplikasi membandingkan nilai dengan Stok_Minimum untuk menerbitkan Notifikasi. |
| `Terakhir_Diperbarui` | TIMESTAMP | Not Null | Parameter krusial untuk penelusuran audit forensik. |

### Entitas Alur Rantai Pasok Internal (Supply Chain Domain)
Alur kerja inventaris berawal dari Order oleh Front Office, hingga persetujuan dan pengesahan kedatangan oleh Koperasi.

#### Tabel Order_Suku_Cadang
Mengkapsulasi niat pembelian ulang barang operasional.

| Nama Field | Tipe Data SQL | Konstrain & Properti | Analisis Fungsi & Logika Bisnis |
|---|---|---|---|
| `Id_order_suku_cadang`| VARCHAR(36) | Primary Key, Not Null | Identifier dokumen permintaan resmi internal bengkel. |
| `Id_User` | VARCHAR(36) | Foreign Key, Not Null | Merujuk pada personil Front Office yang menginisiasi pengajuan. |
| `Tanggal` | DATETIME | Not Null | Stempel kronologis saat permintaan diciptakan ke dalam sistem. |
| `Status_Order` | ENUM | Not Null | Pengelolaan state-machine proses: MENUNGGU, DISETUJUI, atau DITOLAK. |
| `Catatan_Penolakan` | TEXT | Nullable | Jika Koperasi mengubah state menjadi DITOLAK, anotasi wajib diisi untuk umpan balik. |
| `Jumlah` | INT | Not Null | Kuantitas agregat suku cadang yang diproyeksikan untuk dibeli. |

#### Tabel Penerimaan_Suku_Cadang
Mengunci validasi legal dari perpindahan fisik barang dari distributor ke dalam wilayah yurisdiksi penyimpanan Koperasi bengkel.

| Nama Field | Tipe Data SQL | Konstrain & Properti | Analisis Fungsi & Logika Bisnis |
|---|---|---|---|
| `Id_Penerimaan_Suku_Cadang`| VARCHAR(36)| Primary Key, Not Null | ID dokumen Goods Receipt (GR). |
| `Id_Order_Suku_Cadang` | VARCHAR(36)| Foreign Key, Not Null | Menautkan penerimaan fisik ke dokumen inisiasi permintaan. |
| `Id_Master_Suku_Cadang`| VARCHAR(36)| Foreign Key, Not Null | Parameter referensial komponen presisi yang diinspeksi. |
| `Status_Penerimaan` | ENUM | Not Null | Menyajikan dua keluaran: DISETUJUI atau DITOLAK. |
| `Tanggal` | DATETIME | Not Null | Waktu kedatangan logistik. |
| `Jumlah` | INT | Not Null | Besaran unit fisik yang tervalidasi. Akan ditambahkan pada Stok_Sekerang jika disetujui. |
| `Catatan_Penolakan` | TEXT | Nullable | Laporan diskrepansi logistik. |

### Entitas Penjualan Lintas Fungsional (Transactional Domain)
Sistem merajut kompleksitas transaksi bengkel. ERD mengilustrasikan sebuah header Transaksi yang bercabang menjadi dua detail ledger, yakni Transaksi_Jasa dan Transaksi_Suku_Cadang.

#### Tabel Transaksi
Berfungsi sebagai payung makro yang membingkai interaksi komersial dengan satu pelanggan pada satu entitas waktu.

| Nama Field | Tipe Data SQL | Konstrain & Properti | Analisis Fungsi & Logika Bisnis |
|---|---|---|---|
| `Id_Transaksi` | VARCHAR(36) | Primary Key, Not Null | Rekam pusat Work Order atau pesanan pelanggan agregat. |
| `No_Nota` | VARCHAR(50) | Unique, Not Null | String auto-generated yang dicetak pada dokumen thermal kasir (misal: INV-26072026-001). |
| `Tanggal` | DATETIME | Not Null | Titik temporal penyelesaian transaksi yang dikunci oleh Front Office. |
| `Id_User` | VARCHAR(36) | Foreign Key, Not Null | Jejak audit akuntabilitas untuk mengetahui Kasir yang memproses pembayaran. |

#### Tabel Transaksi_Jasa
Melakukan kodifikasi atas tenaga kerja manusia (insentif teknisi) dan kategori kesulitan perbaikan (tarif perbaikan).

| Nama Field | Tipe Data SQL | Konstrain & Properti | Analisis Fungsi & Logika Bisnis |
|---|---|---|---|
| `Id_Transaksi_Jasa`| VARCHAR(36)| Primary Key, Not Null| Identifier untuk baris rincian tarif mekanikal. |
| `Id_Transaksi` | VARCHAR(36)| Foreign Key, Not Null| Menambatkan jasa kepada dokumen nota induk pelanggan. |
| `Id_Mekanik` | VARCHAR(36)| Foreign Key, Not Null| Relasi kritis untuk menghitung metrik Laporan_Jasa_dan_Produktivitas_Mekanik. |
| `Nama_Jasa` | VARCHAR(150)| Not Null | Judul layanan yang dikerjakan, merepresentasikan level perawatan. |
| `Keterangan_Jasa` | TEXT | Nullable | Berisi ringkasan keluhan konsumen dan log observasi diagnostik dari mekanik. |
| `Biaya_Jasa` | DECIMAL(15,2)| Not Null | Beban finansial yang ditanggungkan pada konsumen berdasarkan struktur hierarki tarif. |

#### Tabel Transaksi_Suku_Cadang
Elemen dekremental dalam rantai sistem inventori. Modul ini menjembatani perpindahan hak milik komponen dan melakukan reduksi otomasi pada jumlah gudang.

| Nama Field | Tipe Data SQL | Konstrain & Properti | Analisis Fungsi & Logika Bisnis |
|---|---|---|---|
| `Id_Transaksi_Suku_Cadang`| VARCHAR(36) | Primary Key, Not Null| ID fungsional baris perpindahan barang pelanggan. |
| `Id_Transaksi` | VARCHAR(36) | Foreign Key, Not Null| Pengelompokan komponen ke dalam satu nota tagihan komprehensif. |
| `Id_Master_Suku_Cadang` | VARCHAR(36) | Foreign Key, Not Null| Resolusi referensi Part Number untuk ekstraksi HET terkini. |
| `Jumlah` | INT | Not Null, > 0 | Kuantitas Part Number tunggal yang dikonsumsi kendaraan tersebut. |
| `Harga_Satuan` | DECIMAL(15,2)| Not Null | Snapshot harga pokok eceran pada titik ekuilibrium transaksi. |
| `Total_Harga` | DECIMAL(15,2)| Not Null | Komputasi deterministik: Jumlah dikalikan dengan Harga_Satuan. |

## Orketrasi Logika Bisnis: Manajemen Antrean dan Integrasi Kupon Perawatan Berkala (KPB)
UPJ AHASS BLPT DIY harus mampu mengakomodasi verifikasi komputasional terhadap Kupon Perawatan Berkala (KPB) 1 hingga 4 guna mencegah hangusnya garansi mesin dan memastikan pelanggan menerima subsidi layanan gratis. Tim pengembang wajib membangun mesin aturan (Rule Engine) di dalam Backend Service untuk memproses logika subsidi servis berkala secara otomasi.

* **Validasi Klaim KPB 1**: Parameter kelayakan terpenuhi jika Odometer ≤ 1.000 KM ATAU durasi kalender bulan ≤ 2 bulan sejak Tanggal_Pembelian. Bila syarat boolean ini TRUE, sistem mengintervensi kalkulasi nota: entri `Transaksi_Jasa.Biaya_Jasa` diubah menjadi Nihil (Rp 0), dan `Transaksi_Suku_Cadang` untuk komponen oli tidak akan diakumulasi ke dalam tagihan akhir (gratis).
* **Validasi Klaim KPB 2, 3, dan 4**: KPB 2 (≤ 4.000 KM / 4 bulan); KPB 3 (≤ 8.000 KM / 8 bulan); KPB 4 (≤ 12.000 KM / 12 bulan). Program tahap lanjut ini hanya memberikan subsidi absolut berupa `Biaya_Jasa` gratis, sementara komponen seperti radiator coolant, busi, dan kampas rem akan menghasilkan `Total_Harga` komersial yang normal.

Sistem pendaftaran antrean dibangun di atas algoritma First In First Out (FIFO) berbasis antrean antarmuka *Queue Management*. Mekanik dilarang keras meninjau dan memilih formulir kerja di luar urutan array antrean harian. Modul pengelolaan jadwal diinspeksi oleh paramater `Nama_Jasa` guna merekayasa percabangan *Pit Express* (perawatan minor fast-moving berdurasi kurang dari 15 menit).

## Dekonstruksi Alur Proses Fungsional Berdasarkan Data Flow Diagram dan Flowchart
Alur sistem terpetakan ke dalam lima tahapan sinkronisasi modular utama:

### Modul 1: Proses Transaksi Pelayanan Pelanggan dan Resolusi Nota
Customer Journey dimulai saat konsumen meletakkan kunci motor di meja Front Office. Petugas menyisipkan `Data_Transaksi_Jasa_Servis` dan `Data_Transaksi_Suku_Cadang`. Mesin komputasi merangkum biaya, menghasilkan cetakan `Nota_Transaksi`, dan secara simultan merujuk ke instruksi Kurangi Stok Suku Cadang, menciptakan integrasi instan tanpa delay.

### Modul 2: Modul Pemantauan Defisit dan Alarm Notifikasi Cerdas
Sebuah eksekusi komputasional Proses Cek Stok Minimum dan Kirim Notifikasi dibangkitkan setiap kali basis data melakukan prosedur persilangan pengeluaran. Jika Stok < Batas Minimum, trigger merakit data notifikasi dan menyuplainya ke lapisan presentasi Front Office untuk memberi tahu ketersediaan menipis.

### Modul 3: Inisiasi Logistik Pemesanan Suku Cadang Terintegrasi
Dipicu oleh notifikasi di Modul 2, petugas Front Office mengekstrak daftar barang yang kritis ke dalam sebuah permohonan pesanan terpusat (`Data_Order_Suku_Cadang`). Pengesahan dari Koperasi digerakkan oleh alur percabangan yang dapat menghasilkan status absolut `Ditolak + Catatan` atau berlanjut ke pengadaan fisik dengan status `Disetujui`.

### Modul 4: Prosedur Verifikasi Penerimaan Barang dan Rekonsiliasi Logistik Mutlak
Tahap di mana entitas digital berinkarnasi kembali menjadi obyek material. Otoritas Koperasi melakukan prosedur audit masukan. Jika kejanggalan ditemukan, Status Penerimaan diatur menjadi `Ditolak + Catatan`. Jika positif, status menjadi `Disetujui`, komputasi melakukan operasi akumulasi mutlak ke ranah `Stok_Sekerang` di inventori, dan `Laporan_Status_Penerimaan` ditembakkan ke Front Office.

### Modul 5: Agregasi Kecerdasan Bisnis dan Pelaporan Tingkat Eksekutif
Kepala UPJ dibekali dashboard yang menyajikan big picture. Sistem menyajikan pilar-pilar pelaporan berbentuk Export PDF fungsional: `Laporan Jasa Servis dan Produktivitas Mekanik`, `Laporan Penjualan Suku Cadang`, dan `Laporan Stok Suku Cadang`.

## Desain Skalabilitas Lanjutan, Keamanan Kriptografis, dan Interaksi Antarmuka
Lapisan User Interface (UI) selayaknya didefinisikan dengan framework Frontend berbasis komponen seperti ReactJS atau VueJS, mengandalkan komunikasi pertukaran JSON dengan RESTful API pada backend (menggunakan arsitektur Three Tier PHP/Node.JS). Aplikasi menuntut keandalan Single Page Application (SPA) dengan respons interaktif.

Pertahanan akses difasilitasi melalui mekanisme penguncian JSON Web Token (JWT) yang merujuk kepada klasifikasi atribut `Role`. Token stateless tersebut menolak peretasan dan memastikan sesi transaksi kasir Front Office terekam secara independen dengan `Id_User` terkait.

Strategi keandalan database query mengharuskan pemanfaatan mekanisme Transaction Control Language (TCL) `BEGIN TRANSACTION` dan `COMMIT`. Jika salah satu pemotongan stok berhadapan dengan constraint kegagalan, modul penanganan rollback otomatis menggagalkan keseluruhan batch pencatatan suku cadang beserta `Biaya_Jasa` terkait.