import React, { useState, useEffect } from "react";
import {
  Wallet,
  Calendar,
  Activity,
  Package,
  Box,
  Archive,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { apiClient } from "../../lib/api";
import styles from "./KoperasiDashboard.module.css";

const UPJDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartPeriod, setChartPeriod] = useState<string>("harian");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchChart(chartPeriod);
  }, [chartPeriod]);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get("/upj/dashboard-stats");
      setStats(res.data.data);
    } catch (err) {
      console.error("Gagal memuat stats UPJ", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChart = async (period: string) => {
    try {
      const res = await apiClient.get(`/upj/dashboard-chart?period=${period}`);
      setChartData(res.data.data);
    } catch (err) {
      console.error("Gagal memuat chart UPJ", err);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Memuat Dashboard...</div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 6 Cards Grid for Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Jasa Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-fade-in-up animation-delay-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
              <Activity size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
              Harian
            </span>
          </div>
          <h3 className={styles.metricValue}>
            {formatCurrency(stats?.jasa?.harian)}
          </h3>
          <span className={styles.metricLabel}>Pendapatan Jasa Servis</span>
          <p className={styles.metricSubtext}>Total pendapatan hari ini</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-fade-in-up animation-delay-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600">
              <Calendar size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
              Bulanan
            </span>
          </div>
          <h3 className={styles.metricValue}>
            {formatCurrency(stats?.jasa?.bulanan)}
          </h3>
          <span className={styles.metricLabel}>Pendapatan Jasa Servis</span>
          <p className={styles.metricSubtext}>Total pendapatan bulan ini</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-fade-in-up animation-delay-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
              <Wallet size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
              Tahunan
            </span>
          </div>
          <h3 className={styles.metricValue}>
            {formatCurrency(stats?.jasa?.tahunan)}
          </h3>
          <span className={styles.metricLabel}>Pendapatan Jasa Servis</span>
          <p className={styles.metricSubtext}>Total pendapatan tahun ini</p>
        </div>

        {/* Suku Cadang Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-fade-in-up animation-delay-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100 text-orange-600">
              <Package size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
              Harian
            </span>
          </div>
          <h3 className={styles.metricValue}>
            {formatCurrency(stats?.sukuCadang?.harian)}
          </h3>
          <span className={styles.metricLabel}>Penjualan Suku Cadang</span>
          <p className={styles.metricSubtext}>Total penjualan hari ini</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-fade-in-up animation-delay-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
              <Box size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
              Bulanan
            </span>
          </div>
          <h3 className={styles.metricValue}>
            {formatCurrency(stats?.sukuCadang?.bulanan)}
          </h3>
          <span className={styles.metricLabel}>Penjualan Suku Cadang</span>
          <p className={styles.metricSubtext}>Total penjualan bulan ini</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 animate-fade-in-up animation-delay-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600">
              <Archive size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
              Tahunan
            </span>
          </div>
          <h3 className={styles.metricValue}>
            {formatCurrency(stats?.sukuCadang?.tahunan)}
          </h3>
          <span className={styles.metricLabel}>Penjualan Suku Cadang</span>
          <p className={styles.metricSubtext}>Total penjualan tahun ini</p>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6 animate-fade-in-up animation-delay-300 transition-all duration-300 hover:shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={styles.cardTitle}>
              Aktivitas Finansial UPJ Otomotif
            </h2>
            <p className={styles.metricSubtext}>
              Perbandingan pemasukan Jasa vs Suku Cadang
            </p>
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={chartPeriod}
            onChange={(e) => setChartPeriod(e.target.value)}
          >
            <option value="harian">Harian (7 Hari Terakhir)</option>
            <option value="bulanan">Bulanan (12 Bulan)</option>
            <option value="tahunan">Tahunan</option>
          </select>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(value) =>
                  value >= 1000000
                    ? `Rp ${value / 1000000}M`
                    : value >= 1000
                      ? `Rp ${value / 1000}k`
                      : value
                }
              />
              <RechartsTooltip
                cursor={{ fill: "#f1f5f9" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: any) => formatCurrency(Number(value))}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar
                dataKey="jasa"
                name="Jasa Servis"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
              <Bar
                dataKey="spareparts"
                name="Suku Cadang"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UPJDashboard;
