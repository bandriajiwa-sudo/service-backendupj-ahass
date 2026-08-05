import React, { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import { useAuth } from "../../app/AuthContext";
import { Trash2, Plus, X, Search, FileText } from "lucide-react";
import Swal from "sweetalert2";
import styles from "./OrderList.module.css";
import NotesModal, { NotesBadge } from "../../components/common/NotesModal";
import PrintHeader from "../../components/common/PrintHeader";

interface SparePart {
  id: number;
  kode_suku_cadang: string;
  nama_suku_cadang: string;
  category?: { nama_kategori: string };
  stok_sekarang: number;
  stok_minimum: number;
}

interface OrderDetail {
  id: number;
  spare_part_id: number;
  spare_part: SparePart;
  jumlah_qty: number;
}

interface Order {
  id: number;
  nomor_surat_order: string;
  tanggal_pengajuan: string;
  user: {
    nama_user: string;
  };
  status: "menunggu" | "disetujui" | "ditolak";
  catatan_fo: string | null;
  catatan_koperasi: string | null;
  tanggal_awal: string | null;
  tanggal_akhir: string | null;
  created_at: string;
  tanggal_keputusan: string | null;
  spare_part_order_details: OrderDetail[];
}

const formatDateOnly = (ds: string) => {
  if (!ds) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(ds));
};

const getStatusName = (val: string) => {
  switch (val) {
    case "menunggu":
      return "Menunggu";
    case "disetujui":
      return "Disetujui";
    case "ditolak":
      return "Ditolak";
    default:
      return val;
  }
};

const getStatusClass = (val: string) => {
  switch (val) {
    case "menunggu":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "disetujui":
      return "bg-green-100 text-green-800 border border-green-200";
    case "ditolak":
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

const OrderList: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterDate, setFilterDate] = useState("");

  // Cart & FO Modal State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<
    { part: SparePart; qty: number }[]
  >([]);
  const [modalFilterCategory, setModalFilterCategory] = useState("");
  const [selectedPartId, setSelectedPartId] = useState("");
  const [selectedQty, setSelectedQty] = useState("1");
  const [cartNotes, setCartNotes] = useState("");

  // Common Modals
  const [notesModalOrder, setNotesModalOrder] = useState<Order | null>(null);
  const [viewDocumentOrder, setViewDocumentOrder] = useState<Order | null>(
    null,
  );
  const [isKoperasiModalOpen, setIsKoperasiModalOpen] = useState(false);

  // Decision State (For Koperasi)
  const [koperasiData, setKoperasiData] = useState({
    id: 0,
    status: "",
    catatan: "",
    tanggal_awal: "",
    tanggal_akhir: "",
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
      Swal.fire({ icon: "error", text: "Gagal memuat data order" });
    }
  };

  const fetchSpareParts = async () => {
    try {
      const resParts = await apiClient.get("/spare-parts");
      const mappedParts = resParts.data.data.map((p: any) => ({
        id: p.id,
        kode_suku_cadang: p.kode_suku_cadang,
        nama_suku_cadang: p.nama_suku_cadang,
        category: p.category,
        stok_sekarang: p.stock?.stok_sekarang || 0,
        stok_minimum: p.stock?.stok_minimum || 0,
      }));
      setSpareParts(mappedParts);
    } catch (err) {
      console.error(err);
    }
  };

  // CART LOGIC
  const lowStockParts = spareParts.filter(
    (p) => p.stok_sekarang <= p.stok_minimum,
  );
  const modalCategories = Array.from(
    new Set(lowStockParts.map((p) => p.category?.nama_kategori)),
  ).filter(Boolean);
  const filteredModalParts = lowStockParts.filter((p) => {
    return (
      modalFilterCategory === "" ||
      p.category?.nama_kategori === modalFilterCategory
    );
  });

  const handleAddToCart = () => {
    if (!selectedPartId || !selectedQty || parseInt(selectedQty) < 1) {
      Swal.fire({
        icon: "warning",
        text: "Pilih barang dan masukkan Qty yang valid.",
      });
      return;
    }
    const part = spareParts.find((p) => p.id.toString() === selectedPartId);
    if (!part) return;

    // Check if already in cart
    const existing = cartItems.find((item) => item.part.id === part.id);
    if (existing) {
      Swal.fire({
        icon: "info",
        text: "Barang sudah ada di keranjang, Qty akan ditotal.",
      });
      setCartItems((prev) =>
        prev.map((item) =>
          item.part.id === part.id
            ? { ...item, qty: item.qty + parseInt(selectedQty) }
            : item,
        ),
      );
    } else {
      setCartItems([...cartItems, { part, qty: parseInt(selectedQty) }]);
    }

    // Reset selection
    setSelectedPartId("");
    setSelectedQty("1");
  };

  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter((i) => i.part.id !== id));
  };

  const handleSubmitCart = async () => {
    if (cartItems.length === 0) {
      Swal.fire({ icon: "warning", text: "Keranjang masih kosong." });
      return;
    }

    const payload = {
      items: cartItems.map((item) => ({
        spare_part_id: item.part.id,
        jumlah: item.qty,
      })),
      catatan_umum: cartNotes,
    };

    try {
      await apiClient.post("/spare-part-orders", payload);
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Surat Order berhasil diajukan ke Koperasi.",
        timer: 1500,
        showConfirmButton: false,
      });

      setCartItems([]);
      setCartNotes("");
      setIsCartOpen(false);
      fetchOrders();
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Terjadi kesalahan sistem.",
      });
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    const result = await Swal.fire({
      title: "Hapus Order?",
      text: "Data surat pengajuan ini beserta detailnya akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/spare-part-orders/${orderId}`);
        Swal.fire("Terhapus!", "Data pengajuan telah dihapus.", "success");
        fetchOrders();
      } catch (err: any) {
        Swal.fire(
          "Gagal",
          err.response?.data?.message || "Kesalahan server",
          "error",
        );
      }
    }
  };

  const openKoperasiModal = (order: Order) => {
    setKoperasiData({
      id: order.id,
      status:
        order.status === "menunggu" && order.tanggal_awal ? "menunggu" : "",
      catatan: order.catatan_koperasi || "",
      tanggal_awal: order.tanggal_awal || "",
      tanggal_akhir: order.tanggal_akhir || "",
    });
    setIsKoperasiModalOpen(true);
  };

  const handleKoperasiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        status: koperasiData.status,
        catatan: koperasiData.catatan,
      };
      if (koperasiData.status === "menunggu") {
        if (!koperasiData.tanggal_awal || !koperasiData.tanggal_akhir) {
          Swal.fire({
            icon: "warning",
            text: "Isi tanggal estimasi kedatangan barang.",
          });
          return;
        }
        payload.tanggal_awal = koperasiData.tanggal_awal;
        payload.tanggal_akhir = koperasiData.tanggal_akhir;
      }

      await apiClient.post(
        `/spare-part-orders/${koperasiData.id}/keputusan`,
        payload,
      );
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Keputusan Koperasi berhasil disimpan.",
        timer: 1500,
        showConfirmButton: false,
      });
      setIsKoperasiModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Kesalahan server.",
      });
    }
  };

  // ── Render Filter
  let filteredOrders = orders;
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    filteredOrders = filteredOrders.filter(
      (o) =>
        o.nomor_surat_order?.toLowerCase().includes(q) ||
        o.user?.nama_user.toLowerCase().includes(q),
    );
  }
  if (filterStatus !== "semua") {
    filteredOrders = filteredOrders.filter((o) => o.status === filterStatus);
  }
  if (filterDate) {
    filteredOrders = filteredOrders.filter(
      (o) => o.tanggal_pengajuan === filterDate,
    );
  }

  // ── Print Helper
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.container}>
      {/* ── Document PDF Modal/View ── */}
      {viewDocumentOrder && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center overflow-y-auto print:bg-white print:overflow-visible">
          <div className="bg-white my-8 w-full max-w-4xl mx-auto rounded-lg shadow-2xl print:shadow-none print:my-0 print:w-full">
            {/* Header Toolbar (Hidden on Print) */}
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg print:hidden">
              <h3 className="font-bold text-lg text-gray-800">
                Pratinjau Surat Order
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Cetak / PDF
                </button>
                <button
                  onClick={() => setViewDocumentOrder(null)}
                  className="text-gray-500 hover:text-red-500 px-3"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body (Printable) */}
            <div className="p-8 print:p-0">
              <PrintHeader
                title="SURAT PENGAJUAN PESANAN SUKU CADANG"
                subtitle={`Nomor: ${viewDocumentOrder.nomor_surat_order || "---"}`}
                periodLabel=""
              />

              <div className="my-6">
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 font-semibold w-1/4">
                        Tanggal Pengajuan
                      </td>
                      <td className="py-1 w-3/4">
                        : {formatDateOnly(viewDocumentOrder.tanggal_pengajuan)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold w-1/4">
                        Diajukan Oleh
                      </td>
                      <td className="py-1 w-3/4">
                        : {viewDocumentOrder.user?.nama_user} (Front Office)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold w-1/4">
                        Status Saat Ini
                      </td>
                      <td className="py-1 w-3/4">
                        :{" "}
                        {getStatusName(viewDocumentOrder.status).toUpperCase()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-6">
                <h4 className="font-bold mb-3 border-b-2 border-gray-800 inline-block">
                  Daftar Barang (Item Details)
                </h4>
                <table className="w-full border-collapse border border-gray-800 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-800 px-3 py-2 text-center w-12">
                        No.
                      </th>
                      <th className="border border-gray-800 px-3 py-2 text-left">
                        Kode Suku Cadang
                      </th>
                      <th className="border border-gray-800 px-3 py-2 text-left">
                        Nama Suku Cadang
                      </th>
                      <th className="border border-gray-800 px-3 py-2 text-center">
                        Stok Terakhir
                      </th>
                      <th className="border border-gray-800 px-3 py-2 text-center">
                        Qty Diajukan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewDocumentOrder.spare_part_order_details?.map(
                      (detail, idx) => (
                        <tr key={detail.id}>
                          <td className="border border-gray-800 px-3 py-2 text-center">
                            {idx + 1}
                          </td>
                          <td className="border border-gray-800 px-3 py-2">
                            {detail.spare_part.kode_suku_cadang}
                          </td>
                          <td className="border border-gray-800 px-3 py-2">
                            {detail.spare_part.nama_suku_cadang}
                          </td>
                          <td className="border border-gray-800 px-3 py-2 text-center">
                            {detail.spare_part.stok_sekarang}
                          </td>
                          <td className="border border-gray-800 px-3 py-2 text-center font-bold">
                            {detail.jumlah_qty}
                          </td>
                        </tr>
                      ),
                    )}
                    {(!viewDocumentOrder.spare_part_order_details ||
                      viewDocumentOrder.spare_part_order_details.length ===
                        0) && (
                      <tr>
                        <td
                          colSpan={5}
                          className="border border-gray-800 px-3 py-4 text-center"
                        >
                          Tidak ada rincian item.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {(viewDocumentOrder.catatan_fo ||
                viewDocumentOrder.catatan_koperasi) && (
                <div className="mb-8">
                  <h4 className="font-bold mb-2">Catatan Keterangan:</h4>
                  {viewDocumentOrder.catatan_fo && (
                    <p className="text-sm mb-1">
                      <strong>Front Office:</strong>{" "}
                      {viewDocumentOrder.catatan_fo}
                    </p>
                  )}
                  {viewDocumentOrder.catatan_koperasi && (
                    <p className="text-sm">
                      <strong>Gudang / Koperasi:</strong>{" "}
                      {viewDocumentOrder.catatan_koperasi}
                    </p>
                  )}
                </div>
              )}

              <div className="hidden print:flex justify-end w-full mt-12 pt-8 break-inside-avoid">
                <div style={{ width: "220px", textAlign: "center" }}>
                  <p className="mb-1 text-black font-medium text-sm">
                    Yogyakarta,{" "}
                    {new Date(
                      viewDocumentOrder.tanggal_pengajuan || new Date(),
                    ).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p
                    className="text-black font-medium text-sm"
                    style={{ marginBottom: "80px" }}
                  >
                    Resepsionis Front Office,
                  </p>
                  <div
                    style={{
                      borderBottom: "1.5px solid black",
                      width: "100%",
                      margin: "0 auto 4px",
                    }}
                  />
                  <p className="text-black font-bold text-sm m-0 p-0 uppercase">
                    {viewDocumentOrder.user?.nama_user || "Petugas FO"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main UI List (Hidden Print) */}
      <div className="print:hidden">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Dashboard Order Suku Cadang</h1>
          <p className={styles.pageSubtitle}>
            Pantau dan kelola surat pesanan (purchase orders) ke gudang Koperasi
          </p>
        </div>

        {/* Enhanced Filter Dashboard Overlay */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between gap-4 items-center">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50 transition-colors"
                placeholder="Cari nomor surat atau pengaju..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Status */}
            <select
              className="w-full md:w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu / Pending</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
            </select>
            {/* Date */}
            <input
              type="date"
              className="w-full md:w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div className="w-full md:w-auto shrink-0 flex justify-end">
            {user?.role === "front_office" && (
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 font-medium py-2.5 px-6 rounded-lg transition-all duration-200 whitespace-nowrap flex items-center gap-2"
                onClick={() => setIsCartOpen(true)}
              >
                <Plus className="w-4 h-4" /> Buat Order Baru
              </button>
            )}
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No. Surat Order</th>
                  <th>Tgl Pengajuan</th>
                  <th>Suku Cadang</th>
                  <th>Total Qty</th>
                  <th>Status</th>
                  <th>Catatan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const totalQty = (
                      order.spare_part_order_details || []
                    ).reduce((acc, curr) => acc + curr.jumlah_qty, 0);
                    return (
                      <tr key={order.id}>
                        <td className="font-semibold text-gray-800">
                          {order.nomor_surat_order || "-"}
                        </td>
                        <td>{formatDateOnly(order.tanggal_pengajuan)}</td>
                        <td>
                          <span className="font-medium text-gray-800">
                            {order.spare_part_order_details?.length || 0} Jenis
                            Item
                          </span>
                        </td>
                        <td>{totalQty} Pcs</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${getStatusClass(order.status)}`}
                          >
                            {order.status === "menunggu" && order.tanggal_awal
                              ? "Pending (Est)"
                              : getStatusName(order.status)}
                          </span>
                        </td>
                        <td>
                          <NotesBadge
                            catatanFo={order.catatan_fo}
                            catatanKoperasi={
                              order.catatan_koperasi || order.tanggal_awal
                            }
                            onClick={() => setNotesModalOrder(order)}
                          />
                        </td>
                        <td>
                          <div className={styles.actionLinks}>
                            <button
                              title="Lihat / Cetak PDF Order"
                              className="text-gray-500 hover:text-blue-500 transition-colors"
                              onClick={() => setViewDocumentOrder(order)}
                            >
                              <FileText className="w-5 h-5 mx-1" />
                            </button>

                            {user?.role === "koperasi" &&
                              order.status === "menunggu" && (
                                <button
                                  onClick={() => openKoperasiModal(order)}
                                  className="bg-teal-500 text-white px-3 py-1 rounded text-xs ml-2 hover:bg-teal-600"
                                >
                                  Beri Keputusan
                                </button>
                              )}

                            {user?.role === "front_office" &&
                              order.status === "menunggu" && (
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="text-red-500 hover:text-red-700 mx-2"
                                  title="Batalkan Surat Order"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-gray-500 bg-gray-50"
                    >
                      Tidak ada surat pesanan suku cadang.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL KERANJANG FO (CART) */}
      {isCartOpen && user?.role === "front_office" && (
        <div className={styles.overlay}>
          <div className={styles.modal} style={{ maxWidth: "800px" }}>
            <h2 className={styles.modalTitle}>Sistem Keranjang Order</h2>
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4 font-medium flex justify-between items-center">
              <span>
                Sistem otomatis hanya menyeleksi barang yang telah menembus
                batas Stok minimum (Kritis).
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-gray-50 p-4 border rounded-md mb-6 items-end">
              <div className="col-span-1">
                <label className="text-xs font-bold text-gray-700">
                  Filter Kategori
                </label>
                <select
                  className="w-full text-sm p-2 border border-gray-300 rounded mt-1"
                  value={modalFilterCategory}
                  onChange={(e) => setModalFilterCategory(e.target.value)}
                >
                  <option value="">Semua</option>
                  {modalCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-700">
                  Pilih Suku Cadang (Kritis)
                </label>
                <select
                  className="w-full text-sm p-2 border border-gray-300 rounded mt-1"
                  value={selectedPartId}
                  onChange={(e) => setSelectedPartId(e.target.value)}
                >
                  <option value="">-- Pilih Suku Cadang --</option>
                  {filteredModalParts.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.kode_suku_cadang}] {p.nama_suku_cadang} (Stok:{" "}
                      {p.stok_sekarang})
                    </option>
                  ))}
                </select>
                {lowStockParts.length === 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Semua inventori masih aman. Keranjang tidak dapat diisi.
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className="text-xs font-bold text-gray-700">
                  Jumlah (Qty)
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full text-sm p-2 border border-gray-300 rounded mt-1"
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(e.target.value)}
                />
              </div>

              <div className="col-span-1 flex items-end pb-0.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 text-white font-semibold flex items-center justify-center p-2 rounded gap-1 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" /> Tambah
                </button>
              </div>
            </div>

            <div className="border rounded mb-4 overflow-hidden">
              <table className="w-full text-left text-sm bg-white">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-3">Kode</th>
                    <th className="p-3">Suku Cadang</th>
                    <th className="p-3">Qty Pesan</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.part.id} className="border-b last:border-b-0">
                      <td className="p-3">{item.part.kode_suku_cadang}</td>
                      <td className="p-3">{item.part.nama_suku_cadang}</td>
                      <td className="p-3 font-semibold">{item.qty} Pcs</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeFromCart(item.part.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cartItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400">
                        Keranjang masih kosong, lengkapi di atas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mb-6">
              <label className="text-sm font-bold text-gray-700">
                Catatan Order (Opsional)
              </label>
              <textarea
                className="w-full text-sm p-2 border border-gray-300 rounded mt-1"
                rows={2}
                placeholder="Tulis alasan urgensi dsb..."
                value={cartNotes}
                onChange={(e) => setCartNotes(e.target.value)}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setIsCartOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors w-full sm:w-auto"
                onClick={handleSubmitCart}
              >
                Kirim / Ajukan Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KOPERASI DECISION */}
      {isKoperasiModalOpen && user?.role === "koperasi" && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>
              Keputusan Order Surat Suku Cadang
            </h2>
            <form onSubmit={handleKoperasiSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status Surat *</label>
                <select
                  className={styles.formInput}
                  value={koperasiData.status}
                  onChange={(e) =>
                    setKoperasiData({ ...koperasiData, status: e.target.value })
                  }
                  required
                >
                  <option value="">-- Pilih Keputusan --</option>
                  <option value="disetujui">Approve Keseluruhan</option>
                  <option value="menunggu">Pending / Tahan</option>
                  <option value="ditolak">Tolak Surat Pengajuan</option>
                </select>
              </div>

              {(koperasiData.status === "ditolak" ||
                koperasiData.status === "menunggu") && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Catatan{" "}
                    {koperasiData.status === "ditolak" ? "*" : "(Opsional)"}
                  </label>
                  <textarea
                    className={styles.formInput}
                    style={{ minHeight: "80px", resize: "vertical" }}
                    placeholder={
                      koperasiData.status === "ditolak"
                        ? "Wajib: alasan penolakan..."
                        : "Tambahkan catatan pending..."
                    }
                    value={koperasiData.catatan}
                    onChange={(e) =>
                      setKoperasiData({
                        ...koperasiData,
                        catatan: e.target.value,
                      })
                    }
                    required={koperasiData.status === "ditolak"}
                  />
                </div>
              )}

              {koperasiData.status === "menunggu" && (
                <div className="flex gap-4 mb-4 mt-2">
                  <div className="flex-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Tanggal Awal Est. *
                    </label>
                    <input
                      type="date"
                      required
                      className={styles.formInput}
                      value={koperasiData.tanggal_awal}
                      onChange={(e) =>
                        setKoperasiData({
                          ...koperasiData,
                          tanggal_awal: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Tanggal Akhir Est. *
                    </label>
                    <input
                      type="date"
                      required
                      className={styles.formInput}
                      value={koperasiData.tanggal_akhir}
                      onChange={(e) =>
                        setKoperasiData({
                          ...koperasiData,
                          tanggal_akhir: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors w-full sm:w-auto"
                >
                  Simpan Keputusan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTES MODAL */}
      {notesModalOrder && (
        <NotesModal
          orderId={notesModalOrder.id}
          catatanFo={notesModalOrder.catatan_fo}
          catatanKoperasi={notesModalOrder.catatan_koperasi}
          onClose={() => setNotesModalOrder(null)}
        />
      )}
    </div>
  );
};

export default OrderList;
