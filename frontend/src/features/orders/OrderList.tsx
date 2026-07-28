import React, { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import { useAuth } from "../../app/AuthContext";
import { Trash2, Pencil, Search } from "lucide-react";
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
  catatan_fo: string | null;
  catatan_koperasi: string | null;
  created_at: string;
  tanggal_keputusan: string | null;
}

const OrderList: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterDate, setFilterDate] = useState("");

  // Creation State (For FO)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editOrderId, setEditOrderId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    spare_part_id: "",
    jumlah: "1",
    catatan: "",
  });

  // Decision State (For Koperasi)
  const [isKoperasiModalOpen, setIsKoperasiModalOpen] = useState(false);
  const [koperasiData, setKoperasiData] = useState({
    id: 0,
    status: "",
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
      catatan: o.catatan_fo || "",
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

  const handleOpenKoperasiModal = (o: Order) => {
    setKoperasiData({
      id: o.id,
      status: o.status === "menunggu" ? "" : o.status,
      catatan: o.catatan_koperasi || "",
    });
    setIsKoperasiModalOpen(true);
  };

  const handleKoperasiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!koperasiData.status) {
      Swal.fire({ icon: "warning", text: "Pilih keputusan terlebih dahulu." });
      return;
    }

    if (koperasiData.status === "ditolak" && !koperasiData.catatan) {
      Swal.fire({
        icon: "warning",
        text: "Wajib mengisi catatan jika penolakan.",
      });
      return;
    }

    try {
      await apiClient.patch(`/spare-part-orders/${koperasiData.id}/decision`, {
        status: koperasiData.status,
        catatan: koperasiData.catatan,
      });
      fetchOrders();
      setIsKoperasiModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "Tersimpan",
        text: "Keputusan order berhasil disimpan.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Gagal menyimpan keputusan.",
      });
    }
  };

  const statusBadge = (o: any) => {
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
        return <span className={styles.badge}>{o.status}</span>;
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

  const displayedOrders = orders.filter((o: any) => {
    // 1. Search
    const searchLow = searchTerm.toLowerCase();
    const namaSuku = (o.spare_part?.nama_suku_cadang || "").toLowerCase();
    const sub = (o.user?.nama_user || "").toLowerCase();
    if (searchTerm && !namaSuku.includes(searchLow) && !sub.includes(searchLow))
      return false;

    // 2. Status
    if (filterStatus !== "semua") {
      let derived = o.status;
      if (o.spare_part_receipt?.status_verifikasi === "disetujui") {
        derived = "selesai";
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

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard Order Suku Cadang</h1>
          <p className={styles.pageSubtitle}>
            Pantau dan kelola pengadaan suku cadang
          </p>
        </div>
        {user?.role === "front_office" && (
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            onClick={() => setIsFormOpen(true)}
          >
            + Buat Order Baru
          </button>
        )}
      </div>

      <div className={styles.tableCard}>
        <div
          className={styles.toolbar}
          style={{ margin: "16px 20px 4px 20px" }}
        >
          <div className={styles.searchGroup}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Cari suku cadang atau pengaju..."
              className={styles.toolbarInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <select
              className={styles.toolbarSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
              <option value="selesai">Selesai</option>
            </select>
            <input
              type="date"
              className={styles.toolbarInput}
              style={{ width: "150px" }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Waktu Pengajuan</th>
                <th>Diajukan Oleh</th>
                <th>Suku Cadang</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Catatan</th>
                {user?.role === "front_office" && <th>Aksi</th>}
                {user?.role === "koperasi" && <th>Aksi</th>}
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
                displayedOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{formatDate(o.created_at)}</td>
                    <td style={{ fontWeight: 500 }}>
                      {o.user?.nama_user || "-"}
                    </td>
                    <td>
                      <div>{o.spare_part?.nama_suku_cadang}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.jumlah}</td>
                    <td>{statusBadge(o)}</td>
                    <td
                      style={{
                        minWidth: "220px",
                        maxWidth: "300px",
                        whiteSpace: "normal",
                      }}
                    >
                      {!o.catatan_fo && !o.catatan_koperasi && (
                        <span style={{ color: "#94a3b8" }}>-</span>
                      )}

                      {o.catatan_fo && (
                        <div
                          style={{
                            marginBottom: o.catatan_koperasi ? "6px" : "0",
                            backgroundColor: "#f8fafc",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                            transition: "background 0.2s ease",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              color: "#3b82f6",
                              display: "block",
                              marginBottom: "2px",
                              letterSpacing: "0.02em",
                            }}
                          >
                            FrontOffice:
                          </span>
                          <span
                            style={{
                              fontSize: "0.82rem",
                              color: "#334155",
                              lineHeight: "1.3",
                            }}
                          >
                            {o.catatan_fo}
                          </span>
                        </div>
                      )}

                      {o.catatan_koperasi && (
                        <div
                          style={{
                            backgroundColor: "#faf5ff",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #e9d5ff",
                            transition: "background 0.2s ease",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              color: "#9333ea",
                              display: "block",
                              marginBottom: "2px",
                              letterSpacing: "0.02em",
                            }}
                          >
                            Koperasi:
                          </span>
                          <span
                            style={{
                              fontSize: "0.82rem",
                              color: "#334155",
                              lineHeight: "1.3",
                            }}
                          >
                            {o.catatan_koperasi}
                          </span>
                        </div>
                      )}
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
                        <div
                          className={styles.actionGroup}
                          style={{
                            flexDirection: "column",
                            gap: "8px",
                            alignItems: "flex-start",
                          }}
                        >
                          <button
                            className={styles.btnApprove}
                            style={{ background: "#3b82f6" }}
                            onClick={() => handleOpenKoperasiModal(o)}
                            title="Edit Keputusan"
                          >
                            <Pencil size={14} /> Edit
                          </button>

                          {o.status !== "menunggu"}
                        </div>
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
                      {p.stok_sekarang <= p.stok_minimum ? "(⚠️)" : ""}
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
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors w-full sm:w-auto"
                >
                  Simpan Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL KOPERASI DECISION */}
      {isKoperasiModalOpen && user?.role === "koperasi" && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Edit Order</h2>
            <form onSubmit={handleKoperasiSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status Keputusan *</label>
                <select
                  className={styles.formInput}
                  value={koperasiData.status}
                  onChange={(e) =>
                    setKoperasiData({ ...koperasiData, status: e.target.value })
                  }
                  required
                >
                  <option value="">-- Pilih Keputusan --</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="menunggu">Pending</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Catatan</label>
                <textarea
                  className={styles.formInput}
                  style={{ minHeight: "80px", resize: "vertical" }}
                  placeholder="Tambahkan catatan untuk FO (opsional jika ditolak / pending)"
                  value={koperasiData.catatan}
                  onChange={(e) =>
                    setKoperasiData({
                      ...koperasiData,
                      catatan: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setIsKoperasiModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors w-full sm:w-auto"
                >
                  Simpan
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
