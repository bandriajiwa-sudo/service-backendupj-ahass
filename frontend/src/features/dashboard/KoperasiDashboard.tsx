import React, { useState, useEffect } from "react";
import {
  FileText,
  Loader,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  BarChart3,
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

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

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

      setRecentOrders(orders.slice(0, 5)); // First 5 orders
    } catch (err) {
      console.error(err);
    }
  };

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
            <div className={`${styles.trendBadge} ${styles.trendPositive}`}>
              <TrendingUp size={12} /> +8%
            </div>
            <div className={styles.metricHeader}>
              <div className={`${styles.iconWrapper} ${styles.iconOrange}`}>
                <FileText size={20} />
              </div>
              <span className={styles.metricLabel}>Order Baru</span>
            </div>
            <h3 className={styles.metricValue}>{metrics.orderBaru}</h3>
            <p className={styles.metricSubtext}>Menunggu diproses</p>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.trendBadge} ${styles.trendNeutral}`}>
              <TrendingUp size={12} /> 0%
            </div>
            <div className={styles.metricHeader}>
              <div className={`${styles.iconWrapper} ${styles.iconLightBlue}`}>
                <Loader size={20} />
              </div>
              <span className={styles.metricLabel}>Sedang Diproses</span>
            </div>
            <h3 className={styles.metricValue}>{metrics.sedangDiproses}</h3>
            <p className={styles.metricSubtext}>Menunggu DO</p>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.trendBadge} ${styles.trendNegative}`}>
              <TrendingDown size={12} /> -2%
            </div>
            <div className={styles.metricHeader}>
              <div className={`${styles.iconWrapper} ${styles.iconRed}`}>
                <XCircle size={20} />
              </div>
              <span className={styles.metricLabel}>Order Ditolak</span>
            </div>
            <h3 className={styles.metricValue}>{metrics.orderDitolak}</h3>
            <p className={styles.metricSubtext}>Pengajuan bermasalah</p>
          </div>

          <div className={styles.metricCard}>
            <div className={`${styles.trendBadge} ${styles.trendPositive}`}>
              <TrendingUp size={12} /> +14%
            </div>
            <div className={styles.metricHeader}>
              <div className={`${styles.iconWrapper} ${styles.iconGreen}`}>
                <CheckCircle size={20} />
              </div>
              <span className={styles.metricLabel}>Selesai Bulan Ini</span>
            </div>
            <h3 className={styles.metricValue}>{metrics.selesaiBulanIni}</h3>
            <p className={styles.metricSubtext}>Stok berhasil diverifikasi</p>
          </div>
        </div>

        {/* Right Column: Activity Summary / Mini Chart Tren */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Ringkasan Aktivitas</h3>
          <div className={styles.chartPlaceholder}>
            <BarChart3 size={32} />
            <span>Tren Order Mingguan</span>
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
          />
          <select className={styles.toolbarSelect}>
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
            {recentOrders.map((o) => (
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
            {recentOrders.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", color: "#64748b" }}
                >
                  Semua order selesai.
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
