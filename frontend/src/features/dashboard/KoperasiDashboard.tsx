import React, { useState, useEffect } from "react";
import { FileText, Loader, CheckCircle, Package, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from "../../lib/api";
import styles from "./KoperasiDashboard.module.css";

const KoperasiDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    orderBaru: 0,
    sedangDiproses: 0,
    orderDitolak: 0,
    selesaiBulanIni: 0,
    penerimaanHariIni: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersRes = await apiClient.get("/spare-part-orders");
      const orders = ordersRes.data.data;

      const receiptsRes = await apiClient.get("/spare-part-receipts");
      const receipts = receiptsRes.data.data;

      // Calculate Metrics
      const today = new Date().toISOString().split("T")[0];

      const orderBaru = orders.filter((o: any) =>
        o.created_at.startsWith(today),
      ).length;

      const orderDitolak = orders.filter(
        (o: any) => o.status === "ditolak",
      ).length;

      // Sedang diproses: Setujui order, tapi blm diverifikasi final
      const sedangDiproses = orders.filter(
        (o: any) =>
          o.status === "disetujui" &&
          (!o.sparePartReceipt ||
            o.sparePartReceipt?.status_verifikasi === "menunggu"),
      ).length;

      const penerimaanHariIni = receipts.filter((r: any) =>
        r.created_at.startsWith(today),
      ).length;

      const currentMonthIndex = new Date().getMonth();
      const selesaiBulanIni = receipts.filter((r: any) => {
        const d = new Date(r.created_at);
        return (
          d.getMonth() === currentMonthIndex &&
          r.status_verifikasi === "disetujui"
        );
      }).length;

      setMetrics({
        orderBaru,
        sedangDiproses,
        orderDitolak,
        selesaiBulanIni,
        penerimaanHariIni,
      });

      setRecentOrders(orders.slice(0, 5)); // First 5 orders
    } catch (err) {
      console.error(err);
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
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
        return <span className={styles.badge}>{s}</span>;
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

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
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
          <div className={styles.metricHeader}>
            <div className={`${styles.iconWrapper} ${styles.iconGreen}`}>
              <CheckCircle size={20} />
            </div>
            <span className={styles.metricLabel}>Selesai Bulan Ini</span>
          </div>
          <h3 className={styles.metricValue}>{metrics.selesaiBulanIni}</h3>
          <p className={styles.metricSubtext}>Stok berhasil diverifikasi</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={`${styles.iconWrapper} ${styles.iconDarkBlue}`}>
              <Package size={20} />
            </div>
            <span className={styles.metricLabel}>Total Item Diterima</span>
          </div>
          <h3 className={styles.metricValue}>{metrics.penerimaanHariIni}</h3>
          <p className={styles.metricSubtext}>Barang Masuk Gudang hari ini</p>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Order Terbaru</h2>
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
                <td>{statusBadge(o.status)}</td>
                <td>
                  <Link to="/koperasi/orders" className={styles.btnDetail}>
                    Detail
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
