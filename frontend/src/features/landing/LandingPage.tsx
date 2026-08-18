import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Lock,
  Package,
  Wrench,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  ClipboardList,
  Cpu,
  MonitorCheck,
  AlertTriangle,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────── */
/* ANIMATION HELPER: Fade In Up */
/* ──────────────────────────────────────────────────────────── */
const FadeInUp: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setIsVisible(true);
      });
    });
    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
    <div className="min-h-screen bg-white font-sans text-slate-600 selection:bg-[#1E3A8A] selection:text-white overflow-x-hidden">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. NAVBAR */}
      {/* ──────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="/logo-blpt.png"
                alt="Logo BLPT DIY"
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Pendidikan_Nasional_%28Indonesia%29.svg";
                }}
              />
              <div className="leading-tight">
                <span className="text-slate-800 font-bold text-sm block">
                  UPJ Otomotif & AHASS BLPT DIY
                </span>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-6">
              <a
                href="#"
                className="text-sm font-medium text-slate-600 hover:text-[#1E3A8A] transition-colors"
              >
                Beranda
              </a>
              <a
                href="#katalog"
                onClick={(e) => scrollToSection(e, "katalog")}
                className="text-sm font-medium text-slate-600 hover:text-[#1E3A8A] transition-colors"
              >
                Katalog Suku Cadang
              </a>
              <a
                href="#fitur"
                onClick={(e) => scrollToSection(e, "fitur")}
                className="text-sm font-medium text-slate-600 hover:text-[#1E3A8A] transition-colors"
              >
                Layanan Sistem
              </a>
              <a
                href="#alur"
                onClick={(e) => scrollToSection(e, "alur")}
                className="text-sm font-medium text-slate-600 hover:text-[#1E3A8A] transition-colors"
              >
                Alur & Peran
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden sm:inline-flex flex-row items-center gap-2 bg-[#1E3A8A] hover:bg-[#152c6b] text-white font-medium text-[13px] px-5 py-2 rounded-full transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                Masuk ke Sistem
              </Link>
              <button
                className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
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

          {mobileMenuOpen && (
            <div className="lg:hidden py-3 border-t border-slate-100 bg-white">
              <div className="flex flex-col gap-1 px-2">
                <a
                  href="#"
                  className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#1E3A8A] rounded-md"
                >
                  Beranda
                </a>
                <a
                  href="#katalog"
                  onClick={(e) => scrollToSection(e, "katalog")}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#1E3A8A] rounded-md"
                >
                  Katalog Suku Cadang
                </a>
                <a
                  href="#fitur"
                  onClick={(e) => scrollToSection(e, "fitur")}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#1E3A8A] rounded-md"
                >
                  Layanan Sistem
                </a>
                <a
                  href="#alur"
                  onClick={(e) => scrollToSection(e, "alur")}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#1E3A8A] rounded-md"
                >
                  Alur & Peran
                </a>
                <div className="h-px bg-slate-100 my-2" />
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full bg-[#1E3A8A] text-white font-medium text-sm px-4 py-2.5 rounded-full"
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
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div className="text-center lg:text-left">
              <FadeInUp delay={0}>
                <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 font-semibold text-xs px-3 py-1.5 rounded-md mb-6 tracking-wide">
                  PORTAL RESMI &bull; SISTEM INTERNAL
                </div>
              </FadeInUp>

              <FadeInUp delay={100}>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                  Sistem Informasi Penjualan Suku Cadang & Jasa Servis
                </h1>
              </FadeInUp>

              <FadeInUp delay={200}>
                <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Pengelolaan terintegrasi untuk UPJ AHASS BLPT DIY, berstandar
                  resmi Honda.
                </p>
              </FadeInUp>

              <FadeInUp delay={300}>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <a
                    href="#katalog"
                    onClick={(e) => scrollToSection(e, "katalog")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#D32F2F] font-semibold text-sm px-7 py-3 rounded-md border-2 border-[#D32F2F] hover:bg-[#D32F2F] hover:text-white transition-all"
                  >
                    Katalog Parts
                  </a>
                  <a
                    href="#fitur"
                    onClick={(e) => scrollToSection(e, "fitur")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold text-sm px-7 py-3 rounded-md border-2 border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    Layanan Servis
                  </a>
                </div>
              </FadeInUp>
            </div>

            {/* Right */}
            <FadeInUp delay={200}>
              <div className="mx-auto w-full max-w-lg lg:max-w-xl">
                <img
                  src="/ahass_hero.png"
                  alt="Bengkel AHASS BLPT DIY"
                  className="w-full h-auto rounded-2xl object-cover shadow-sm border border-slate-100"
                  onError={(e) => {
                    e.currentTarget.src = "/gambar_blpt.png";
                  }}
                />
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. INDIKATOR KUNCI */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Package, stat: "150+", title: "Jenis Sparepart" },
              { icon: Users, stat: "4", title: "Peran Sistem" },
              {
                icon: CheckCircle2,
                stat: "Layanan Aktif",
                title: "Operasional Servis",
              },
              {
                icon: Building2,
                stat: "1 Unit Terdaftar",
                title: "AHASS BLPT DIY",
              },
            ].map((item, idx) => (
              <FadeInUp key={idx} delay={idx * 100}>
                <div className="bg-white rounded-lg p-5 border border-slate-200 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-md flex shrink-0 items-center justify-center bg-slate-100 text-slate-600">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900">
                      {item.stat}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                      {item.title}
                    </div>
                  </div>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. FITUR UNGGULAN SISTEM */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section id="fitur" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp delay={0}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900">
                Fitur Unggulan Sistem
              </h2>
              <p className="mt-4 text-slate-600">
                Infrastruktur digital pendukung layanan bengkel AHASS secara
                profesional.
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ClipboardList,
                title: "Manajemen Real-time",
                desc: "Digitalisasi pencatatan suku cadang dan tagihan jasa servis pelanggan.",
              },
              {
                icon: AlertTriangle,
                title: "Kontrol Stok",
                desc: "Pantauan visual jika stok di gudang mulai menipis menuju ambang batas.",
              },
              {
                icon: ShieldCheck,
                title: "Hak Akses Spesifik",
                desc: "Antarmuka dan modul diatur eksklusif berdasarkan tanggung jawab pengguna.",
              },
              {
                icon: BarChart3,
                title: "Laporan & Riwayat",
                desc: "Analitik menyeluruh terkait performa penjualan harian dan jejak pengerjaan mekanik.",
              },
            ].map((f, i) => (
              <FadeInUp key={i} delay={i * 100}>
                <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-600 mb-5">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 5. ALUR KERJA SISTEM */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section
        id="alur"
        className="py-24 bg-slate-50 border-t border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp delay={0}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900">
                Alur Kerja Sistem
              </h2>
              <p className="mt-4 text-slate-600">
                Skema langkah pemrosesan data, dari pintu pendaftaran hingga
                pengarsipan laporan.
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {[
              { no: "01", label: "Pelanggan Datang", sub: "Ke Pendaftaran" },
              { no: "02", label: "Input Transaksi", sub: "Front Office" },
              {
                no: "03",
                label: "Cek & Alokasi Stok",
                sub: "Koperasi / Gudang",
              },
              { no: "04", label: "Selesai Servis", sub: "Mekanik" },
              { no: "05", label: "Laporan & Rekap", sub: "Admin / Kepala UPJ" },
            ].map((step, idx) => (
              <FadeInUp key={idx} delay={idx * 150}>
                <div className="bg-white border border-slate-200 rounded-lg p-5 text-center flex flex-col items-center justify-center hover:border-slate-300 hover:shadow-sm transition-all duration-300">
                  <div className="text-xl font-extrabold text-slate-300 mb-2">
                    {step.no}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {step.label}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{step.sub}</p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 6. PERAN PENGGUNA */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp delay={0}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900">
                Peran Pengguna
              </h2>
              <p className="mt-4 text-slate-600">
                Wewenang dan fungsi masing-masing pihak.
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                role: "Front Office",
                tasks: [
                  "Input transaksi",
                  "Buka Service Order",
                  "Cetak nota tagihan",
                  "Cek ketersediaan stok",
                ],
                icon: MonitorCheck,
              },
              {
                role: "Gudang (Koperasi)",
                tasks: [
                  "Terima pengiriman barang",
                  "Update jumlah stok",
                  "Data harga beli",
                  "Kelola stok opname",
                ],
                icon: Package,
              },
              {
                role: "Mekanik",
                tasks: [
                  "Tarik antrean servis",
                  "Update status progres",
                  "Ajukan request parts",
                  "Selesaikan pengerjaan",
                ],
                icon: Wrench,
              },
              {
                role: "Admin & UPJ",
                tasks: [
                  "Kelola entitas akun",
                  "Sistem laporan pusat",
                  "Rekap Jasa & Sparepart",
                  "Monitoring master",
                ],
                icon: Cpu,
              },
            ].map((r, i) => (
              <FadeInUp key={i} delay={i * 100}>
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <r.icon className="w-5 h-5 text-slate-700" />
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
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 shrink-0" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 7. FOOTER & NOTICE ACCESS */}
      {/* ──────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-100 border-t border-slate-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-start">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/logo-blpt.png"
                  alt="Logo BLPT"
                  className="h-10 w-auto opacity-70 grayscale"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div>
                  <h4 className="text-slate-900 font-bold text-sm">
                    UPJ Otomotif & AHASS — BLPT DIY
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daerah Istimewa Yogyakarta
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-md p-5 text-sm flex gap-3 text-slate-600">
              <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <strong className="text-slate-900 block mb-1">
                  Sistem Internal - Akses Terbatas
                </strong>
                Sistem ini digunakan secara khusus untuk operasional internal
                instansi. Hanya entitas teregistrasi yang dapat masuk.
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 text-center md:text-left text-xs text-slate-500">
            &copy; {new Date().getFullYear()} BLPT Daerah Istimewa Yogyakarta.
            Seluruh hak cipta dilindungi undang-undang.
          </div>
        </div>
      </footer>
    </div>
  );
}
