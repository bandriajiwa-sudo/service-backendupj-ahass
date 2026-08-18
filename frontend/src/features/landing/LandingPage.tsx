import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Lock,
  Package,
  Wrench,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  ClipboardList,
  Cpu,
  MonitorCheck,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-600 selection:bg-blue-100 selection:text-blue-900">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. NAVBAR */}
      {/* ──────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/logo-blpt.png"
                alt="Logo BLPT DIY"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Pendidikan_Nasional_%28Indonesia%29.svg";
                }}
              />
              <div className="leading-tight">
                <span className="text-slate-900 font-bold text-sm block">
                  UPJ Otomotif & AHASS
                </span>
                <span className="text-slate-500 text-xs font-medium block">
                  BLPT DIY
                </span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 xl:gap-2">
              <a
                href="#"
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Beranda
              </a>
              <a
                href="#katalog"
                onClick={(e) => scrollToSection(e, "katalog")}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Katalog Suku Cadang
              </a>
              <a
                href="#fitur"
                onClick={(e) => scrollToSection(e, "fitur")}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Layanan Sistem
              </a>
              <a
                href="#alur"
                onClick={(e) => scrollToSection(e, "alur")}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Alur & Peran
              </a>
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-[0.75rem] shadow-sm transition-all"
              >
                <Lock className="w-4 h-4" />
                Masuk ke Sistem
              </Link>
              <button
                className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-slate-100 bg-white">
              <div className="flex flex-col gap-1 px-2">
                <a
                  href="#"
                  className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                >
                  Beranda
                </a>
                <a
                  href="#katalog"
                  onClick={(e) => scrollToSection(e, "katalog")}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                >
                  Katalog Suku Cadang
                </a>
                <a
                  href="#fitur"
                  onClick={(e) => scrollToSection(e, "fitur")}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                >
                  Layanan Sistem
                </a>
                <a
                  href="#alur"
                  onClick={(e) => scrollToSection(e, "alur")}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                >
                  Alur & Peran
                </a>
                <div className="h-px bg-slate-100 my-2" />
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-semibold text-sm px-4 py-2.5 rounded-[0.75rem] shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  Masuk ke Sistem
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. HERO SECTION */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left */}
            <div className="text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-4 py-1.5 rounded-full mb-6 shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Portal Informasi Resmi &bull; UPJ AHASS BLPT DIY
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                Sistem Informasi Penjualan Suku Cadang & Jasa Servis
              </h1>

              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Pengelolaan transaksi dan persediaan suku cadang yang
                terintegrasi, akurat, dan berstandar resmi Honda.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="#katalog"
                  onClick={(e) => scrollToSection(e, "katalog")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-7 py-3.5 rounded-[0.75rem] shadow-sm transition-all"
                >
                  Cek Katalog Parts
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#fitur"
                  onClick={(e) => scrollToSection(e, "fitur")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold text-base px-7 py-3.5 rounded-[0.75rem] border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  Lihat Layanan Servis
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-xl">
              <div className="bg-white p-2 rounded-[1.25rem] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100">
                <img
                  src="/ahass_hero.png"
                  alt="Bengkel AHASS BLPT DIY"
                  className="w-full h-auto rounded-xl object-cover aspect-[4/3]"
                  onError={(e) => {
                    e.currentTarget.src = "/gambar_blpt.png";
                  }}
                />
                <div className="mt-3 mb-1 text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Bengkel Resmi Honda AHASS &mdash; BLPT Daerah Istimewa
                    Yogyakarta
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. STATISTIK RINGKAS */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-t border-b border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Package,
                color: "blue",
                stat: "150+",
                title: "Jenis Sparepart",
                desc: "Terdaftar dalam katalog",
              },
              {
                icon: Users,
                color: "purple",
                stat: "4",
                title: "Peran Sistem",
                desc: "Front Office, Gudang, Mekanik, Admin",
              },
              {
                icon: CheckCircle2,
                color: "green",
                stat: "Aktif",
                title: "Layanan Servis",
                desc: "Beroperasi setiap hari kerja",
              },
              {
                icon: Building2,
                color: "orange",
                stat: "1",
                title: "Unit AHASS Terdaftar",
                desc: "BLPT Daerah Istimewa Yogyakarta",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[1rem] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 flex items-start gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-full flex shrink-0 items-center justify-center bg-${item.color}-100 text-${item.color}-600`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {item.stat}
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-1">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. FITUR UNGGULAN SISTEM */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section id="fitur" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Fitur Unggulan Sistem
            </h2>
            <p className="mt-4 text-slate-600">
              Dirancang untuk mendukung operasional bengkel AHASS secara
              efisien, akurat, dan saling terintegrasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ClipboardList,
                title: "Manajemen Transaksi Real-time",
                desc: "Pencatatan transaksi suku cadang dan jasa servis secara langsung dan akurat.",
              },
              {
                icon: AlertTriangle,
                title: "Kontrol Stok Otomatis",
                desc: "Sistem memberikan indikator visual saat stok suku cadang mendekati batas minimum.",
              },
              {
                icon: ShieldCheck,
                title: "Multi-Peran & Hak Akses",
                desc: "Setiap pengguna memiliki antarmuka khusus sesuai tanggung jawab posisinya.",
              },
              {
                icon: BarChart3,
                title: "Laporan & Riwayat Servis",
                desc: "Rekap transaksi dan riwayat servis tersimpan rapi dan mudah ditelusuri pimpinan.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200 rounded-[1rem] p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-blue-600 mb-5 shadow-sm">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 5. ALUR KERJA SISTEM */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section
        id="alur"
        className="py-20 bg-slate-50 border-t border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Alur Kerja Sistem
            </h2>
            <p className="mt-4 text-slate-600">
              Sinkronisasi operasional dari lini depan hingga pelaporan akhir
              bengkel.
            </p>
          </div>

          <div className="relative">
            {/* Desktop line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />

            <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-4">
              {[
                { no: 1, label: "Pelanggan Datang", sub: "Ke Pendaftaran" },
                { no: 2, label: "Input Transaksi", sub: "(Front Office)" },
                {
                  no: 3,
                  label: "Cek & Alokasi Stok",
                  sub: "(Koperasi / Gudang)",
                },
                { no: 4, label: "Servis Dikerjakan", sub: "(Mekanik)" },
                { no: 5, label: "Laporan & Rekap", sub: "(Admin / UPJ)" },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex md:flex-col items-center justify-start md:justify-center gap-4 text-left md:text-center"
                >
                  <div className="w-12 h-12 shrink-0 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center text-blue-600 font-extrabold shadow-sm">
                    {step.no}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {step.label}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {step.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 6. PERAN PENGGUNA */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Peran Pengguna dalam Sistem
            </h2>
            <p className="mt-4 text-slate-600">
              Setiap entitas memiliki wewenang spesifik untuk kelancaran
              transaksi harian.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                role: "Front Office",
                tasks: [
                  "Input transaksi baru",
                  "Buka Service Order",
                  "Cetak nota tagihan",
                  "Cek ketersediaan stok",
                ],
                icon: MonitorCheck,
              },
              {
                role: "Gudang (Koperasi)",
                tasks: [
                  "Terima stok barang DO",
                  "Update ketersediaan parts",
                  "Riwayat & Log harga beli",
                  "Kelola stok opname",
                ],
                icon: Package,
              },
              {
                role: "Mekanik",
                tasks: [
                  "Follow-up antrean servis",
                  "Update status pengerjaan",
                  "Ajukan kebutuhan parts",
                  "Selesaikan order mekanik",
                ],
                icon: Wrench,
              },
              {
                role: "Admin & Kepala UPJ",
                tasks: [
                  "Kelola akun pengguna",
                  "Laporan riwayat terpusat",
                  "Rekap Jasa & Sparepart",
                  "Pantauan indikator utama",
                ],
                icon: Cpu,
              },
            ].map((r, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200 p-6 rounded-[1rem]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <r.icon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    {r.role}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {r.tasks.map((task, tidx) => (
                    <li
                      key={tidx}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <CheckSquare className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 7. NOTICE KEAMANAN & 8. FOOTER (Combined in Bottom Layer) */}
      {/* ──────────────────────────────────────────────────────────── */}

      <section className="bg-slate-100 py-12 px-4 border-t border-slate-200">
        <div className="max-w-3xl mx-auto bg-white border-l-4 border-blue-600 rounded-lg shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-full shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Sistem Internal — Akses Terbatas
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sistem ini digunakan secara spesifik untuk operasional internal
                pegawai UPJ AHASS BLPT DIY. Login hanya dapat dilakukan
                menggunakan kredensial akun yang telah didaftarkan dan diberikan
                oleh administrator sistem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navy */}
      <footer className="bg-[#0f172a] text-slate-400 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src="/logo-blpt.png"
                alt="Logo BLPT"
                className="h-10 w-auto opacity-90 brightness-[200] grayscale"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div>
                <h4 className="text-white font-bold text-base">
                  UPJ Otomotif & AHASS — BLPT DIY
                </h4>
                <p className="text-xs mt-1">Daerah Istimewa Yogyakarta</p>
              </div>
            </div>
            <div className="text-center md:text-right text-xs max-w-sm">
              <p>
                &copy; {new Date().getFullYear()} BLPT Daerah Istimewa
                Yogyakarta. Seluruh hak cipta dilindungi undang-undang.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
