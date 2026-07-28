import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Wrench,
  Package,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { apiClient } from "../../lib/api";
import styles from "./FODashboard.module.css";

interface DashboardStats {
  transaksiHariIni: number;
  layananJasa: number;
  sukuCadangTerjual: number;
  stokMinimum: number;
}

interface ChartData {
  label: string;
  total: number;
  [key: string]: any;
}

interface CriticalStock {
  id: number | string;
  namaPart: string;
  stokSaatIni: number;
  batasMinimum: number;
}

const FODashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    transaksiHariIni: 0,
    layananJasa: 0,
    sukuCadangTerjual: 0,
    stokMinimum: 0,
  });

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [criticalStocks, setCriticalStocks] = useState<CriticalStock[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // Formatted state mapping for dropdowns to API params
  const [chartTime, setChartTime] = useState("mingguan");
  const [chartCategory, setChartCategory] = useState("all");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [chartTime, chartCategory]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [statsRes, stockRes] = await Promise.all([
        apiClient.get("/dashboard/stats"),
        apiClient.get("/dashboard/critical-stock"),
      ]);

      if (statsRes.data?.data) {
        setStats({
          transaksiHariIni: statsRes.data.data.transaksiHariIni || 0,
          layananJasa: statsRes.data.data.layananJasa || 0,
          sukuCadangTerjual: statsRes.data.data.sukuCadangTerjual || 0,
          stokMinimum: statsRes.data.data.stokMinimum || 0,
        });
      }

      if (Array.isArray(stockRes.data?.data)) {
        setCriticalStocks(
          stockRes.data.data.map((item: any) => ({
            id: item.id,
            namaPart: item.namaPart || item.nama_suku_cadang,
            stokSaatIni:
              item.stokSaatIni ||
              item.stok_sekarang ||
              item.stock?.stok_sekarang,
            batasMinimum:
              item.batasMinimum ||
              item.stok_minimum ||
              item.stock?.stok_minimum,
          })),
        );
      }
    } catch (err) {
      console.error("Gagal mendapatkan data dashboard awal:", err);
      setIsError(true);
    } finally {
      // Set isLoading false once initial mount stats are done
      // The chart will finish concurrently or separately
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await apiClient.get(
        `/dashboard/chart?category=${chartCategory}&period=${chartTime}`,
      );
      if (res.data?.data && Array.isArray(res.data.data)) {
        setChartData(res.data.data);
      }
    } catch (err) {
      console.error("Gagal mendapatkan data chart:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}></div>

      {isError && (
        <div className="bg-white p-5 rounded-lg border border-gray-200 animate-fade-in-up animation-delay-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default mb-6">
          <div className="flex justify-between items-start mb-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700 ml-3">
              Gagal menghubungi server. Menampilkan data fallback.
            </p>
          </div>
        </div>
      )}

      <div className={styles.metricsGrid}>
        <div className={`${styles.metricCard} animate-fade-in-up animation-delay-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default`}>
          <div className={styles.metricHeader}>
            <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
              <ShoppingCart size={20} />
            </div>
            <span className={styles.metricLabel}>Transaksi Hari Ini</span>
          </div>
          <h3 className={styles.metricValue}>
            {isLoading ? "..." : stats.transaksiHariIni}
          </h3>
          <p className={styles.metricSubtext}>Dihitung dari nota baru</p>
        </div>

        <div className={`${styles.metricCard} animate-fade-in-up animation-delay-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default`}>
          <div className={styles.metricHeader}>
            <div className={`${styles.iconWrapper} ${styles.iconGreen}`}>
              <Wrench size={20} />
            </div>
            <span className={styles.metricLabel}>Layanan Jasa</span>
          </div>
          <h3 className={styles.metricValue}>
            {isLoading ? "..." : stats.layananJasa}
          </h3>
          <p className={styles.metricSubtext}>Dilayani mekanik hari ini</p>
        </div>

        <div className={`${styles.metricCard} animate-fade-in-up animation-delay-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default`}>
          <div className={styles.metricHeader}>
            <div className={`${styles.iconWrapper} ${styles.iconIndigo}`}>
              <Package size={20} />
            </div>
            <span className={styles.metricLabel}>Suku Cadang Terjual</span>
          </div>
          <h3 className={styles.metricValue}>
            {isLoading ? "..." : stats.sukuCadangTerjual}
          </h3>
          <p className={styles.metricSubtext}>Item terjual hari ini</p>
        </div>

        <div className={`${styles.metricCard} animate-fade-in-up animation-delay-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default`}>
          <div className={styles.metricHeader}>
            <div className={`${styles.iconWrapper} ${styles.iconOrange}`}>
              <AlertTriangle size={20} />
            </div>
            <span className={styles.metricLabel}>Stok Minimum</span>
          </div>
          <h3 className={styles.metricValue}>
            {isLoading ? "..." : stats.stokMinimum}
          </h3>
          <p className={styles.metricSubtext}>Segera buat order stok</p>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Left Side: Recent Transactions */}
        <div
          className={styles.card}
          style={{ display: "flex", flexDirection: "column", height: "520px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h2 className={styles.cardTitle} style={{ margin: 0 }}>
              Aktivitas Transaksi Bengkel
            </h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                value={chartCategory}
                onChange={(e) => setChartCategory(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.85rem",
                  outline: "none",
                }}
              >
                <option value="all">Semua Kategori</option>
                <option value="jasa">Jasa Service</option>
                <option value="suku_cadang">Suku Cadang</option>
              </select>
              <select
                value={chartTime}
                onChange={(e) => setChartTime(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.85rem",
                  outline: "none",
                }}
              >
                <option value="harian">Harian</option>
                <option value="mingguan">Mingguan</option>
                <option value="bulanan">Bulanan</option>
                <option value="tahunan">Tahunan</option>
              </select>
            </div>
          </div>
          <div
            style={{ flex: 1, width: "100%", marginTop: "20px", minHeight: 0 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(val) => `Rp${val / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{
                    paddingBottom: "20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                />
                {chartCategory === "all" || chartCategory === "jasa" ? (
                  <Bar
                    dataKey="jasa"
                    name="Jasa Service"
                    fill="#38bdf8"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                ) : null}
                {chartCategory === "all" || chartCategory === "suku_cadang" ? (
                  <Bar
                    dataKey="spareparts"
                    name="Suku Cadang"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                ) : null}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Stock Warnings */}
        <div
          className={styles.card}
          style={{ display: "flex", flexDirection: "column", height: "520px" }}
        >
          <h2
            className={styles.cardTitle}
            style={{
              flexShrink: 0,
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertTriangle size={20} color="#ef4444" />
            Stok Kritis
          </h2>

          <div
            className={styles.cleanListScroll}
            style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-full text-gray-400">
                Memuat data...
              </div>
            ) : (
              criticalStocks.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      overflow: "hidden",
                      flex: 1,
                    }}
                  >
                    <div style={{ flexShrink: 0 }}></div>
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: "#1f2937",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.namaPart}
                    </span>
                  </div>
                  <div
                    style={{
                      flexShrink: 0,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      fontSize: "0.75rem",
                      color: "#64748b",
                    }}
                  >
                    Stok:{" "}
                    <span
                      style={{
                        backgroundColor: "#fee2e2",
                        color: "#ef4444",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      {p.stokSaatIni}
                    </span>{" "}
                    / min {p.batasMinimum}
                  </div>
                </div>
              ))
            )}

            {!isLoading && criticalStocks.length === 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 20px",
                  textAlign: "center",
                  backgroundColor: "#f0fdf4",
                  borderRadius: "12px",
                  border: "1px dashed #bbf7d0",
                  marginTop: "auto",
                  marginBottom: "auto",
                }}
              >
                <CheckCircle
                  size={48}
                  color="#16a34a"
                  style={{ marginBottom: "16px" }}
                />
                <h4
                  style={{
                    margin: "0 0 8px 0",
                    color: "#166534",
                    fontSize: "1.1rem",
                  }}
                >
                  Stok Terkendali
                </h4>
                <p style={{ margin: 0, color: "#15803d", fontSize: "0.9rem" }}>
                  Semua suku cadang berada di atas batas minimum.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FODashboard;
