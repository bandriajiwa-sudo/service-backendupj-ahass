import React, { useState, useEffect } from "react";
import {
  FileText,
  Loader,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Swal from "sweetalert2";
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
  const [metrics, setMetrics] = useState<any>({
    orderBaru: { count: 0, growth: 0 },
    sedangDiproses: { count: 0, growth: 0 },
    orderDitolak: { count: 0, growth: 0 },
    selesaiBulanIni: { count: 0, growth: 0 },
    allOrdersRaw: null,
  });

  const [chartFilter, setChartFilter] = useState("Mingguan");
  const [chartData, setChartData] = useState<any[]>([]);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getWeekOfMonth = (date: Date) => {
    const firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDay = firstDate.getDay();

    let offsetDate = date.getDate() + firstDay - 1;
    return Math.floor(offsetDate / 7);
  };

  const getDailyChartData = (orders: any[]) => {
    // Last 7 days
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isodate = d.toISOString().split("T")[0];
      const dayOrders = orders.filter((o) => o.created_at.startsWith(isodate));

      const daySelesai = dayOrders.filter(
        (o: any) =>
          o.status === "disetujui" &&
          o.spare_part_receipt?.status_verifikasi === "disetujui",
      ).length;
      const dayDiproses = dayOrders.filter(
        (o: any) =>
          o.status === "disetujui" &&
          (!o.spare_part_receipt ||
            o.spare_part_receipt.status_verifikasi !== "disetujui"),
      ).length;
      const dayDitolak = dayOrders.filter(
        (o: any) => o.status === "ditolak",
      ).length;
      const dayBaru = dayOrders.filter(
        (o: any) => o.status === "menunggu",
      ).length;

      result.push({
        name: d.toLocaleDateString("id-ID", { weekday: "short" }),
        Selesai: daySelesai,
        Diproses: dayDiproses,
        Ditolak: dayDitolak,
        Baru: dayBaru,
      });
    }
    return result;
  };

  const getWeeklyChartData = (orders: any[]) => {
    // Current month weeks
    const result = [];
    for (let i = 0; i < 4; i++) {
      const weekOrders = orders.filter((o) => {
        const d = new Date(o.created_at);
        return (
          d.getMonth() === new Date().getMonth() &&
          d.getFullYear() === new Date().getFullYear() &&
          getWeekOfMonth(d) === i
        );
      });

      const wSelesai = weekOrders.filter(
        (o: any) =>
          o.status === "disetujui" &&
          o.spare_part_receipt?.status_verifikasi === "disetujui",
      ).length;
      const wDiproses = weekOrders.filter(
        (o: any) =>
          o.status === "disetujui" &&
          (!o.spare_part_receipt ||
            o.spare_part_receipt.status_verifikasi !== "disetujui"),
      ).length;
      const wDitolak = weekOrders.filter(
        (o: any) => o.status === "ditolak",
      ).length;
      const wBaru = weekOrders.filter(
        (o: any) => o.status === "menunggu",
      ).length;

      result.push({
        name: `Mg ${i + 1}`,
        Selesai: wSelesai,
        Diproses: wDiproses,
        Ditolak: wDitolak,
        Baru: wBaru,
      });
    }
    return result;
  };

  const getMonthlyChartData = (orders: any[]) => {
    // Last 4 months
    const result = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mOrders = orders.filter((o) => {
        const od = new Date(o.created_at);
        return (
          od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
        );
      });

      const mSelesai = mOrders.filter(
        (o: any) =>
          o.status === "disetujui" &&
          o.spare_part_receipt?.status_verifikasi === "disetujui",
      ).length;
      const mDiproses = mOrders.filter(
        (o: any) =>
          o.status === "disetujui" &&
          (!o.spare_part_receipt ||
            o.spare_part_receipt.status_verifikasi !== "disetujui"),
      ).length;
      const mDitolak = mOrders.filter(
        (o: any) => o.status === "ditolak",
      ).length;
      const mBaru = mOrders.filter((o: any) => o.status === "menunggu").length;

      result.push({
        name: d.toLocaleDateString("id-ID", { month: "short" }),
        Selesai: mSelesai,
        Diproses: mDiproses,
        Ditolak: mDitolak,
        Baru: mBaru,
      });
    }
    return result;
  };

  const getGrowth = (thisMonth: number, lastMonth: number) => {
    if (lastMonth === 0) return thisMonth > 0 ? 100 : 0;
    return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  };

  const fetchAndCalc = async (orders: any[]) => {
    const currentMonthIndex = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
    const lastMonthYear =
      currentMonthIndex === 0 ? currentYear - 1 : currentYear;

    const isThisMonth = (dStr: string) => {
      const d = new Date(dStr);
      return (
        d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear
      );
    };
    const isLastMonth = (dStr: string) => {
      const d = new Date(dStr);
      return (
        d.getMonth() === lastMonthIndex && d.getFullYear() === lastMonthYear
      );
    };

    // Baru
    const baruTotal = orders.filter((o: any) => o.status === "menunggu").length;
    const baruThisMonth = orders.filter(
      (o: any) => o.status === "menunggu" && isThisMonth(o.created_at),
    ).length;
    const baruLastMonth = orders.filter(
      (o: any) => o.status === "menunggu" && isLastMonth(o.created_at),
    ).length;

    // Ditolak
    const ditolakTotal = orders.filter(
      (o: any) => o.status === "ditolak",
    ).length;
    const ditolakThisMonth = orders.filter(
      (o: any) => o.status === "ditolak" && isThisMonth(o.created_at),
    ).length;
    const ditolakLastMonth = orders.filter(
      (o: any) => o.status === "ditolak" && isLastMonth(o.created_at),
    ).length;

    // Diproses
    const diprosesTotal = orders.filter(
      (o: any) =>
        o.status === "disetujui" &&
        (!o.spare_part_receipt ||
          o.spare_part_receipt.status_verifikasi !== "disetujui"),
    ).length;
    const diprosesThisMonth = orders.filter(
      (o: any) =>
        o.status === "disetujui" &&
        (!o.spare_part_receipt ||
          o.spare_part_receipt.status_verifikasi !== "disetujui") &&
        isThisMonth(o.created_at),
    ).length;
    const diprosesLastMonth = orders.filter(
      (o: any) =>
        o.status === "disetujui" &&
        (!o.spare_part_receipt ||
          o.spare_part_receipt.status_verifikasi !== "disetujui") &&
        isLastMonth(o.created_at),
    ).length;

    // Selesai (Bulan ini only)
    const selesaiBulanIniOrders = orders.filter(
      (o: any) =>
        o.spare_part_receipt &&
        o.spare_part_receipt.status_verifikasi === "disetujui" &&
        isThisMonth(o.spare_part_receipt.created_at),
    );
    const selesaiBulanLaluOrders = orders.filter(
      (o: any) =>
        o.spare_part_receipt &&
        o.spare_part_receipt.status_verifikasi === "disetujui" &&
        isLastMonth(o.spare_part_receipt.created_at),
    );

    setMetrics({
      orderBaru: {
        count: baruTotal,
        growth: getGrowth(baruThisMonth, baruLastMonth),
      },
      sedangDiproses: {
        count: diprosesTotal,
        growth: getGrowth(diprosesThisMonth, diprosesLastMonth),
      },
      orderDitolak: {
        count: ditolakTotal,
        growth: getGrowth(ditolakThisMonth, ditolakLastMonth),
      },
      selesaiBulanIni: {
        count: selesaiBulanIniOrders.length,
        growth: getGrowth(
          selesaiBulanIniOrders.length,
          selesaiBulanLaluOrders.length,
        ),
      },
      allOrdersRaw: orders,
    });
  };

  const fetchData = async () => {
    try {
      const ordersRes = await apiClient.get("/spare-part-orders");
      await fetchAndCalc(ordersRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!metrics.allOrdersRaw) return;
    if (chartFilter === "Harian") {
      setChartData(getDailyChartData(metrics.allOrdersRaw));
    } else if (chartFilter === "Mingguan") {
      setChartData(getWeeklyChartData(metrics.allOrdersRaw));
    } else {
      setChartData(getMonthlyChartData(metrics.allOrdersRaw));
    }
  }, [chartFilter, metrics.allOrdersRaw]);

  const renderGrowthBadge = (growth: number, reverseColors = false) => {
    const isPositive = growth > 0;
    const isZero = growth === 0;

    // For things like 'Ditolak', positive growth is bad (red), negative is good (green)
    let colorClass = isZero
      ? "text-gray-500 bg-gray-50"
      : isPositive
        ? "text-green-600 bg-green-50"
        : "text-red-600 bg-red-50";
    if (reverseColors && !isZero) {
      colorClass = isPositive
        ? "text-red-600 bg-red-50"
        : "text-green-600 bg-green-50";
    }

    return (
      <div
        className={`flex items-center text-xs font-semibold px-2 py-1 rounded ${colorClass}`}
      >
        {isPositive ? (
          <TrendingUp size={12} className="mr-1" />
        ) : isZero ? (
          <TrendingUp size={12} className="mr-1" />
        ) : (
          <TrendingDown size={12} className="mr-1" />
        )}
        {growth > 0 ? "+" : ""}
        {growth}%
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-fade-in-up animation-delay-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
              <FileText size={20} />
            </div>
            {renderGrowthBadge(metrics.orderBaru?.growth || 0)}
          </div>
          <h3 className={styles.metricValue}>
            {metrics.orderBaru?.count || 0}
          </h3>
          <span className={styles.metricLabel}>Order Baru</span>
          <p className={styles.metricSubtext}>Orderan Masuk</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-fade-in-up animation-delay-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100 text-orange-600">
              <Loader size={20} />
            </div>
            {renderGrowthBadge(metrics.sedangDiproses?.growth || 0)}
          </div>
          <h3 className={styles.metricValue}>
            {metrics.sedangDiproses?.count || 0}
          </h3>
          <span className={styles.metricLabel}>Sedang Diproses</span>
          <p className={styles.metricSubtext}>Orderan Di Proses</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-fade-in-up animation-delay-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600">
              <XCircle size={20} />
            </div>
            {renderGrowthBadge(metrics.orderDitolak?.growth || 0, true)}
          </div>
          <h3 className={styles.metricValue}>
            {metrics.orderDitolak?.count || 0}
          </h3>
          <span className={styles.metricLabel}>Order Ditolak</span>
          <p className={styles.metricSubtext}>Pengajuan Bermasalah</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-fade-in-up animation-delay-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600">
              <CheckCircle size={20} />
            </div>
            {renderGrowthBadge(metrics.selesaiBulanIni?.growth || 0)}
          </div>
          <h3 className={styles.metricValue}>
            {metrics.selesaiBulanIni?.count || 0}
          </h3>
          <span className={styles.metricLabel}>Selesai Bulan Ini</span>
          <p className={styles.metricSubtext}>Stok Berhasil Dikirim</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 w-full mb-6 animate-fade-in-up animation-delay-500 transition-all duration-300 hover:shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            Aktivitas Order Suku Cadang
          </h3>
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none text-gray-600 bg-gray-50"
            value={chartFilter}
            onChange={(e) => setChartFilter(e.target.value)}
          >
            <option value="Harian">Harian</option>
            <option value="Mingguan">Mingguan</option>
            <option value="Bulanan">Bulanan</option>
          </select>
        </div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
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
              <Bar dataKey="Selesai" stackId="a" fill="#10b981" barSize={28} />
              <Bar dataKey="Diproses" stackId="a" fill="#f97316" barSize={28} />
              <Bar dataKey="Ditolak" stackId="a" fill="#ef4444" barSize={28} />
              <Bar
                dataKey="Baru"
                stackId="a"
                fill="#3b82f6"
                barSize={28}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default KoperasiDashboard;
