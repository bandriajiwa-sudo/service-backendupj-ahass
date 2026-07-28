import React, { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import { useAuth } from "../../app/AuthContext";
import Swal from "sweetalert2";
import { Search } from "lucide-react";
import styles from "./ReceiptList.module.css";

interface SparePart {
  id: number;
  nama_suku_cadang: string;
}

interface User {
  nama_user: string;
}

interface Order {
  id: number;
  jumlah: number;
  status: string;
  created_at: string;
  spare_part: SparePart;
  user: User;
  spare_part_receipt: any;
}

interface Receipt {
  id: number;
  jumlah_diterima: number;
  status_verifikasi: "menunggu" | "disetujui" | "ditolak";
  catatan: string | null;
  created_at: string;
  tanggal_verifikasi: string | null;
  spare_part_order: Order;
}

const ReceiptList: React.FC = () => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [approvedOrders, setApprovedOrders] = useState<Order[]>([]);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterDate, setFilterDate] = useState("");

  // Creation State (For Koperasi)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    spare_part_order_id: "",
    jumlah_diterima: "1",
    harga_beli: "",
    harga_jual: "",
    catatan: "",
  });

  useEffect(() => {
    fetchReceipts();
    if (user?.role === "koperasi") {
      fetchApprovedOrders();
    }
  }, [user]);

  const fetchReceipts = async () => {
    try {
      const res = await apiClient.get("/spare-part-receipts");
      setReceipts(res.data.data);
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: "error", text: "Gagal memuat data penerimaan barang" });
    }
  };

  const fetchApprovedOrders = async () => {
    try {
      const res = await apiClient.get("/spare-part-orders");
      // Filter out orders that are NOT approved or ALREADY have a receipt attached.
      const filtered = res.data.data.filter(
        (o: any) => o.status === "disetujui" && !o.spare_part_receipt,
      );
      setApprovedOrders(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (
        !formData.spare_part_order_id ||
        !formData.jumlah_diterima ||
        !formData.harga_beli ||
        !formData.harga_jual
      ) {
        Swal.fire({
          icon: "warning",
          text: "Lengkapi field wajib (*) termasuk harga beli & jual",
        });
        return;
      }
      await apiClient.post("/spare-part-receipts", formData);
      fetchReceipts();
      fetchApprovedOrders(); // Refresh unhandled orders
      setIsFormOpen(false);
      setFormData({
        spare_part_order_id: "",
        jumlah_diterima: "1",
        harga_beli: "",
        harga_jual: "",
        catatan: "",
      });
      Swal.fire({
        icon: "success",
        title: "Penerimaan Dicatat",
        text: "Menunggu verifikasi fisik barang.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal membuat penerimaan",
        text: err.response?.data?.message || err.message,
      });
    }
  };

  const handleVerification = async (receiptId: number, isApprove: boolean) => {
    if (isApprove) {
      try {
        await apiClient.patch(
          `/spare-part-receipts/${receiptId}/verification`,
          {
            status: "disetujui",
          },
        );
        fetchReceipts();
        Swal.fire({
          icon: "success",
          title: "Terverifikasi!",
          text: "Stok inventori telah otomatis diperbarui sistem.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          text: err.response?.data?.message || "Terjadi kesalahan",
        });
      }
    } else {
      const { value: catatan } = await Swal.fire({
        title: "Tolak Penerimaan",
        input: "textarea",
        inputLabel: "Alasan Penolakan (Barang cacat/kurang)",
        inputPlaceholder: "Cth: Kondisi box rusak dari vendor...",
        showCancelButton: true,
        inputValidator: (val) => {
          if (!val) return "Alasan penolakan wajib diisi untuk investigasi!";
          return null;
        },
      });

      if (catatan) {
        try {
          await apiClient.patch(
            `/spare-part-receipts/${receiptId}/verification`,
            {
              status: "ditolak",
              catatan: catatan,
            },
          );
          fetchReceipts();
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
          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold inline-block text-center whitespace-nowrap">
            Tahap Verifikasi
          </span>
        );
      case "disetujui":
        return (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold inline-block text-center whitespace-nowrap">
            Stok Masuk Lunas
          </span>
        );
      case "ditolak":
        return (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold inline-block text-center whitespace-nowrap">
            Batal Verifikasi
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold inline-block text-center whitespace-nowrap">
            {s}
          </span>
        );
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

  const displayedReceipts = receipts.filter((r) => {
    // 1. Search (Nama suku cadang or pembuat order)
    const suku = (
      r.spare_part_order?.spare_part?.nama_suku_cadang || ""
    ).toLowerCase();
    const sub = (r.spare_part_order?.user?.nama_user || "").toLowerCase();
    const s = searchTerm.toLowerCase();
    if (searchTerm && !suku.includes(s) && !sub.includes(s)) return false;

    // 2. Status
    if (filterStatus !== "semua" && r.status_verifikasi !== filterStatus)
      return false;

    // 3. Date
    if (filterDate) {
      const dbDate = new Date(r.created_at).toISOString().split("T")[0];
      if (dbDate !== filterDate) return false;
    }

    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            Penerimaan Suku Cadang
          </h1>
          <p className={styles.pageSubtitle}>
            Catat kedatangan logistik gudang & verifikasi final stok
          </p>
        </div>
        {user?.role === "koperasi" && (
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg px-4 py-2 transition-colors"
            onClick={() => setIsFormOpen(true)}
          >
            Konfirmasi Penerimaan
          </button>
        )}
      </div>

      <div className={styles.tableCard}>
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="disetujui">Stok Masuk Lunas</option>
              <option value="menunggu">Tahap Verifikasi</option>
              <option value="ditolak">Batal Verifikasi</option>
            </select>
            <input
              type="date"
              className={styles.toolbarInput}
              style={{ width: "200px" }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full bg-white rounded-lg border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-left">
                  Tanggal Terima
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-left">
                  Suku Cadang
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-center">
                  Qty
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-center">
                  Status
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-left">
                  Catatan
                </th>
                {(user?.role === "front_office" || user?.role === "admin") && (
                  <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-center">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      user?.role === "front_office" || user?.role === "admin"
                        ? 6
                        : 5
                    }
                    className="text-center p-6 text-gray-500"
                  >
                    Belum ada riwayat penerimaan barang masuk.
                  </td>
                </tr>
              ) : (
                displayedReceipts.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="text-sm text-gray-800 px-4 py-3 text-left">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="text-sm text-gray-800 px-4 py-3 text-left">
                      <div className="font-semibold text-gray-800">
                        {r.spare_part_order?.spare_part?.nama_suku_cadang}
                      </div>
                      <small className="text-gray-500">
                        Order by: {r.spare_part_order?.user?.nama_user}
                      </small>
                    </td>
                    <td className="text-sm text-gray-800 px-4 py-3 text-center">
                      <span className="font-semibold text-emerald-600 block">
                        {r.jumlah_diterima} Pcs Masuk
                      </span>
                      <div className="text-xs text-gray-500">
                        (Tagihan Asli: {r.spare_part_order?.jumlah} Pcs)
                      </div>
                    </td>
                    <td className="text-sm text-gray-800 px-4 py-3 text-center">
                      {statusBadge(r.status_verifikasi)}
                    </td>
                    <td
                      className="text-sm text-gray-800 px-4 py-3 text-left"
                      style={{
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {r.catatan || "-"}
                    </td>
                    {(user?.role === "front_office" ||
                      user?.role === "admin") && (
                      <td className="px-4 py-3 text-center">
                        {r.status_verifikasi === "menunggu" ? (
                          <div className={styles.actionGroup}>
                            <button
                              className={styles.btnApprove}
                              onClick={() => handleVerification(r.id, true)}
                            >
                              Verifikasi
                            </button>
                            <button
                              className={styles.btnReject}
                              onClick={() => handleVerification(r.id, false)}
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {formatDate(r.tanggal_verifikasi!)}
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

      {/* MODAL KOPERASI CREATE RECEIPT */}
      {isFormOpen && user?.role === "koperasi" && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Catat Penerimaan</h2>
            <form onSubmit={handleCreateReceipt}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Pilih Nomor & Detail Order (Yang Disetujui) *
                </label>
                <select
                  className={styles.formInput}
                  value={formData.spare_part_order_id}
                  onChange={(e) => {
                    // pre-fill the jumlah
                    const targetOrder = approvedOrders.find(
                      (o) => o.id.toString() === e.target.value,
                    );
                    setFormData({
                      ...formData,
                      spare_part_order_id: e.target.value,
                      jumlah_diterima: targetOrder
                        ? targetOrder.jumlah.toString()
                        : "1",
                    });
                  }}
                >
                  <option value="">-- Order Siap Masuk Gudang --</option>
                  {approvedOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      [TGL: {formatDate(o.created_at)}]{" "}
                      {o.spare_part?.nama_suku_cadang} - Tagihan {o.jumlah} Pcs
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Kuantitas Fisik Diterima (Qty) *
                </label>
                <input
                  type="number"
                  min="1"
                  className={styles.formInput}
                  value={formData.jumlah_diterima}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jumlah_diterima: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Catatan (Opsional)</label>
                <textarea
                  className={styles.formInput}
                  rows={2}
                  placeholder="Kondisi barang saat turun..."
                  value={formData.catatan}
                  onChange={(e) =>
                    setFormData({ ...formData, catatan: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Harga Beli dari Vendor (HPP) *
                </label>
                <input
                  type="number"
                  min="0"
                  className={styles.formInput}
                  placeholder="Harga modal koperasi"
                  value={formData.harga_beli}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      harga_beli: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Harga Jual Baru (HET Kasir FO) *
                </label>
                <input
                  type="number"
                  min="0"
                  className={styles.formInput}
                  placeholder="Harga display etalase"
                  value={formData.harga_jual}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      harga_jual: e.target.value,
                    })
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
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg px-4 py-2 transition-colors"
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

export default ReceiptList;
