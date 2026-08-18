import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import { apiClient } from "../../lib/api";
import { useAuth } from "../../app/AuthContext";
import styles from "./Login.module.css";
// Dynamic Particle Network Background Component
const ParticleNetwork: React.FC = () => {
  useEffect(() => {
    const canvas = document.getElementById(
      "particleCanvas",
    ) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    const colors = ["#0f2c4a", "#1d4ed8", "#38bdf8"]; // Navy, Blue, Light Blue

    // Resize canvas
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
        this.size = Math.random() * 3 + 1.5; // Slightly larger nodes
        this.speedX = Math.random() * 1.5 - 0.75; // Slightly faster network
        this.speedY = Math.random() * 1.5 - 0.75;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce edges
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
      // Increase density by dividing by a smaller number
      const numberOfParticles = Math.floor(
        (canvas.width * canvas.height) / 7000,
      );
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };

    const handleParticles = () => {
      if (!ctx) return;
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();

        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Increase connection distance radius
          if (distance < 160) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(15, 44, 74, ${0.15 - (distance / 160) * 0.15})`;
            ctx.lineWidth = 1; // Thicker lines
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

    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);

  return <canvas id="particleCanvas" className={styles.particleCanvas} />;
};

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { checkAuth, login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await apiClient.post("/authorizer/login", {
        username,
        password,
      });

      if (response.data.success) {
        const token = response.data.data.token;
        const user = response.data.data.user;
        const role = response.data.data.role as string;

        login(user, token);
        await checkAuth(); // Pull full user context with bearer now attached

        // Redirect based on role explicitly for UX
        switch (role) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "front_office":
            navigate("/front-office/dashboard");
            break;
          case "koperasi":
            navigate("/koperasi/dashboard");
            break;
          case "kepala_upj":
            navigate("/kepala-upj/dashboard");
            break;
          default:
            navigate("/");
            break;
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Nama pengguna atau kata sandi salah.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* LEFT PANEL - Branding */}
      <div className={styles.leftPanel}>
        {/* Background Video Layer */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className={styles.videoBackground}
          src="/vidio_3D_blpt_diy.mp4"
        ></video>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/40 z-[1]"></div>

        {/* Content Layer */}
        <div className="relative flex flex-col justify-center items-center md:items-start text-center md:text-left h-full px-8 md:px-12 lg:px-16 z-10">
          {/* Placeholder for the Logo, loaded from the public folder */}
          <img
            src="/logo-blpt.png"
            alt="Logo Pemda / Instansi"
            className="w-24 md:w-32 h-auto mb-8 md:mb-10 object-contain drop-shadow-md mx-auto md:mx-0"
            onError={(e) => {
              // Fallback gracefully if logo is not yet placed
              e.currentTarget.src =
                "https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Pendidikan_Nasional_%28Indonesia%29.svg";
            }}
          />

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight md:leading-snug max-w-2xl drop-shadow-lg">
            SISTEM INFORMASI PENJUALAN SUKU CADANG DAN JASA SERVIS
          </h1>
          <h3 className="text-xl md:text-2xl font-bold text-blue-400 mt-4 tracking-wide drop-shadow-md">
            UPJ Otomotif & AHASS BLPT DIY
          </h3>

          <div className="mt-8 bg-black/30 backdrop-blur-md rounded-xl p-5 border border-white/10 shadow-2xl max-w-xl">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              <strong className="text-white text-base font-semibold tracking-wide">
                Sistem Internal - Akses Terbatas
              </strong>
            </div>
            <p className="text-sm text-blue-100/90 leading-relaxed font-medium">
              Sistem ini digunakan secara khusus untuk operasional internal
              instansi. Hanya entitas teregistrasi yang dapat masuk.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Login Form */}
      <div className={styles.rightPanel}>
        <ParticleNetwork />

        <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full relative z-10 my-8">
          <div className="text-center">
            <h2 className="text-gray-900 font-bold text-2xl mb-1">
              Masuk ke Sistem
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Gunakan akun yang telah diberikan oleh administrator.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.formGroup}>
              <label>Nama Pengguna</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="Masukkan nama pengguna"
                  className="w-full bg-white border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl py-2.5 px-3.5 transition-all text-sm outline-none text-gray-800"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Kata Sandi</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  className="w-full bg-white border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl py-2.5 px-3.5 transition-all text-sm outline-none text-gray-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.rememberMe}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Ingat saya
              </label>
              <button
                type="button"
                className={styles.forgotPassword}
                onClick={() =>
                  Swal.fire({
                    icon: "info",
                    title: "Lupa Password?",
                    text: "Silahkan Hubungi Admin UPJ AHHAS BLPT DIY Untuk Mereset Password Anda",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#3085d6",
                  })
                }
              >
                Lupa kata sandi?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !username || !password}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl w-full shadow-lg shadow-blue-500/25 transition-all"
            >
              {isSubmitting ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Sistem internal UPJ AHASS BLPT DIY &bull; Akses terbatas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
