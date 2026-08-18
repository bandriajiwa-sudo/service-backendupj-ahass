import React from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  Package,
  BarChart3,
  ChevronRight,
  ArrowRight,
  Lock,
  Menu,
  X,
  MapPin,
  Phone,
} from "lucide-react";

/* ─── Feature Card Data ─── */
const features = [
  {
    icon: Package,
    title: "Penjualan Suku Cadang",
    description:
      "Pengelolaan stok dan ketersediaan sparepart Honda secara real-time. Pencarian part, pemesanan, dan inventori terpusat dalam satu platform.",
  },
  {
    icon: Wrench,
    title: "Layanan & Riwayat Servis",
    description:
      "Pencatatan riwayat servis kendaraan, estimasi pengerjaan, dan manajemen data mekanik profesional berstandar AHASS.",
  },
  {
    icon: BarChart3,
    title: "Laporan & Integrasi Sistem",
    description:
      "Laporan penjualan dan jasa servis terintegrasi untuk Kepala UPJ beserta analisis performa operasional bengkel.",
  },
];

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Branding */}
            <div className="flex items-center gap-3 shrink-0">
              <img
                src="/logo-blpt.png"
                alt="Logo BLPT DIY"
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Pendidikan_Nasional_%28Indonesia%29.svg";
                }}
              />
              <div className="leading-tight">
                <span className="text-slate-900 font-bold text-sm block">
                  UPJ Otomotif & AHASS
                </span>
                <span className="text-slate-400 text-xs block">BLPT DIY</span>
              </div>
            </div>

            {/* Center: Navigation (Desktop) */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                "Beranda",
                "Katalog Suku Cadang",
                "Layanan Servis",
                "Informasi",
              ].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="px-3.5 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Right: Single Login CTA */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[13px] px-5 py-2.5 rounded-lg transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                Masuk ke Sistem
              </Link>
              <button
                className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 pt-2 border-t border-slate-100">
              {[
                "Beranda",
                "Katalog Suku Cadang",
                "Layanan Servis",
                "Informasi",
              ].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
                >
                  {label}
                </a>
              ))}
              <Link
                to="/login"
                className="block mt-2 mx-4 text-center bg-slate-900 text-white font-semibold text-sm px-5 py-2.5 rounded-lg"
              >
                Masuk ke Sistem
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column */}
            <div className="order-2 lg:order-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 font-medium text-xs px-3 py-1.5 rounded-full mb-6 border border-slate-200">
                <span className="w-1.5 h-1.5 bg-[#D32F2F] rounded-full" />
                Portal Informasi Resmi &bull; UPJ AHASS BLPT DIY
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-slate-900 leading-tight tracking-tight">
                Sistem Informasi Penjualan Suku Cadang & Jasa Servis
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Pengelolaan transaksi dan persediaan suku cadang yang
                terintegrasi, akurat, dan berstandar resmi Honda.
              </p>

              {/* CTA Buttons (Public-facing, NOT login) */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a
                  href="#fitur-layanan"
                  className="inline-flex items-center justify-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-sm transition-all"
                >
                  Cek Katalog Parts
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#fitur-layanan"
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold text-sm px-6 py-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  Lihat Layanan Servis
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Indicator Stats (below text, clean grid) */}
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-extrabold text-slate-900">
                    150+
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                    Jenis Sparepart
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-extrabold text-slate-900">
                    4
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                    Peran Sistem
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-extrabold text-[#D32F2F]">
                    Aktif
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                    Layanan Servis
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="w-full max-w-lg">
                <img
                  src="/ahass_hero.png"
                  alt="Bengkel AHASS BLPT DIY"
                  className="w-full h-64 sm:h-72 lg:h-80 object-cover rounded-2xl shadow-lg border border-slate-100"
                  onError={(e) => {
                    e.currentTarget.src = "/gambar_blpt.png";
                  }}
                />
                <div className="mt-3 text-center">
                  <span className="text-xs text-slate-400 font-medium">
                    Bengkel Resmi Honda AHASS — BLPT Daerah Istimewa Yogyakarta
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURE CARDS ═══════════════════ */}
      <section id="fitur-layanan" className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Fitur Unggulan Sistem
            </h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
              Platform digital pendukung operasional bengkel AHASS BLPT DIY
              secara efisien dan transparan.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#D32F2F] group-hover:text-white transition-colors duration-200">
                  <feature.icon className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Identity */}
            <div className="flex items-center gap-3">
              <img
                src="/logo-blpt.png"
                alt="Logo"
                className="h-8 w-8 object-contain opacity-60"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Pendidikan_Nasional_%28Indonesia%29.svg";
                }}
              />
              <div className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">
                  BLPT Daerah Istimewa Yogyakarta
                </span>
              </div>
            </div>

            {/* Right: Address */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Yogyakarta, DIY
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                UPJ AHASS
              </span>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} UPJ Otomotif & AHASS BLPT DIY
              &mdash; Sistem internal, akses terbatas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
