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

const FODashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    transaksiHariIni: 0,
    layananJasa: 0,
    sukuCadangTerjual: 0,
    stokMinimumCount: 0,
  });

  const [criticalStocks, setCriticalStocks] = useState<any[]>([]);
  const [chartTime, setChartTime] = useState("Mingguan");
  const [chartCategory, setChartCategory] = useState("Semua");

  const generateChartData = () => {
    if (chartTime === "Mingguan") {
      return [
        { name: "Senin", jasa: 250000, spareparts: 400000 },
        { name: "Selasa", jasa: 150000, spareparts: 300000 },
        { name: "Rabu", jasa: 400000, spareparts: 200000 },
        { name: "Kamis", jasa: 200000, spareparts: 550000 },
        { name: "Jumat", jasa: 350000, spareparts: 420000 },
        { name: "Sabtu", jasa: 500000, spareparts: 800000 },
      ];
    }
    if (chartTime === "Bulanan") {
      return [
        { name: "Minggu 1", jasa: 1250000, spareparts: 2400000 },
        { name: "Minggu 2", jasa: 1150000, spareparts: 2300000 },
        { name: "Minggu 3", jasa: 1400000, spareparts: 1800000 },
        { name: "Minggu 4", jasa: 1600000, spareparts: 2550000 },
      ];
    }
    if (chartTime === "Tahunan") {
      return [
        { name: "Q1", jasa: 12500000, spareparts: 24000000 },
        { name: "Q2", jasa: 11500000, spareparts: 23000000 },
        { name: "Q3", jasa: 16000000, spareparts: 29000000 },
        { name: "Q4", jasa: 18000000, spareparts: 35500000 },
      ];
    }
    return [
      { name: "08:00", jasa: 50000, spareparts: 100000 },
      { name: "10:00", jasa: 150000, spareparts: 80000 },
      { name: "13:00", jasa: 80000, spareparts: 350000 },
      { name: "15:00", jasa: 250000, spareparts: 220000 },
    ];
  };

  const chartData = generateChartData();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiClient.get("/dashboard/fo/stats");
      if (res.data.success) {
        const d = res.data.data;
        setMetrics({
          transaksiHariIni: d.transaksiHariIni,
          layananJasa: d.layananJasa,
          sukuCadangTerjual: d.sukuCadangTerjual,
          stokMinimumCount: d.stokMinimumCount,
        });
        setCriticalStocks(d.criticalStocks);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2
          className={styles.pageSubtitle}
          style={{ fontSize: "1.2rem", marginTop: 0, fontWeight: 700 }}
        >
          Dashboard FrontOffice
        </h2>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
              <ShoppingCart size={20} />
            </div>
            <span className={styles.metricLabel}>Transaksi Hari Ini</span>
          </div>
          <h3 className={styles.metricValue}>{metrics.transaksiHariIni}</h3>
          <p className={styles.metricSubtext}>Dihitung dari nota baru</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={`${styles.iconWrapper} ${styles.iconGreen}`}>
              <Wrench size={20} />
            </div>
            <span className={styles.metricLabel}>Layanan Jasa</span>
          </div>
          <h3 className={styles.metricValue}>{metrics.layananJasa}</h3>
          <p className={styles.metricSubtext}>Dilayani mekanik hari ini</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={`${styles.iconWrapper} ${styles.iconIndigo}`}>
              <Package size={20} />
            </div>
            <span className={styles.metricLabel}>Suku Cadang Terjual</span>
          </div>
          <h3 className={styles.metricValue}>{metrics.sukuCadangTerjual}</h3>
          <p className={styles.metricSubtext}>Item terjual hari ini</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={`${styles.iconWrapper} ${styles.iconOrange}`}>
              <AlertTriangle size={20} />
            </div>
            <span className={styles.metricLabel}>Stok Minimum</span>
          </div>
          <h3 className={styles.metricValue}>{metrics.stokMinimumCount}</h3>
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
              Chart Transaksi
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
                <option value="Semua">Semua Kategori</option>
                <option value="Jasa Service">Jasa Service</option>
                <option value="Suku Cadang">Suku Cadang</option>
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
                <option value="Harian">Harian</option>
                <option value="Mingguan">Mingguan</option>
                <option value="Bulanan">Bulanan</option>
                <option value="Tahunan">Tahunan</option>
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
                  dataKey="name"
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
                {chartCategory === "Semua" ||
                chartCategory === "Jasa Service" ? (
                  <Bar
                    dataKey="jasa"
                    name="Jasa Service"
                    fill="#38bdf8"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                ) : null}
                {chartCategory === "Semua" ||
                chartCategory === "Suku Cadang" ? (
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
            {criticalStocks.map((p) => (
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
                  <div style={{ flexShrink: 0 }}>
                    {/* Icon removed based on user feedback */}
                  </div>
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
                    {p.nama_suku_cadang}
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
                    {p.stock?.stok_sekarang}
                  </span>{" "}
                  / min {p.stock?.stok_minimum}
                </div>
              </div>
            ))}

            {criticalStocks.length === 0 && (
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
