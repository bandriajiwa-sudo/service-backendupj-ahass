import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "./AuthContext";

// Placeholders for major pages
import Login from "../features/authorizer/Login";
import BaseLayout from "../components/layout/BaseLayout";
// Admin
import AdminDashboard from "../features/dashboards/AdminDashboard";
import UserList from "../features/users/UserList";
import MechanicList from "../features/mechanics/MechanicList";
import SparePartList from "../features/spare-parts/SparePartList";
import { CategoryList } from "../features/categories/CategoryList";
import { PersonnelList } from "../features/personnel/PersonnelList";
// FO & KOPERASI
import TransactionList from "../features/transactions/TransactionList";
import OrderList from "../features/orders/OrderList";
import ShipmentList from "../features/orders/ShipmentList";
import KoperasiPenerimaan from "../features/koperasi/KoperasiPenerimaan";
import FODashboard from "../features/dashboard/FODashboard";
import FOHistory from "../features/dashboard/FOHistory";
import FOStockInfo from "../features/dashboard/FOStockInfo";
import NotaPrint from "../features/print/NotaPrint";
import KoperasiDashboard from "../features/dashboard/KoperasiDashboard";
import KoperasiOrders from "../features/koperasi/KoperasiOrders";
import KoperasiMasterSukuCadang from "../features/koperasi/KoperasiMasterSukuCadang";
import KoperasiLogHarga from "../features/koperasi/KoperasiLogHarga";
import UpjDashboard from "../features/dashboard/UpjDashboard";
import LaporanJasa from "../features/upj/LaporanJasa";
import LaporanSukuCadang from "../features/upj/LaporanSukuCadang";
import LandingPage from "../features/landing/LandingPage";

// Simple Unauthorized template
const Unauthorized = () => (
  <div style={{ textAlign: "center", padding: "50px" }}>
    <h1 style={{ color: "var(--color-danger)" }}>403 - Akses Ditolak</h1>
    <p>Anda tidak memiliki hak akses untuk halaman ini.</p>
    <a href="/" style={{ color: "var(--color-primary)" }}>
      Kembali ke Beranda
    </a>
  </div>
);

// Root redirector based on role
const RootRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "front_office":
      return <Navigate to="/front-office/dashboard" replace />;
    case "koperasi":
      return <Navigate to="/koperasi/dashboard" replace />;
    case "kepala_upj":
      return <Navigate to="/kepala-upj/dashboard" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/home",
    element: <RootRedirect />,
  },
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <BaseLayout title="Admin Panel" />,
        children: [
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "users", element: <UserList /> },
          { path: "mechanics", element: <MechanicList /> },
          { path: "spare-parts", element: <SparePartList /> },
          { path: "categories", element: <CategoryList /> },
          { path: "personnels", element: <PersonnelList /> },
        ],
      },
    ],
  },
  {
    path: "/front-office",
    element: <ProtectedRoute allowedRoles={["front_office"]} />,
    children: [
      {
        element: <BaseLayout title="Front Office" />,
        children: [
          { path: "dashboard", element: <FODashboard /> },
          { path: "transaksi-baru", element: <TransactionList /> },
          { path: "daftar-transaksi", element: <FOHistory /> },
          { path: "informasi-stok", element: <FOStockInfo /> },
          { path: "penerimaan-stok", element: <ShipmentList /> },
          { path: "dafatar-transaksi/nota/:id", element: <NotaPrint /> }, // Specifically handling mockup 19
          { path: "orders", element: <OrderList /> },
          { path: "receipts", element: <ShipmentList /> },
        ],
      },
    ],
  },
  {
    path: "/koperasi",
    element: <ProtectedRoute allowedRoles={["koperasi"]} />,
    children: [
      {
        element: <BaseLayout title="Panel Koperasi" />,
        children: [
          { path: "dashboard", element: <KoperasiDashboard /> },
          { path: "orders", element: <KoperasiOrders /> },
          { path: "riwayat-penerimaan", element: <KoperasiPenerimaan /> },
          { path: "master-suku-cadang", element: <KoperasiMasterSukuCadang /> },
          { path: "log-harga", element: <KoperasiLogHarga /> },
          {
            path: "returns",
            element: <Navigate to="/koperasi/riwayat-penerimaan" replace />,
          },
        ],
      },
    ],
  },
  {
    path: "/kepala-upj",
    element: <ProtectedRoute allowedRoles={["kepala_upj"]} />,
    children: [
      {
        element: <BaseLayout title="Dashboard Laporan UPJ" />,
        children: [
          { path: "dashboard", element: <UpjDashboard /> },
          { path: "laporan-jasa", element: <LaporanJasa /> },
          { path: "laporan-suku-cadang", element: <LaporanSukuCadang /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
