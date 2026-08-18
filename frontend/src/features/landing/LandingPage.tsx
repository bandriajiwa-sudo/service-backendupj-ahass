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

/* ──────────────────────────────────────────────────────────── */
/* ANIMATION HELPER: Performance-Optimized Particle Network */
/* ──────────────────────────────────────────────────────────── */
const ParticleNetwork: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.className = "absolute inset-0 w-full h-full pointer-events-none z-0";
    canvas.style.opacity = "0.2"; // Sangat tipis/subtle
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    // Colors matching the dark blue/navy background
    const colors = ["#ffffff", "#93c5fd"]; // White & light blue

    const setCanvasSize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
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
        this.size = Math.random() * 1.5 + 0.5; // Very tiny dots
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
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
      const n = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < n; i++) particlesArray.push(new Particle());
    };

    let animationFrameId: number;
    let isVisible = true;

    // Intersection observer to PAUSE animation when not visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isVisible = true;
          animate();
        } else {
          isVisible = false;
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0 },
    );
    observer.observe(container);

    const handleParticles = () => {
      if (!ctx) return;
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 - (d / 120) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!isVisible || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      handleParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    init();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      if (container.contains(canvas)) container.removeChild(canvas);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden" />
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
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden bg-[#0f172a]">
        {/* Rich Blue/Navy Corporate Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#1e326b] to-[#0f172a] z-0" />

        {/* Dynamic Performance Particle Network & Watermark */}
        <ParticleNetwork />

        {/* Faint Govt Watermark Logo */}
        <div className="absolute top-1/2 left-[80%] -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none z-0">
          <img
            src="/logo-blpt.png"
            alt="watermark"
            className="w-[800px] h-auto object-contain drop-shadow-2xl grayscale brightness-200"
          />
        </div>

        {/* Top/Bottom gradient fade to blend into next section */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div className="text-center lg:text-left">
              <FadeInUp delay={0}>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-xs px-3 py-1.5 rounded-full mb-6 tracking-wide shadow-sm">
                  PORTAL RESMI &bull; SISTEM INTERNAL
                </div>
              </FadeInUp>

              <FadeInUp delay={100}>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
                  Sistem Informasi Penjualan Suku Cadang & Jasa Servis
                </h1>
              </FadeInUp>

              <FadeInUp delay={200}>
                <p className="mt-5 text-base sm:text-lg text-blue-100 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Pengelolaan terintegrasi untuk UPJ AHASS BLPT DIY, berstandar
                  resmi Honda.
                </p>
              </FadeInUp>

              <FadeInUp delay={300}>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <a
                    href="#katalog"
                    onClick={(e) => scrollToSection(e, "katalog")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D32F2F] hover:bg-[#b72424] text-white font-bold text-sm px-7 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                  >
                    Katalog Parts
                  </a>
                  <a
                    href="#fitur"
                    onClick={(e) => scrollToSection(e, "fitur")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-7 py-3.5 rounded-lg border border-white/30 backdrop-blur-sm transition-all"
                  >
                    Layanan Servis
                  </a>
                </div>
              </FadeInUp>
            </div>

            {/* Right */}
            <FadeInUp delay={200}>
              <div className="mx-auto w-full max-w-lg lg:max-w-xl relative group">
                {/* Visual Glow behind the video */}
                <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full z-0 pointer-events-none transition-all duration-700 group-hover:bg-blue-400/30" />
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/10 bg-slate-900">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/ahass_hero.png"
                    className="w-full h-auto object-cover aspect-[4/3] scale-105 transition-transform duration-1000 group-hover:scale-100"
                  >
                    <source src="/vidio_3D_blpt_diy.mp4" type="video/mp4" />
                    Gambar Bengkel AHASS
                  </video>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3.B. KATALOG SECTION */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section
        id="katalog"
        className="py-24 bg-gradient-to-br from-[#f4f7fb] to-white relative border-b border-blue-100/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeInUp delay={0}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold text-[#1E3A8A]">
                Modul Katalog & Inventori
              </h2>
              <p className="mt-4 text-slate-600 font-medium leading-relaxed">
                Platform pengelolaan suku cadang terpadu yang memantau alur
                masuk dan keluar barang secara akurat (Order, Return, dan Mutasi
                Stok).
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stok */}
            <FadeInUp delay={100}>
              <div className="bg-gradient-to-b from-blue-50/80 to-[#f8fafd] rounded-2xl p-8 shadow-sm border border-blue-100/60 hover:shadow-xl hover:border-blue-300 transition-all duration-300 relative overflow-hidden group h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500" />
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-md border border-blue-400 overflow-hidden relative">
                  <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
                  <Package className="w-7 h-7 relative z-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">
                  Monitoring Stok
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  Pemantauan ketersediaan suku cadang secara real-time. Terdapat
                  indikator otomatis jika stok mendekati batas minimum untuk
                  keperluan restock.
                </p>
              </div>
            </FadeInUp>

            {/* Order */}
            <FadeInUp delay={200}>
              <div className="bg-gradient-to-b from-blue-50/80 to-[#f8fafd] rounded-2xl p-8 shadow-sm border border-blue-100/60 hover:shadow-xl hover:border-blue-300 transition-all duration-300 relative overflow-hidden group h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500" />
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-md border border-blue-400 overflow-hidden relative">
                  <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
                  <ClipboardList className="w-7 h-7 relative z-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">
                  Manajemen Order
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  Pencatatan faktur Servis dari antrean pendaftaran hingga
                  penagihan ke pelanggan (Front Office), terhubung langsung
                  dengan pengambilan inventori Gudang.
                </p>
              </div>
            </FadeInUp>

            {/* Return */}
            <FadeInUp delay={300}>
              <div className="bg-gradient-to-b from-blue-50/80 to-[#f8fafd] rounded-2xl p-8 shadow-sm border border-blue-100/60 hover:shadow-xl hover:border-blue-300 transition-all duration-300 relative overflow-hidden group h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500" />
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-md border border-blue-400 overflow-hidden relative">
                  <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
                  <AlertTriangle className="w-7 h-7 relative z-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">
                  Retur & Evaluasi
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  Modul pengembalian barang suku cadang cacat/salah ke vendor
                  (Retur Logistik) maupun pembatalan transaksi dengan rekam
                  jejak audit yang jelas.
                </p>
              </div>
            </FadeInUp>
          </div>


        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. FITUR UNGGULAN SISTEM */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section
        id="fitur"
        className="py-24 bg-gradient-to-b from-white to-[#e8eff6]"
      >
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
                <div className="bg-gradient-to-b from-blue-50/80 to-[#f8fafd] border border-blue-100/50 rounded-xl p-7 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 shadow-md rounded-lg flex items-center justify-center text-white mb-6">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
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
        className="py-24 bg-gradient-to-br from-[#e8eff6] via-[#f0f4f9] to-[#d9e4f1] border-t border-blue-200/50"
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
                <div className="bg-gradient-to-b from-blue-50/80 to-[#f8fafd] border border-blue-100/80 rounded-xl p-6 text-center flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 group">
                  <div className="text-3xl font-extrabold text-blue-500/80 group-hover:text-blue-600 transition-colors mb-3">
                    {step.no}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {step.label}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {step.sub}
                  </p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 6. PERAN PENGGUNA */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-t from-[#f8fafc] to-[#d9e4f1]">
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
                <div className="bg-gradient-to-b from-blue-50/80 to-[#f8fafd] border border-blue-100/80 p-7 rounded-xl hover:-translate-y-1 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md shadow-md text-white">
                      <r.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                      {r.role}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {r.tasks.map((task, tidx) => (
                      <li
                        key={tidx}
                        className="flex items-start gap-2 text-sm text-slate-600 font-medium"
                      >
                        <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5 shrink-0" />
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
      <footer className="bg-gradient-to-b from-[#f8fafc] to-slate-200 border-t border-blue-200/50 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">

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
