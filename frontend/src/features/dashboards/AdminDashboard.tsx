import React, { useEffect, useState } from "react";
import { apiClient } from "../../lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./AdminDashboard.module.css";

interface DashboardMetrics {
  users_total: number;
  mechanics_total: number;
  spare_parts_total: number;
}

// Hourly slots for daily activity chart (operating hours 07:00 - 17:00)
const hourLabels = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];
const initialChartData = hourLabels.map((h) => ({ name: h, aktivitas: 0 }));

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    users_total: 0,
    mechanics_total: 0,
    spare_parts_total: 0,
  });

  const [chartData, setChartData] = useState(initialChartData);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get("/dashboard/admin/stats");
        const stats = response.data.data;
        setMetrics({
          users_total: stats.users_total || 0,
          mechanics_total: stats.mechanics_total || 0,
          spare_parts_total: stats.spare_parts_total || 0,
        });

        // 2. Fetch login activity for chart
        try {
          const activityRes = await apiClient.get(
            "/dashboard/admin/login-activity",
          );
          if (activityRes.data.success && activityRes.data.data) {
            setChartData(activityRes.data.data);
          }
        } catch {
          // Chart will stay at initial zeros if endpoint not ready
        }
      } catch (error) {
        console.error("Failed to load dashboard metrics", error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.metricsGrid}>
        {/* Card 1 */}
        <div
          className={`${styles.metricCard} animate-fade-in-up animation-delay-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default`}
        >
          <div className={styles.metricTop}>
            <div
              className={styles.metricIconWrap}
              style={{ background: "#0284c7" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <h3 className={styles.metricTitle}>Pengguna Aktif</h3>
          </div>
          <div>
            <p className={styles.metricValue}>{metrics.users_total}</p>
            <p className={styles.metricSubtext}>4 peran pengguna sistem</p>
          </div>
        </div>

        {/* Card 2 */}
        <div
          className={`${styles.metricCard} animate-fade-in-up animation-delay-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default`}
        >
          <div className={styles.metricTop}>
            <div
              className={styles.metricIconWrap}
              style={{ background: "#059669" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <h3 className={styles.metricTitle}>Mekanik Aktif</h3>
          </div>
          <div>
            <p className={styles.metricValue}>{metrics.mechanics_total}</p>
            <p className={styles.metricSubtext}>Seluruh mekanik terdaftar</p>
          </div>
        </div>

        {/* Card 3 */}
        <div
          className={`${styles.metricCard} animate-fade-in-up animation-delay-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default`}
        >
          <div className={styles.metricTop}>
            <div
              className={styles.metricIconWrap}
              style={{ background: "#2563eb" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <h3 className={styles.metricTitle}>Jenis Suku Cadang</h3>
          </div>
          <div>
            <p className={styles.metricValue}>{metrics.spare_parts_total}</p>
            <p className={styles.metricSubtext}>Total keseluruhan kategori</p>
          </div>
        </div>
      </div>

      <div className={styles.chartsGridFullWidth}>
        {/* Interactive Chart Panel */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-between animate-fade-in-up animation-delay-400 transition-all duration-300 hover:shadow-lg cursor-default">
          <div className="flex justify-between items-start mb-4">
            <h2 className={styles.panelTitle}>Aktivitas Login Harian</h2>
          </div>
          <div className={styles.panelContent} style={{ height: "400px" }}>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorAktivitas"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  labelStyle={{ fontWeight: "bold", color: "#0f2c4a" }}
                />
                <Area
                  type="monotone"
                  dataKey="aktivitas"
                  stroke="#0284c7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAktivitas)"
                  activeDot={{
                    r: 6,
                    fill: "#0ea5e9",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
