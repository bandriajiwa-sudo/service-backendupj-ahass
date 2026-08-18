import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  Package,
  BarChart3,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

/* ──────────────────────────────────────────────────────
   Particle Network Background (re-used from Login page)
   ────────────────────────────────────────────────────── */
const ParticleNetwork: React.FC = () => {
  useEffect(() => {
    const canvas = document.getElementById(
      "landingParticleCanvas",
    ) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    const colors = ["#0f2c4a", "#1d4ed8", "#38bdf8"];

    const setCanvasSize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener("resize", setCanvasSize);
    setCanvasSize();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 1;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = Math.random() * 0.8 - 0.4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const init = () => {
      particlesArray = [];
      const n = Math.floor((canvas.width * canvas.height) / 12000);
      for (let i = 0; i < n; i++) particlesArray.push(new Particle());
    };

    const handleParticles = () => {
      if (!ctx) return;
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(15, 44, 74, ${0.08 - (d / 140) * 0.08})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      handleParticles();
      requestAnimationFrame(animate);
    };

    init();
    animate();
    return () => window.removeEventListener("resize", setCanvasSize);
  }, []);

  return (
    <canvas
      id="landingParticleCanvas"
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.45 }}
    />
  );
};

/* ──────────────────────────────────────────────────────
   Feature Card Data
   ────────────────────────────────────────────────────── */
const features = [
  {
    icon: Package,
    title: "Penjualan Suku Cadang",
    description:
      "Integrasi stok ketersediaan sparepart Honda secara real-time. Pencarian part, pemesanan, dan pengelolaan inventori dalam satu platform.",
    color: "from-red-500 to-rose-600",
    iconBg: "bg-red-50 text-red-600",
    border: "border-red-100",
  },
  {
    icon: Wrench,
    title: "Jasa Servis Otomotif",
    description:
      "Pencatatan riwayat servis motor, estimasi pengerjaan, dan manajemen data mekanik profesional berstandar AHASS.",
    color: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-50 text-blue-600",
    border: "border-blue-100",
  },
  {
    icon: BarChart3,
    title: "Manajemen & Laporan",
    description:
      "Pantauan transaksi real-time, laporan penjualan & jasa terintegrasi untuk Kepala UPJ beserta analisis performa bengkel.",
    color: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-100",
  },
];

/* ──────────────────────────────────────────────────────
   Main Landing Page Component
   ────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col relative overflow-hidden">
      {/* ─── HEADER / NAVBAR ─── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
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
              <div className="hidden sm:block leading-tight">
                <span className="text-[#0F172A] font-bold text-sm block">
                  UPJ Otomotif & AHASS
                </span>
                <span className="text-gray-500 text-xs block">BLPT DIY</span>
              </div>
            </div>

            {/* Center: Navigation Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                "Beranda",
                "Layanan Servis",
                "Katalog Suku Cadang",
                "Informasi",
              ].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="px-3.5 py-2 text-sm font-medium text-gray-600 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Right: CTA + Mobile Menu */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-500/30 hover:-translate-y-0.5"
              >
                Masuk ke Sistem
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
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

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 pt-1 border-t border-gray-100 animate-fadeIn">
              {[
                "Beranda",
                "Layanan Servis",
                "Katalog Suku Cadang",
                "Informasi",
              ].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#D32F2F] hover:bg-red-50 rounded-lg transition-all"
                >
                  {label}
                </a>
              ))}
              <Link
                to="/login"
                className="block mt-2 mx-4 text-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-md transition-all"
              >
                Masuk ke Sistem
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative flex-1">
        {/* Particle Network Background */}
        <div className="absolute inset-0 overflow-hidden">
          <ParticleNetwork />
        </div>

        {/* Decorative accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-red-50 via-rose-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 opacity-70 z-0" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-50 via-indigo-50 to-transparent rounded-full translate-y-1/3 -translate-x-1/4 opacity-60 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column: Text Content */}
            <div className="order-2 lg:order-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-[#D32F2F] font-semibold text-xs px-3.5 py-1.5 rounded-full mb-6">
                <span className="w-2 h-2 bg-[#D32F2F] rounded-full animate-pulse" />
                Sistem Terintegrasi
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
                SISTEM INFORMASI{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D32F2F] to-[#CC0000]">
                  PENJUALAN SUKU CADANG
                </span>{" "}
                DAN JASA SERVIS
              </h1>

              <h2 className="mt-4 text-lg sm:text-xl font-bold text-[#2563EB] tracking-wide">
                UPJ Otomotif & AHASS BLPT DIY
              </h2>

              <p className="mt-5 text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Pengelolaan Transaksi dan Persediaan Suku Cadang yang
                Terintegrasi, Akurat, dan Mudah Dipantau.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-xl shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/35 hover:-translate-y-0.5"
                >
                  Masuk ke Akun
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#fitur-layanan"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#D32F2F] font-bold text-sm px-7 py-3.5 rounded-xl border-2 border-[#D32F2F]/20 hover:border-[#D32F2F]/40 hover:bg-red-50 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                >
                  Lihat Katalog Suku Cadang
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs font-bold">✓</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    Data Realtime
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">✓</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    Terintegrasi
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 text-xs font-bold">✓</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    Berstandar AHASS
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image Card */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                {/* Glow effect behind card */}
                <div className="absolute -inset-4 bg-gradient-to-r from-red-200/40 via-rose-200/30 to-blue-200/40 rounded-3xl blur-2xl opacity-60 z-0" />

                <div className="relative bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 overflow-hidden z-10">
                  {/* Red accent bar */}
                  <div className="h-1.5 bg-gradient-to-r from-[#D32F2F] via-[#CC0000] to-[#D32F2F]" />

                  <img
                    src="/ahass_hero.png"
                    alt="Bengkel AHASS BLPT DIY"
                    className="w-full h-64 sm:h-72 lg:h-80 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/gambar_blpt.png";
                    }}
                  />

                  {/* Caption overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5">
                    <span className="text-white text-sm font-bold drop-shadow-lg">
                      Bengkel Resmi Honda AHASS — BLPT DIY
                    </span>
                    <br />
                    <span className="text-white/80 text-xs">
                      Daerah Istimewa Yogyakarta
                    </span>
                  </div>
                </div>

                {/* Floating stat cards */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 z-20 animate-float">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Stok Parts
                  </div>
                  <div className="text-lg font-extrabold text-[#0F172A]">
                    150+{" "}
                    <span className="text-green-500 text-xs font-bold">↑</span>
                  </div>
                </div>
                <div
                  className="absolute -top-3 -right-3 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 z-20 animate-float"
                  style={{ animationDelay: "1.5s" }}
                >
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Servis
                  </div>
                  <div className="text-lg font-extrabold text-[#D32F2F]">
                    Aktif{" "}
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE CARDS SECTION ─── */}
      <section
        id="fitur-layanan"
        className="relative z-10 bg-white border-t border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          {/* Section Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-slate-100 text-[#0F172A] font-semibold text-xs px-3.5 py-1.5 rounded-full mb-4">
              Fitur Unggulan
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Layanan Sistem Terintegrasi
            </h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Platform digital untuk mendukung operasional bengkel AHASS BLPT
              DIY secara efisien dan transparan.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl border ${feature.border} p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
              >
                {/* Gradient accent top */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <div
                  className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>

                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-[#2563EB] transition-colors">
                  Selengkapnya
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 bg-[#0F172A] border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo-blpt.png"
                alt="Logo"
                className="h-8 w-8 object-contain opacity-80"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Pendidikan_Nasional_%28Indonesia%29.svg";
                }}
              />
              <div className="text-sm">
                <span className="text-slate-400">
                  Sistem internal UPJ AHASS BLPT DIY
                </span>
                <span className="text-slate-600 mx-2">&bull;</span>
                <span className="text-slate-500">Akses terbatas</span>
              </div>
            </div>
            <Link
              to="/login"
              className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
            >
              Masuk ke Akun
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} BLPT Daerah Istimewa Yogyakarta.
              Hak cipta dilindungi undang-undang.
            </p>
          </div>
        </div>
      </footer>

      {/* ─── GLOBAL KEYFRAMES ─── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
