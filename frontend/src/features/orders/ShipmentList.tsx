import React, { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import { useAuth } from "../../app/AuthContext";
import Swal from "sweetalert2";
import { Search, Download, Camera } from "lucide-react";
import styles from "./ShipmentList.module.css";

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
  spare_part_shipments: Shipment[];
}

interface ShipmentEvidence {
  id: number;
  evidence_type: string;
  original_filename: string;
}

interface Shipment {
  id: number;
  quantity: number;
  status: "menunggu_verifikasi" | "disetujui" | "ditolak";
  rejection_note: string | null;
  created_at: string;
  verified_at: string | null;
  shipment_type: string;
  spare_part_order: Order;
  evidences?: ShipmentEvidence[];
}

const ShipmentList: React.FC = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [approvedOrders, setApprovedOrders] = useState<Order[]>([]);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterDate, setFilterDate] = useState("");

  // Creation State (For Koperasi)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    spare_part_order_id: "",
    quantity: "1",
    harga_jual: "",
  });
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  // Modal State for Image/PDF Preview & Detail
  const [selectedShipmentDetail, setSelectedShipmentDetail] =
    useState<any>(null);
  const [previewEvidenceUrl, setPreviewEvidenceUrl] = useState<string | null>(
    null,
  );
  const [previewEvidenceName, setPreviewEvidenceName] = useState<string | null>(
    null,
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchShipments();
    if (user?.role === "koperasi") {
      fetchApprovedOrders();
    }
  }, [user]);

  const fetchShipments = async () => {
    try {
      const res = await apiClient.get("/spare-part-shipments");
      setShipments(res.data.data);
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: "error", text: "Gagal memuat data pengiriman barang" });
    }
  };

  const fetchApprovedOrders = async () => {
    try {
      const res = await apiClient.get("/spare-part-orders");
      // Filter out orders that are NOT approved or ALREADY have an INITIAL shipment
      const filtered = res.data.data.filter((o: any) => {
        if (o.status !== "disetujui") return false;
        const hasInitialShipment = o.spare_part_shipments?.some(
          (s: Shipment) => s.shipment_type === "initial",
        );
        return !hasInitialShipment;
      });
      setApprovedOrders(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.spare_part_order_id ||
      !formData.quantity ||
      !formData.harga_jual
    ) {
      Swal.fire({
        icon: "warning",
        text: "Lengkapi field wajib (*) pada form pengiriman",
      });
      return;
    }

    if (!evidenceFile) {
      Swal.fire({
        icon: "warning",
        text: "Wajib melampirkan berkas bukti / foto barang untuk pengiriman",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Buat Draft Pengiriman
      const res = await apiClient.post("/spare-part-shipments", formData);
      const shipmentId = res.data.data.id;

      // 2. Unggah Evidence
      const formDataObj = new FormData();
      formDataObj.append("evidence_type", "shipment_initial");
      formDataObj.append("file", evidenceFile);

      await apiClient.post(
        `/spare-part-shipments/${shipmentId}/evidences`,
        formDataObj,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      // 3. Submit Pengiriman
      await apiClient.post(`/spare-part-shipments/${shipmentId}/submit`);

      fetchShipments();
      fetchApprovedOrders(); // Refresh unhandled orders
      setIsFormOpen(false);
      setFormData({
        spare_part_order_id: "",
        quantity: "1",
        harga_jual: "",
      });
      setEvidenceFile(null);
      Swal.fire({
        icon: "success",
        title: "Pengiriman Dikirim",
        text: "Bukti dikirim lancar, menunggu verifikasi lapangan oleh Front Office.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal membuat pengiriman",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadEvidence = async (evidenceId: number, filename: string) => {
    try {
      const response = await apiClient.get(
        `/shipment-evidences/${evidenceId}/download`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      Swal.fire({ icon: "error", text: "Terjadi kesalahan unduh bukti" });
    }
  };

  const previewEvidence = async (evidenceId: number, filename: string) => {
    setIsPreviewLoading(true);
    setPreviewEvidenceName(filename);
    try {
      const response = await apiClient.get(
        `/shipment-evidences/${evidenceId}/download`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setPreviewEvidenceUrl(url);
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: "Terjadi kesalahan memuat pratinjau bukti",
      });
      setPreviewEvidenceUrl(null);
      setPreviewEvidenceName(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const openDetailModal = (shipment: any) => {
    setSelectedShipmentDetail(shipment);
    setPreviewEvidenceUrl(null); // reset selected image in modal
    setPreviewEvidenceName(null);
  };

  const handleVerification = async (shipmentId: number, isApprove: boolean) => {
    if (isApprove) {
      try {
        await apiClient.patch(`/spare-part-shipments/${shipmentId}/verify`, {
          status: "disetujui",
        });
        fetchShipments();
        Swal.fire({
          icon: "success",
          title: "Terverifikasi!",
          text: "Stok inventori telah otomatis diperbarui sistem. Jika ini retur, tiket Retur tertutup tuntas.",
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
      const { value: formValues } = await Swal.fire({
        title: "Tolak Pengiriman",
        html: `
          <textarea id="swal-input1" class="swal2-textarea" placeholder="Alasan Penolakan..."></textarea>
          <label style="display:block; text-align:left; margin-top:20px; font-weight:bold;">Lampiran Foto Cacat/Kerusakan dari Kurir:</label>
          <input type="file" id="swal-input2" class="swal2-file" accept="image/*,application/pdf">
        `,
        preConfirm: () => {
          const text = (
            document.getElementById("swal-input1") as HTMLTextAreaElement
          ).value;
          const fileInput = document.getElementById(
            "swal-input2",
          ) as HTMLInputElement;
          const file = fileInput.files ? fileInput.files[0] : null;

          if (!text) {
            Swal.showValidationMessage("Alasan penolakan diwajibkan.");
            return false; // blocks promise
          }
          if (!file) {
            Swal.showValidationMessage(
              "Bukti foto barang cacat/rusak diwajibkan.",
            );
            return false;
          }
          return { text, file };
        },
        showCancelButton: true,
      });

      if (formValues) {
        Swal.fire({
          title: "Mengunggah Laporan Retur...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        try {
          // 1. Upload Damage Evidence First!
          const formDataObj = new FormData();
          formDataObj.append("evidence_type", "damage_or_defect");
          formDataObj.append("file", formValues.file);

          await apiClient.post(
            `/spare-part-shipments/${shipmentId}/evidences`,
            formDataObj,
            { headers: { "Content-Type": "multipart/form-data" } },
          );

          // 2. Commit Verification Reject -> Returns Automatically Created By Backend
          await apiClient.patch(`/spare-part-shipments/${shipmentId}/verify`, {
            status: "ditolak",
            rejection_note: formValues.text,
          });

          fetchShipments();
          Swal.fire({
            icon: "success",
            title: "Pengaduan Dicatat",
            text: "Tiket Retur resmi dilempar ke Koperasi untuk ditangani.",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err: any) {
          Swal.fire({
            icon: "error",
            text:
              err.response?.data?.message || "Terjadi kesalahan sinkronisasi",
          });
        }
      }
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "menunggu_verifikasi":
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

  const displayedShipments = shipments.filter((r) => {
    // 1. Search (Nama suku cadang or pembuat order)
    const suku = (
      r.spare_part_order?.spare_part?.nama_suku_cadang || ""
    ).toLowerCase();
    const sub = (r.spare_part_order?.user?.nama_user || "").toLowerCase();
    const s = searchTerm.toLowerCase();
    if (searchTerm && !suku.includes(s) && !sub.includes(s)) return false;

    // 2. Status
    if (filterStatus !== "semua" && r.status !== filterStatus) return false;

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
          <h1 className={styles.pageTitle}>Logistik Pengiriman DO</h1>
          <p className={styles.pageSubtitle}>
            Catat kedatangan logistik gudang & lampirkan dokumen foto faktur
          </p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className="p-4 flex flex-wrap gap-4 items-center justify-between border-b border-gray-200">
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
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <select
              className={styles.toolbarSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="semua">Semua Status</option>
              <option value="disetujui">Stok Masuk Lunas</option>
              <option value="menunggu_verifikasi">Tahap Verifikasi</option>
              <option value="ditolak">Batal Verifikasi</option>
            </select>
            <input
              type="date"
              className={styles.toolbarInput}
              style={{ width: "200px" }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            {user?.role === "koperasi" && !isFormOpen && (
              <button
                className={styles.btnPrimary}
                onClick={() => setIsFormOpen(true)}
              >
                + Buat Surat Jalan DO
              </button>
            )}
          </div>
        </div>

        {isFormOpen && user?.role === "koperasi" && (
          <div className={styles.formContainer}>
            <h3 className={styles.formTitle}>
              Pencatatan Surat Jalan (DO) Ke UPJ
            </h3>

            {approvedOrders.length === 0 ? (
              <p className="text-gray-500 italic text-sm">
                Belum ada pesanan yang "Disetujui" dan belum memiliki riwayat
                pengiriman.
              </p>
            ) : (
              <form onSubmit={handleCreateShipment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={styles.formLabel}>
                      Referensi Order Suku Cadang *
                    </label>
                    <select
                      className={styles.formInput}
                      value={formData.spare_part_order_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          spare_part_order_id: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">-- Pilih Pesanan (Approved) --</option>
                      {approvedOrders.map((o) => (
                        <option key={o.id} value={o.id}>
                          #{o.id} - {o.spare_part.nama_suku_cadang} (Pesan:{" "}
                          {o.jumlah}) | Oleh: {o.user.nama_user}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={styles.formLabel}>
                      Kuantitas Aktual Dikirim *
                    </label>
                    <input
                      type="number"
                      className={styles.formInput}
                      min="1"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className={styles.formLabel}>
                      Harga Jual UPJ (Rp) *
                    </label>
                    <input
                      type="number"
                      className={styles.formInput}
                      min="0"
                      value={formData.harga_jual}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          harga_jual: e.target.value,
                        })
                      }
                      required
                      placeholder="Cth: 65000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      (Otomatis meng-update harga referensi jualan di sistem
                      Suku Cadang)
                    </p>
                  </div>
                </div>

                <div>
                  <label className={styles.formLabel}>
                    Upload Foto Surat Jalan & Kondisi Barang *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors bg-blue-50 cursor-pointer relative">
                    <div className="space-y-1 text-center">
                      <Camera className="mx-auto h-12 w-12 text-blue-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 p-1"
                        >
                          <span>Unggah File</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setEvidenceFile(e.target.files[0]);
                              }
                            }}
                            required
                          />
                        </label>
                        <p className="pl-1">atau seret file ke sini</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF up to 5MB
                      </p>
                      {evidenceFile && (
                        <div className="mt-2 text-sm font-semibold text-green-600">
                          Berkas Terpilih: {evidenceFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Mengunggah..."
                      : "Simpan Terbitkan Pengiriman"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableCell}>Kode</th>
                <th className={styles.tableCell}>Order Reference</th>
                <th className={styles.tableCell}>Total Kirim</th>
                <th className={styles.tableCell}>Status Fisik</th>
                <th className={styles.tableCell}>Detail & Bukti</th>
                <th className={styles.tableCell}>Aksi Verifikasi (FO)</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {displayedShipments.map((shipment) => (
                <tr key={shipment.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <span className="font-semibold text-gray-700">
                      SHP-{shipment.id.toString().padStart(4, "0")}
                      {shipment.shipment_type === "replacement" && (
                        <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded">
                          RPL
                        </span>
                      )}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Log: {formatDate(shipment.created_at)}
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className="font-medium text-gray-800">
                      ORD-
                      {shipment.spare_part_order.id.toString().padStart(4, "0")}
                    </span>
                    <br />
                    <span className="text-sm text-gray-600">
                      {shipment.spare_part_order.spare_part.nama_suku_cadang}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className="font-bold text-gray-900">
                      {shipment.quantity} Pcs
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    {statusBadge(shipment.status)}
                    {shipment.rejection_note && (
                      <p className="text-xs text-red-600 mt-1 italic max-w-xs">
                        " {shipment.rejection_note} "
                      </p>
                    )}
                  </td>
                  <td className={styles.tableCell}>
                    <button
                      onClick={() => openDetailModal(shipment)}
                      className="inline-flex flex-col items-center justify-center bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded transition-colors text-xs font-semibold shadow-sm w-full max-w-[120px]"
                    >
                      <span className="mb-0.5">Lihat Detail</span>
                      {shipment.evidences && shipment.evidences.length > 0 ? (
                        <span className="text-[10px] bg-green-100 text-green-800 px-1.5 rounded-full">
                          + {shipment.evidences.length} Lampiran
                        </span>
                      ) : (
                        <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 rounded-full">
                          Kosong
                        </span>
                      )}
                    </button>
                  </td>
                  <td className={styles.tableCell}>
                    {user?.role === "front_office" &&
                      shipment.status === "menunggu_verifikasi" && (
                        <div className="flex gap-2">
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded shadow-sm text-sm"
                            title="Setujui Barang"
                            onClick={() =>
                              handleVerification(shipment.id, true)
                            }
                          >
                            Setujui Fisik
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded shadow-sm text-sm"
                            title="Tolak Barang (Cacat/Kurang)"
                            onClick={() =>
                              handleVerification(shipment.id, false)
                            }
                          >
                            X Tolak
                          </button>
                        </div>
                      )}
                    {user?.role === "front_office" &&
                      shipment.status !== "menunggu_verifikasi" && (
                        <span className="text-sm text-gray-400 cursor-not-allowed">
                          Sudah Diperiksa
                        </span>
                      )}
                    {user?.role !== "front_office" && (
                      <span className="text-sm text-gray-400">Read-Only</span>
                    )}
                  </td>
                </tr>
              ))}
              {displayedShipments.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500 bg-gray-50"
                  >
                    Tidak ada riwayat pengiriman logistik ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL ORDER LOGISTIK & GAMBAR */}
      {selectedShipmentDetail && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4"
          onClick={() => {
            setSelectedShipmentDetail(null);
            setPreviewEvidenceUrl(null);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
              <div>
                <h2 className="text-lg font-bold text-gray-800 m-0 leading-tight">
                  Detail Pengiriman Logistik
                </h2>
                <div className="text-xs text-gray-500 mt-1 font-medium">
                  ID: SHP-
                  {selectedShipmentDetail.id.toString().padStart(4, "0")} |
                  Dirilis: {formatDate(selectedShipmentDetail.created_at)}
                </div>
              </div>
              <div>{statusBadge(selectedShipmentDetail.status)}</div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Box Rincian Suku Cadang */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                  Informasi Barang (Suku Cadang)
                </h3>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Referensi Nomor Order
                    </label>
                    <div className="text-sm font-bold text-blue-700 bg-blue-50 py-1.5 px-3 rounded inline-block">
                      ORD-
                      {selectedShipmentDetail.spare_part_order.id
                        .toString()
                        .padStart(4, "0")}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Total Kuantitas Dokumen
                    </label>
                    <div className="text-sm font-bold text-gray-900">
                      {selectedShipmentDetail.quantity}{" "}
                      <span className="font-normal text-gray-500">
                        {selectedShipmentDetail.spare_part_order.spare_part
                          .satuan || "Pcs"}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Nama Suku Cadang Aktif
                    </label>
                    <div className="text-base font-semibold text-gray-800">
                      [
                      {
                        selectedShipmentDetail.spare_part_order.spare_part
                          .kode_suku_cadang
                      }
                      ] -{" "}
                      {
                        selectedShipmentDetail.spare_part_order.spare_part
                          .nama_suku_cadang
                      }
                    </div>
                  </div>
                  {selectedShipmentDetail.rejection_note && (
                    <div className="col-span-2 mt-2 bg-red-50 border border-red-100 rounded p-3">
                      <label className="block text-[11px] font-semibold text-red-600 mb-1">
                        Catatan Penolakan Defect / Cacat (FO)
                      </label>
                      <div className="text-sm text-red-700 italic">
                        " {selectedShipmentDetail.rejection_note} "
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Box Lampiran Faktur S3 */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                  Lampiran Bukti Dokumen/Foto
                </h3>

                <div className="space-y-4">
                  {/* Daftar Tombol Evidences */}
                  <div className="flex flex-wrap gap-2">
                    {selectedShipmentDetail.evidences &&
                    selectedShipmentDetail.evidences.length > 0 ? (
                      selectedShipmentDetail.evidences.map(
                        (ev: any, index: number) => (
                          <div
                            key={ev.id}
                            className="flex gap-0.5 shadow-sm rounded overflow-hidden border border-gray-200"
                          >
                            <button
                              onClick={() =>
                                previewEvidence(ev.id, ev.original_filename)
                              }
                              disabled={isPreviewLoading}
                              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${previewEvidenceName === ev.original_filename ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                            >
                              <Download size={14} /> Dokumen Lampiran #
                              {index + 1}
                            </button>
                            <button
                              onClick={() =>
                                downloadEvidence(ev.id, ev.original_filename)
                              }
                              title="Unduh Paksa ke Perangkat"
                              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 flex items-center justify-center border-l border-gray-200 transition-colors"
                            >
                              ↓
                            </button>
                          </div>
                        ),
                      )
                    ) : (
                      <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded w-full text-center border border-dashed border-gray-300">
                        Tidak ada berkas bukti yang dilampirkan oleh Koperasi
                        pada pengiriman ini.
                      </div>
                    )}
                  </div>

                  {/* Render Area Gambar / PDF (muncul jika ada yg di-klik) */}
                  {isPreviewLoading && (
                    <div className="w-full h-32 flex items-center justify-center bg-gray-50 rounded border border-gray-100">
                      <span className="text-sm text-gray-500 animate-pulse">
                        Menarik data dari Cloud Storage S3...
                      </span>
                    </div>
                  )}

                  {!isPreviewLoading && previewEvidenceUrl && (
                    <div className="mt-4 bg-gray-900 rounded-md p-2 flex justify-center items-center overflow-hidden">
                      {previewEvidenceName?.toLowerCase().endsWith(".pdf") ? (
                        <iframe
                          src={previewEvidenceUrl}
                          width="100%"
                          height="400px"
                          title="Bukti PDF"
                          className="bg-white rounded"
                        />
                      ) : (
                        <img
                          src={previewEvidenceUrl}
                          alt={previewEvidenceName || "Bukti Surat Jalan"}
                          className="max-h-[500px] max-w-full object-contain rounded"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end rounded-b-lg">
              <button
                className="px-6 py-2.5 text-sm font-bold text-white bg-gray-800 hover:bg-gray-900 shadow-md rounded-md transition-all active:scale-95"
                onClick={() => {
                  setSelectedShipmentDetail(null);
                  setPreviewEvidenceUrl(null);
                }}
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentList;
