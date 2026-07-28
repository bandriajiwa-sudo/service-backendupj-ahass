import React, { useState, useEffect } from "react";
import {
  FileText,
  Loader,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { apiClient } from "../../lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./KoperasiDashboard.module.css";

const KoperasiDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    orderBaru: 0,
    sedangDiproses: 0,
    orderDitolak: 0,
    selesaiBulanIni: 0,
  });

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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2
          className={styles.pageSubtitle}
          style={{ fontSize: "1.3rem", marginTop: 0 }}
        >
          Dashboard Koperasi
        </h2>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
              <FileText size={20} />
            </div>
            <div className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
              <TrendingUp size={12} className="mr-1" /> +8%
            </div>
          </div>
          <h3 className={styles.metricValue}>{metrics.orderBaru}</h3>
          <span className={styles.metricLabel}>Order Baru</span>
          <p className={styles.metricSubtext}>Menunggu diproses</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100 text-orange-600">
              <Loader size={20} />
            </div>
            <div className="flex items-center text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded">
              <TrendingUp size={12} className="mr-1" /> 0%
            </div>
          </div>
          <h3 className={styles.metricValue}>{metrics.sedangDiproses}</h3>
          <span className={styles.metricLabel}>Sedang Diproses</span>
          <p className={styles.metricSubtext}>Menunggu DO</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600">
              <XCircle size={20} />
            </div>
            <div className="flex items-center text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
              <TrendingDown size={12} className="mr-1" /> -2%
            </div>
          </div>
          <h3 className={styles.metricValue}>{metrics.orderDitolak}</h3>
          <span className={styles.metricLabel}>Order Ditolak</span>
          <p className={styles.metricSubtext}>Pengajuan bermasalah</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600">
              <CheckCircle size={20} />
            </div>
            <div className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
              <TrendingUp size={12} className="mr-1" /> +14%
            </div>
          </div>
          <h3 className={styles.metricValue}>{metrics.selesaiBulanIni}</h3>
          <span className={styles.metricLabel}>Selesai Bulan Ini</span>
          <p className={styles.metricSubtext}>Stok berhasil diverifikasi</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 w-full mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            Chart Aktivitas Order
          </h3>
          <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none text-gray-600 bg-gray-50">
            <option value="Harian">Harian</option>
            <option value="Mingguan">Mingguan</option>
            <option value="Bulanan">Bulanan</option>
          </select>
        </div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={[
                {
                  name: "Selesai",
                  total: metrics.selesaiBulanIni,
                  fill: "#10b981",
                },
                {
                  name: "Diproses",
                  total: metrics.sedangDiproses,
                  fill: "#f97316",
                },
                {
                  name: "Ditolak",
                  total: metrics.orderDitolak,
                  fill: "#ef4444",
                },
                { name: "Baru", total: metrics.orderBaru, fill: "#3b82f6" },
              ]}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e5e7eb"
              />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                stroke="#4b5563"
                fontWeight={500}
                fontSize={13}
              />
              <Tooltip
                cursor={{ fill: "#f3f4f6" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default KoperasiDashboard;
