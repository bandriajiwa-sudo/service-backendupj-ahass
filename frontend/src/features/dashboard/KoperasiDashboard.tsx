import React, { useState, useEffect } from "react";
import {
  FileText,
  Loader,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from "../../lib/api";
import styles from "./KoperasiDashboard.module.css";

const KoperasiDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    orderBaru: 0,
    sedangDiproses: 0,
    orderDitolak: 0,
    selesaiBulanIni: 0,
  });

  const [allOrders, setAllOrders] = useState<any[]>([]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersRes = await apiClient.get("/spare-part-orders");
      const orders = ordersRes.data.data;

      // Calculate Metrics
      const orderBaru = orders.filter(
        (o: any) => o.status === "menunggu",
      ).length;

      const orderDitolak = orders.filter(
        (o: any) => o.status === "ditolak",
      ).length;

      // Selesai Bulan Ini: Order yang receipt-nya sudah di verifikasi FO (Lunas)
      const currentMonthIndex = new Date().getMonth();
      const selesaiBulanIni = orders.filter((o: any) => {
        if (!o.spare_part_receipt) return false;
        const d = new Date(o.spare_part_receipt.created_at);
        return (
          d.getMonth() === currentMonthIndex &&
          o.spare_part_receipt.status_verifikasi === "disetujui"
        );
      }).length;

      // Sedang diproses: Disetujui koperasi, tapi receipt FO belum disetujui (atau blm ada)
      const sedangDiproses = orders.filter(
        (o: any) =>
          o.status === "disetujui" &&
          (!o.spare_part_receipt ||
            o.spare_part_receipt.status_verifikasi !== "disetujui"),
      ).length;

      setMetrics({
        orderBaru,
        sedangDiproses,
        orderDitolak,
        selesaiBulanIni,
      });

      setAllOrders(orders);
    } catch (err) {
      console.error(err);
    }
  };

  const displayedOrders = allOrders.filter((o: any) => {
    // 1. Search (ID or Part Name)
    const idStr = `ORD-${String(o.id).padStart(5, "0")}`.toLowerCase();
    const namaSuku = (o.spare_part?.nama_suku_cadang || "").toLowerCase();
    const s = searchTerm.toLowerCase();
    if (s && !idStr.includes(s) && !namaSuku.includes(s)) return false;

    // 2. Status
    if (filterStatus !== "semua") {
      let derived = "";
      if (o.spare_part_receipt?.status_verifikasi === "disetujui") {
        derived = "selesai";
      } else if (o.status === "menunggu") {
        derived = "baru";
      } else if (o.status === "disetujui") {
        derived = "diproses";
      } else if (o.status === "ditolak") {
        derived = "ditolak";
      }
      if (filterStatus !== derived) return false;
    }

    // 3. Date
    if (filterDate) {
      const dbDate = new Date(o.created_at).toISOString().split("T")[0];
      if (dbDate !== filterDate) return false;
    }

    return true;
  });

  const statusBadge = (o: any) => {
    // Check if fully verified by FO
    if (o.spare_part_receipt?.status_verifikasi === "disetujui") {
      return (
        <span className={`${styles.badge} ${styles.badgeSelesai}`}>
          Selesai
        </span>
      );
    }

    switch (o.status) {
      case "menunggu":
        return (
          <span className={`${styles.badge} ${styles.badgeBaru}`}>Baru</span>
        );
      case "disetujui":
        return (
          <span className={`${styles.badge} ${styles.badgeDiproses}`}>
            Diproses
          </span>
        );
      case "ditolak":
        return (
          <span
            className={`${styles.badge} ${styles.badgeSelesai}`}
            style={{ background: "#fee2e2", color: "#dc2626" }}
          >
            Ditolak
          </span>
        );
      default:
        return <span className={styles.badge}>{o.status}</span>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2
          className={styles.pageSubtitle}
          style={{ fontSize: "1.3rem", marginTop: 0 }}
        >
          Dashboard Pemantauan Order dan Penerimaan Suku Cadang
        </h2>
      </div>

      {/* 70/30 Grid Partition */}
      <div className={styles.topSection}>
        {/* Left Column: Stat Cards */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricTopRow}>
              <div className={`${styles.iconWrapper} ${styles.iconOrange}`}>
                <FileText size={20} />
              </div>
              <div className={`${styles.trendBadge} ${styles.trendPositive}`}>
                <TrendingUp size={12} /> +8%
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3 className={styles.metricValue}>{metrics.orderBaru}</h3>
              <span className={styles.metricLabel}>Order Baru</span>
              <p className={styles.metricSubtext}>Menunggu diproses</p>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTopRow}>
              <div className={`${styles.iconWrapper} ${styles.iconLightBlue}`}>
                <Loader size={20} />
              </div>
              <div className={`${styles.trendBadge} ${styles.trendNeutral}`}>
                <TrendingUp size={12} /> 0%
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3 className={styles.metricValue}>{metrics.sedangDiproses}</h3>
              <span className={styles.metricLabel}>Sedang Diproses</span>
              <p className={styles.metricSubtext}>Menunggu DO</p>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTopRow}>
              <div className={`${styles.iconWrapper} ${styles.iconRed}`}>
                <XCircle size={20} />
              </div>
              <div className={`${styles.trendBadge} ${styles.trendNegative}`}>
                <TrendingDown size={12} /> -2%
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3 className={styles.metricValue}>{metrics.orderDitolak}</h3>
              <span className={styles.metricLabel}>Order Ditolak</span>
              <p className={styles.metricSubtext}>Pengajuan bermasalah</p>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTopRow}>
              <div className={`${styles.iconWrapper} ${styles.iconGreen}`}>
                <CheckCircle size={20} />
              </div>
              <div className={`${styles.trendBadge} ${styles.trendPositive}`}>
                <TrendingUp size={12} /> +14%
              </div>
            </div>
            <div className={styles.metricContent}>
              <h3 className={styles.metricValue}>{metrics.selesaiBulanIni}</h3>
              <span className={styles.metricLabel}>Selesai Bulan Ini</span>
              <p className={styles.metricSubtext}>Stok berhasil diverifikasi</p>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Summary / Mini Chart Tren */}
        <div
          className={styles.chartCard}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <h3 className={styles.chartTitle}>Ringkasan Aktivitas</h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginTop: "16px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                <span>Order Selesai Lunas</span>
                <span style={{ color: "#047857" }}>
                  {metrics.selesaiBulanIni}
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  background: "#f1f5f9",
                  borderRadius: "8px",
                  height: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min((metrics.selesaiBulanIni / Math.max(allOrders.length, 1)) * 100, 100)}%`,
                    background: "#10b981",
                    height: "100%",
                    borderRadius: "8px",
                    transition: "width 0.5s ease",
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                <span>Sedang Diproses (DO)</span>
                <span style={{ color: "#0284c7" }}>
                  {metrics.sedangDiproses}
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  background: "#f1f5f9",
                  borderRadius: "8px",
                  height: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min((metrics.sedangDiproses / Math.max(allOrders.length, 1)) * 100, 100)}%`,
                    background: "#0ea5e9",
                    height: "100%",
                    borderRadius: "8px",
                    transition: "width 0.5s ease",
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                <span>Order Baru / Ditolak</span>
                <span style={{ color: "#be123c" }}>
                  {metrics.orderBaru + metrics.orderDitolak}
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  background: "#f1f5f9",
                  borderRadius: "8px",
                  height: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(((metrics.orderBaru + metrics.orderDitolak) / Math.max(allOrders.length, 1)) * 100, 100)}%`,
                    background: "#f43f5e",
                    height: "100%",
                    borderRadius: "8px",
                    transition: "width 0.5s ease",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Order Terbaru</h2>

        {/* Table Filters Integration */}
        <div className={styles.tableToolbar}>
          <input
            type="text"
            placeholder="Cari No. FO atau Suku Cadang..."
            className={styles.toolbarInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.toolbarSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="semua">Semua Status</option>
            <option value="baru">Baru</option>
            <option value="diproses">Sedang Diproses</option>
            <option value="ditolak">Ditolak</option>
            <option value="selesai">Selesai</option>
          </select>
          <input
            type="date"
            className={styles.toolbarInput}
            style={{ width: "150px", minWidth: "150px" }}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <table className={styles.tableGroup}>
          <thead>
            <tr>
              <th>No. Pengajuan (FO)</th>
              <th>Tanggal</th>
              <th>Suku Cadang</th>
              <th style={{ textAlign: "right" }}>Total Qty</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {displayedOrders.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 600 }}>
                  ORD-{String(o.id).padStart(5, "0")}
                </td>
                <td>
                  {new Date(o.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td>{o.spare_part?.nama_suku_cadang}</td>
                <td style={{ fontWeight: 600, textAlign: "right" }}>
                  {o.jumlah}
                </td>
                <td>{statusBadge(o)}</td>
                <td>
                  <Link
                    to="/koperasi/orders"
                    className={styles.btnActionOutline}
                  >
                    <Eye size={16} /> Detail
                  </Link>
                </td>
              </tr>
            ))}
            {displayedOrders.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    color: "#64748b",
                    padding: "32px 0",
                  }}
                >
                  Tidak ada order yang sesuai dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KoperasiDashboard;
