import React, { useState, useEffect, useMemo } from "react";
import { apiClient } from "../../lib/api";
import Swal from "sweetalert2";
import { Search, Plus, X, FileText, Camera } from "lucide-react";
import styles from "../orders/ShipmentList.module.css";
import PrintHeader from "../../components/common/PrintHeader";
import KoperasiReturns from "./KoperasiReturns";
import DeliveryNoteModal from "../../components/common/DeliveryNoteModal";

export default function KoperasiPenerimaan() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [approvedOrders, setApprovedOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"initial" | "returns">("initial");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Grouped Order Tracking Modal
  const [viewDetailOrder, setViewDetailOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchShipments();
    fetchApprovedOrders();
  }, []);

  const fetchShipments = async () => {
    try {
      const res = await apiClient.get("/spare-part-shipments");
      setShipments(res.data.data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", text: "Gagal memuat data pengiriman barang" });
    }
  };

  const fetchApprovedOrders = async () => {
    try {
      const res = await apiClient.get("/spare-part-orders");
      // Filter out approved orders and extract their unfulfilled details
      const filtered = res.data.data.filter(
        (o: any) => o.status === "disetujui",
      );

      const unfulfilledOrders = filtered.filter((order: any) => {
        // Only keep orders where at least one detail has no initial shipment
        return (order.spare_part_order_details || []).some((detail: any) => {
          return !detail.spare_part_shipments?.some(
            (s: any) => s.shipment_type === "initial",
          );
        });
      });
      setApprovedOrders(unfulfilledOrders);
    } catch (err) {
      console.error(err);
    }
  };

  // Group shipmens by Order Number
  const groupedShipments = useMemo(() => {
    const list = shipments.filter((s) => s.shipment_type === activeTab);
    const groups: Record<string, any> = {};

    list.forEach((s) => {
      const order = s.spare_part_order_detail?.spare_part_order;
      if (!order) return;
      const orderNo = order.nomor_surat_order;
      if (!groups[orderNo]) {
        groups[orderNo] = {
          orderInfo: order,
          shipments: [],
          totalQty: 0,
          types: new Set(),
          status: s.status, // take status of the first encountered
          created_at: s.created_at,
        };
      }
      groups[orderNo].shipments.push(s);
      groups[orderNo].totalQty += s.quantity;
      groups[orderNo].types.add(s.spare_part_order_detail.spare_part_id);
    });

    return Object.values(groups)
      .filter((g) => {
        if (!searchTerm) return true;
        return g.orderInfo.nomor_surat_order
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [shipments, activeTab, searchTerm]);

  const handleOpenForm = () => {
    setSelectedOrderId("");
    setQuantities({});
    setPrices({});
    setEvidenceFile(null);
    setIsFormOpen(true);
  };

  const selectedOrderDetails = useMemo(() => {
    if (!selectedOrderId) return [];
    const order = approvedOrders.find(
      (o) => o.id.toString() === selectedOrderId,
    );
    if (!order) return [];
    // Only return items that haven't been shipped
    return (order.spare_part_order_details || []).filter((d: any) => {
      return !d.spare_part_shipments?.some(
        (s: any) => s.shipment_type === "initial",
      );
    });
  }, [selectedOrderId, approvedOrders]);

  const handleCreateShipmentBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !evidenceFile) {
      Swal.fire({
        icon: "warning",
        text: "Pilih Referensi Order dan unggah kelengkapan Surat Jalan!",
      });
      return;
    }

    // Map the items
    const items = selectedOrderDetails
      .map((detail: any) => ({
        spare_part_order_detail_id: detail.id,
        quantity: parseInt(quantities[detail.id] || "0"),
        harga_jual: parseFloat(prices[detail.id] || "0"),
      }))
      .filter((item: any) => item.quantity > 0 && item.harga_jual > 0);

    if (items.length === 0) {
      Swal.fire({
        icon: "warning",
        text: "Harap isi minimal 1 barang dengan kombinasi Qty & Harga valid!",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Shipments Batch
      const res = await apiClient.post("/spare-part-shipments", {
        spare_part_order_id: selectedOrderId,
        items,
      });
      const createdShipments = res.data.data;
      if (!createdShipments || createdShipments.length === 0) {
        throw new Error("Shipment berhasil diajukan namun detail API kosong.");
      }

      // Extract IDs for mapping
      const shipment_ids = createdShipments.map((s: any) => s.id);

      // 2. Upload Batch Evidence
      const formData = new FormData();
      shipment_ids.forEach((id: number) =>
        formData.append("shipment_ids[]", String(id)),
      );
      formData.append("evidence_type", "shipment_initial");
      formData.append("file", evidenceFile);

      await apiClient.post("/spare-part-shipments/batch-evidences", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Surat Jalan berhasil direkam secara penuh.",
      });
      setIsFormOpen(false);
      fetchShipments();
      fetchApprovedOrders();
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Gagal membuat pengiriman",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Print (For Modal Print) */}
      <div className="hidden print:block mb-8">
        <PrintHeader
          title="Bukti Pengiriman Logistik (DO)"
          subtitle="KOPERASI UPJ AHASS BLPT DIY"
          periodLabel=""
        />
      </div>

      <div className="print:hidden">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Logistik Pengiriman DO</h1>
          <p className={styles.pageSubtitle}>
            Catat barang yang dikirim Koperasi serta lampirkan Surat Jalan DO
          </p>
        </div>

        {/* Beautiful Tab Switching Card */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-2 sm:w-max">
          <button
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex-1 sm:flex-none text-center ${
              activeTab === "initial"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("initial")}
          >
            Penerimaan PO Baru
          </button>
          <button
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex-1 sm:flex-none text-center ${
              activeTab === "returns"
                ? "bg-red-500 text-white shadow-md shadow-red-200"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("returns")}
          >
            Barang Retur / Pengganti (RPL)
          </button>
        </div>

        {/* Grouped Table */}
        {activeTab === "initial" && (
          <div className={styles.tableCard}>
            {/* Integrated Search & Actions Toolbar */}
            <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-gray-50"
                  placeholder="Pencarian Ref Order..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-auto flex shrink-0">
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 font-medium py-2 px-5 rounded-lg transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 w-full"
                  onClick={handleOpenForm}
                >
                  <Plus className="w-4 h-4" /> Surat Jalan Baru
                </button>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Ref Order (DO)</th>
                    <th>Jumlah Jenis Barang</th>
                    <th>Total Kuantitas</th>
                    <th>Status Grup</th>
                    <th>Waktu Catat DO</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedShipments.map((group, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold text-gray-800">
                        {group.orderInfo.nomor_surat_order}
                      </td>
                      <td>{group.types.size} Jenis Suku Cadang</td>
                      <td>{group.totalQty} Item</td>
                      <td>
                        <span
                          className={
                            group.status === "disetujui"
                              ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium"
                              : group.status === "ditolak"
                                ? "bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium"
                                : "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium"
                          }
                        >
                          {group.status === "disetujui"
                            ? "Terverifikasi FO"
                            : group.status === "ditolak"
                              ? "Ditolak"
                              : "Menunggu Verifikasi"}
                        </span>
                      </td>
                      <td>
                        {new Date(group.created_at).toLocaleDateString()}{" "}
                        {new Date(group.created_at).toLocaleTimeString()}
                      </td>
                      <td>
                        <button
                          className="text-blue-500 hover:text-blue-700 text-sm font-semibold inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                          onClick={() => setViewDetailOrder(group)}
                        >
                          <FileText className="w-4 h-4" /> [ Lihat Detail ]
                        </button>
                      </td>
                    </tr>
                  ))}
                  {groupedShipments.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          textAlign: "center",
                          padding: "32px",
                          color: "#64748b",
                        }}
                      >
                        Tidak ada riwayat pengiriman kelompok order yang sesuai.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Pencatatan Surat Jalan (Order-Based)
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-500 hover:text-red-500 focus:outline-none transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={handleCreateShipmentBatch}
              className="p-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Referensi Order Suku Cadang *
                  </label>
                  <select
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    required
                  >
                    <option value="">Pilih Rincian Pesanan (Disetujui)</option>
                    {approvedOrders.map((order) => {
                      return (
                        <option key={order.id} value={order.id}>
                          [{order.nomor_surat_order}] - Total:{" "}
                          {order.spare_part_order_details?.length || 0} Jenis
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Hanya menampilkan pesanan yang masih memiliki antrian
                    pengiriman awal.
                  </p>
                </div>
              </div>

              {selectedOrderId && (
                <div className="border border-gray-200 rounded-md overflow-hidden my-4">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600">
                    <div className="col-span-5">Barang & Suku Cadang</div>
                    <div className="col-span-3 text-center">Permintaan Qty</div>
                    <div className="col-span-2 text-center">
                      Kuantitas Aktual Dikirim
                    </div>
                    <div className="col-span-2 text-center">
                      Harga Jual UPJ (Rp)
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto bg-white">
                    {selectedOrderDetails.map((detail: any, idx: number) => (
                      <div
                        key={detail.id}
                        className={`px-4 py-3 grid grid-cols-12 gap-4 items-center ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <div className="col-span-5 flex flex-col">
                          <span className="font-semibold text-gray-800">
                            {detail.spare_part?.nama_suku_cadang}
                          </span>
                          <span className="text-xs text-gray-500">
                            {detail.spare_part?.kode_suku_cadang}
                          </span>
                        </div>
                        <div className="col-span-3 text-center">
                          <span className="font-bold text-gray-700">
                            {detail.jumlah_qty}
                          </span>{" "}
                          {detail.spare_part?.satuan}
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0"
                            className="w-full px-2 py-1 border rounded text-center text-sm"
                            placeholder="0"
                            value={
                              quantities[detail.id] !== undefined
                                ? quantities[detail.id]
                                : ""
                            }
                            onChange={(e) =>
                              setQuantities((prev) => ({
                                ...prev,
                                [detail.id]: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0"
                            className="w-full px-2 py-1 border rounded text-center text-sm"
                            placeholder="0"
                            value={
                              prices[detail.id] !== undefined
                                ? prices[detail.id]
                                : ""
                            }
                            onChange={(e) =>
                              setPrices((prev) => ({
                                ...prev,
                                [detail.id]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Foto Bukti DO (Seluruh Kelompok Ini) *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 relative">
                  <div className="space-y-1 text-center">
                    <Camera className="mx-auto h-12 w-12 text-blue-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md px-3 py-1 font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 border border-gray-200 mx-auto shadow-sm">
                        <span>Pilih File Gambar</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setEvidenceFile(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                    {evidenceFile ? (
                      <p className="text-sm font-semibold text-green-600">
                        File Terpilih: {evidenceFile.name} (
                        {(evidenceFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, PDF up to 5MB
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
                  onClick={() => setIsFormOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shadow-sm transition-colors ${
                    isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting
                    ? "Menyimpan..."
                    : "Simpan & Terbitkan Pengiriman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal (Card + A4) */}
      {viewDetailOrder && (
        <DeliveryNoteModal
          group={viewDetailOrder}
          onClose={() => setViewDetailOrder(null)}
        />
      )}

      {/* Tab 2: Koperasi Returns UI */}
      {activeTab === "returns" && <KoperasiReturns />}
    </div>
  );
}
