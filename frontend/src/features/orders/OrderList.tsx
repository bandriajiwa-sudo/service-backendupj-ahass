import React, { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import { useAuth } from "../../app/AuthContext";
import { Trash2, Pencil } from "lucide-react";
import Swal from "sweetalert2";
import styles from "./OrderList.module.css";

interface SparePart {
  id: number;
  nama_suku_cadang: string;
  stok_sekarang: number;
  stok_minimum: number;
}

interface Order {
  id: number;
  spare_part: SparePart;
  user: {
    nama_user: string;
  };
  jumlah: number;
  status: "menunggu" | "disetujui" | "ditolak";
  catatan: string | null;
  created_at: string;
  tanggal_keputusan: string | null;
}

const OrderList: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);

  // Creation State (For FO)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editOrderId, setEditOrderId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    spare_part_id: "",
    jumlah: "1",
    catatan: "",
  });

  useEffect(() => {
    fetchOrders();
    if (user?.role === "front_office") {
      fetchSpareParts();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get("/spare-part-orders");
      setOrders(res.data.data);
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        text: "Gagal memuat data order",
      });
    }
  };

  const fetchSpareParts = async () => {
    try {
      const resParts = await apiClient.get("/spare-parts");
      const mappedParts = resParts.data.data.map((p: any) => ({
        id: p.id,
        nama_suku_cadang: p.nama_suku_cadang,
        stok_sekarang: p.stock?.stok_sekarang || 0,
        stok_minimum: p.stock?.stok_minimum || 0,
      }));
      setSpareParts(mappedParts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.spare_part_id || !formData.jumlah) {
        Swal.fire({ icon: "warning", text: "Lengkapi field wajib (*)" });
        return;
      }

      if (editOrderId) {
        // UPDATE existing order
        await apiClient.put(`/spare-part-orders/${editOrderId}`, formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil Diperbarui",
          text: "Order berhasil diperbarui.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        // CREATE new order
        await apiClient.post("/spare-part-orders", formData);
        Swal.fire({
          icon: "success",
          title: "Order Dikirim",
          text: "Order logistik berhasil dibuat dan menunggu persetujuan koperasi.",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      fetchOrders();
      setIsFormOpen(false);
      setEditOrderId(null);
      setFormData({ spare_part_id: "", jumlah: "1", catatan: "" });
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || err.message,
      });
    }
  };

  const handleEditOrder = (o: Order) => {
    setEditOrderId(o.id);
    setFormData({
      spare_part_id: String(o.spare_part?.id || ""),
      jumlah: String(o.jumlah),
      catatan: o.catatan || "",
    });
    setIsFormOpen(true);
  };

  const handleDeleteOrder = async (orderId: number) => {
    const result = await Swal.fire({
      title: "Hapus Order?",
      text: "Order yang dihapus tidak bisa dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f43f5e",
      cancelButtonText: "Batal",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/spare-part-orders/${orderId}`);
        fetchOrders();
        Swal.fire({
          icon: "success",
          title: "Dihapus",
          text: "Order berhasil dihapus.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: err.response?.data?.message || "Gagal menghapus order.",
        });
      }
    }
  };

  const handleDecision = async (orderId: number, isApprove: boolean) => {
    if (isApprove) {
      try {
        await apiClient.patch(`/spare-part-orders/${orderId}/decision`, {
          status: "disetujui",
        });
        fetchOrders();
        Swal.fire({
          icon: "success",
          title: "Disetujui",
          timer: 1000,
          showConfirmButton: false,
        });
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          text: err.response?.data?.message || "Terjadi kesalahan",
        });
      }
    } else {
      // Tolak requires reason
      const { value: catatan } = await Swal.fire({
        title: "Tolak Order",
        input: "text",
        inputLabel: "Alasan Penolakan",
        inputPlaceholder: "Cth: Stok di gudang utama masih banyak",
        showCancelButton: true,
        inputValidator: (val) => {
          if (!val) return "Alasan penolakan wajib diisi!";
          return null;
        },
      });

      if (catatan) {
        try {
          await apiClient.patch(`/spare-part-orders/${orderId}/decision`, {
            status: "ditolak",
            catatan: catatan,
          });
          fetchOrders();
          Swal.fire({
            icon: "success",
            title: "Ditolak",
            timer: 1000,
            showConfirmButton: false,
          });
        } catch (err: any) {
          Swal.fire({
            icon: "error",
            text: err.response?.data?.message || "Terjadi kesalahan",
          });
        }
      }
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "menunggu":
        return (
          <span className={`${styles.badge} ${styles.badgeMenunggu}`}>
            Menunggu
          </span>
        );
      case "disetujui":
        return (
          <span className={`${styles.badge} ${styles.badgeDisetujui}`}>
            Disetujui
          </span>
        );
      case "ditolak":
        return (
          <span className={`${styles.badge} ${styles.badgeDitolak}`}>
            Ditolak
          </span>
        );
      default:
        return <span className={styles.badge}>{s}</span>;
    }
  };

  const formatDate = (ds: string) => {
    if (!ds) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ds));
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Order Logistik & Restok</h1>
          <p className={styles.pageSubtitle}>
            Pantau dan kelola pengajuan pengadaan suku cadang
          </p>
        </div>
        {user?.role === "front_office" && (
          <button
            className={styles.btnPrimary}
            onClick={() => setIsFormOpen(true)}
          >
            + Buat Order Baru
          </button>
        )}
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Waktu Pengajuan</th>
                <th>Diajukan Oleh</th>
                <th>Suku Cadang</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Catatan (FO & Koperasi)</th>
                {user?.role === "front_office" && <th>Aksi</th>}
                {user?.role === "koperasi" && <th>Keputusan</th>}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      user?.role === "koperasi"
                        ? 7
                        : user?.role === "front_office"
                          ? 7
                          : 6
                    }
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#64748b",
                    }}
                  >
                    Belum ada data pengajuan order.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td>{formatDate(o.created_at)}</td>
                    <td style={{ fontWeight: 500 }}>
                      {o.user?.nama_user || "-"}
                    </td>
                    <td>
                      <div>{o.spare_part?.nama_suku_cadang}</div>
                      <small style={{ color: "#64748b" }}>
                        Stok Sekarang: {o.spare_part?.stok_sekarang ?? "?"} /
                        Minimum: {o.spare_part?.stok_minimum ?? "?"}
                      </small>
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.jumlah}</td>
                    <td>{statusBadge(o.status)}</td>
                    <td
                      style={{
                        maxWidth: "250px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {o.catatan || "-"}
                    </td>
                    {user?.role === "front_office" && (
                      <td>
                        {o.status === "menunggu" ? (
                          <div className={styles.actionGroup}>
                            <button
                              className={styles.btnApprove}
                              onClick={() => handleEditOrder(o)}
                              title="Edit Order"
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              className={styles.btnReject}
                              onClick={() => handleDeleteOrder(o.id)}
                              title="Hapus Order"
                            >
                              <Trash2 size={14} /> Hapus
                            </button>
                          </div>
                        ) : (
                          <span
                            style={{ fontSize: "0.85rem", color: "#94a3b8" }}
                          >
                            —
                          </span>
                        )}
                      </td>
                    )}
                    {user?.role === "koperasi" && (
                      <td>
                        {o.status === "menunggu" ? (
                          <div className={styles.actionGroup}>
                            <button
                              className={styles.btnApprove}
                              onClick={() => handleDecision(o.id, true)}
                            >
                              Setujui
                            </button>
                            <button
                              className={styles.btnReject}
                              onClick={() => handleDecision(o.id, false)}
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{ fontSize: "0.85rem", color: "#64748b" }}
                          >
                            {formatDate(o.tanggal_keputusan!)}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FO CREATE ORDER */}
      {isFormOpen && user?.role === "front_office" && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>
              {editOrderId ? "Edit Order" : "Buat Pengajuan Order"}
            </h2>
            <form onSubmit={handleCreateOrder}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Suku Cadang *</label>
                <select
                  className={styles.formInput}
                  value={formData.spare_part_id}
                  onChange={(e) =>
                    setFormData({ ...formData, spare_part_id: e.target.value })
                  }
                >
                  <option value="">Pilih barang habis...</option>
                  {spareParts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_suku_cadang}{" "}
                      {p.stok_sekarang <= p.stok_minimum
                        ? "(⚠️ STOK MINIMUM)"
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Jumlah (Qty) *</label>
                <input
                  type="number"
                  min="1"
                  className={styles.formInput}
                  value={formData.jumlah}
                  onChange={(e) =>
                    setFormData({ ...formData, jumlah: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Catatan (Opsional)</label>
                <textarea
                  className={styles.formInput}
                  rows={3}
                  placeholder="Contoh: Stok sedang darurat, tolong acc.."
                  value={formData.catatan}
                  onChange={(e) =>
                    setFormData({ ...formData, catatan: e.target.value })
                  }
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setIsFormOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
