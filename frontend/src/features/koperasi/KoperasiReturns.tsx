import { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import Swal from "sweetalert2";
import { Search, Camera, Check, X } from "lucide-react";
import styles from "../orders/ShipmentList.module.css";

export default function KoperasiReturns() {
  const [returnHeaders, setReturnHeaders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // RPL Upload State
  const [showRplForm, setShowRplForm] = useState(false);
  const [rplInvoiceFile, setRplInvoiceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rejection State
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Evidence Preview State
  const [previewEvidenceUrl, setPreviewEvidenceUrl] = useState<string | null>(
    null,
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await apiClient.get("/spare-part-returns");
      setReturnHeaders(res.data.data);
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: "error", text: "Gagal memuat daftar Retur Logistik" });
    }
  };

  const previewEvidence = async (evidenceId: number) => {
    setIsPreviewLoading(true);
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
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleRejectTicket = async () => {
    if (!rejectReason.trim()) {
      Swal.fire({ icon: "warning", text: "Mohon isi alasan penolakan" });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.patch(`/spare-part-returns/${selectedTicket.id}/reject`, {
        catatan_koperasi: rejectReason,
      });
      Swal.fire({ icon: "success", text: "Tiket retur berhasil ditolak" });
      setSelectedTicket(null);
      setShowRejectForm(false);
      setRejectReason("");
      fetchReturns();
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        text: err.response?.data?.message || "Gagal menolak tiket retur",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveAndSendRPL = async () => {
    if (!rplInvoiceFile) {
      Swal.fire({
        icon: "warning",
        text: "Mohon unggah Foto DO Pengganti (RPL) terlebih dahulu!",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Create replacements & transition status
      const res = await apiClient.post(
        `/spare-part-returns/${selectedTicket.id}/replacement-shipment`,
      );
      const createdRplShipments = res.data.data;

      // 2. Upload Batch Evidence for the Replacements
      const fd = new FormData();
      fd.append("evidence_type", "shipment_replacement");
      createdRplShipments.forEach((rs: any) => {
        fd.append("shipment_ids[]", rs.id.toString());
      });
      fd.append("file", rplInvoiceFile);

      await apiClient.post("/spare-part-shipments/batch-evidences", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      Swal.fire({
        icon: "success",
        text: "RPL berhasil disetujui & Surat Jalan tersimpan.",
      });
      fetchReturns();
      setSelectedTicket(null);
      setShowRplForm(false);
      setRplInvoiceFile(null);
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        text: err.response?.data?.message || "Gagal menyetujui RPL",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTickets = returnHeaders.filter((t) => {
    if (!searchTerm) return true;
    return t.nomor_tiket_retur.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className={styles.container}>
      {/* TIKET RETUR GRID */}
      <div className={styles.tableCard}>
        <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-gray-800 self-start sm:self-auto">
            Daftar Tiket Retur / Pengganti (FO)
          </h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-gray-50"
              placeholder="Cari No Tiket Retur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>No Tiket Retur</th>
                <th>Order Reference</th>
                <th>Total Item Diretur</th>
                <th>Waktu Pengajuan</th>
                <th>Status Respons</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((tiket: any) => (
                <tr
                  key={tiket.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="font-bold text-gray-800">
                    {tiket.nomor_tiket_retur}
                  </td>
                  <td className="font-semibold text-gray-600">
                    {tiket.spare_part_order?.nomor_surat_order}
                  </td>
                  <td className="text-gray-700 font-bold">
                    {tiket.spare_part_returns?.reduce(
                      (acc: any, i: any) => acc + i.quantity,
                      0,
                    )}{" "}
                    Pcs / Item
                  </td>
                  <td className="text-sm text-gray-500">
                    {new Date(tiket.created_at).toLocaleString("id-ID")}
                  </td>
                  <td>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm border ${
                        tiket.status === "menunggu_pengiriman_ulang"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : tiket.status === "dikirim_ulang"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : tiket.status === "selesai"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {tiket.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedTicket(tiket);
                        setShowRplForm(false);
                        setRplInvoiceFile(null);
                        setPreviewEvidenceUrl(null);
                      }}
                      className="bg-indigo-50 text-indigo-700 font-semibold px-4 py-1.5 rounded hover:bg-indigo-100 transition shadow-sm border border-indigo-100 text-sm"
                    >
                      Detail Modal
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500">
                    Tidak ada tiket retur yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL TIKET & PENANGANAN (MODAL KOPERASI) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-4 px-6 pt-6">
              <div>
                <h3 className="font-bold text-gray-800 text-xl">
                  Penanganan Retur (RPL)
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Tiket: {selectedTicket.nomor_tiket_retur}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setPreviewEvidenceUrl(null);
                  setShowRplForm(false);
                  setRplInvoiceFile(null);
                  setShowRejectForm(false);
                  setRejectReason("");
                }}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body List Item */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex gap-6">
              {/* Left: Item Detail Table */}
              <div className="flex-1 space-y-4">
                <h3 className="font-bold text-gray-700 bg-white px-4 py-2 border rounded-md shadow-sm border-gray-200">
                  Daftar Keluhan Barang (Ref:{" "}
                  {selectedTicket.spare_part_order?.nomor_surat_order})
                </h3>

                {selectedTicket.spare_part_returns.map(
                  (det: any, idx: number) => {
                    const evidences =
                      det.spare_part_shipment?.evidences?.filter(
                        (e: any) => e.evidence_type === "damage_or_defect",
                      ) || [];

                    return (
                      <div
                        key={idx}
                        className="bg-white border rounded-lg p-5 shadow-sm border-l-4 border-l-red-400"
                      >
                        <div className="flex justify-between items-start mb-3 border-b pb-3">
                          <div>
                            <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                              {
                                det.spare_part_order_detail.spare_part
                                  .kode_suku_cadang
                              }
                            </p>
                            <h4 className="font-bold text-lg text-gray-800">
                              {
                                det.spare_part_order_detail.spare_part
                                  .nama_suku_cadang
                              }
                            </h4>
                          </div>
                          <div className="bg-red-50 border border-red-200 px-3 py-1 rounded-md text-red-700 font-bold">
                            {det.quantity} Unit Diretur
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">
                              Catatan Front Office (FO):
                            </label>
                            <p className="text-gray-800 bg-gray-50 p-2 border rounded text-sm italic">
                              "{det.reason}"
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">
                              Bukti Foto Cacat/Kekurangan:
                            </label>
                            {evidences.length > 0 ? (
                              <div className="flex gap-2">
                                {evidences.map((ev: any, eIdx: number) => (
                                  <button
                                    key={ev.id}
                                    onClick={() => previewEvidence(ev.id)}
                                    className="flex items-center gap-1 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded font-semibold text-xs transition"
                                  >
                                    Lihat Foto #{eIdx + 1}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 p-2">
                                Tak ada foto yang dilampirkan.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              {/* Right: Preview Panel & Decisions Panel */}
              <div className="w-[400px] flex flex-col gap-4">
                {/* Photo Preview Panel */}
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col h-64 sticky top-0">
                  <div className="bg-gray-100 border-b px-4 py-2 text-xs font-bold text-gray-600">
                    Pratinjau Bukti
                  </div>
                  <div className="flex-1 bg-gray-50 flex items-center justify-center p-2 relative">
                    {isPreviewLoading ? (
                      <span className="text-gray-400 font-medium animate-pulse text-sm">
                        Memuat Gambar S3...
                      </span>
                    ) : previewEvidenceUrl ? (
                      <img
                        src={previewEvidenceUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs italic text-center px-4">
                        Pilih tombol 'Lihat Foto' di daftar retur.
                      </span>
                    )}
                  </div>
                </div>

                {/* Decision Form Container */}
                {selectedTicket.status === "menunggu_pengiriman_ulang" ? (
                  <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">
                      Aksi Penggantian (RPL)
                    </h3>

                    {!showRplForm && !showRejectForm ? (
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => setShowRplForm(true)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded shadow transition flex items-center justify-center gap-2"
                        >
                          <Check className="w-5 h-5" /> [ ✅ Setujui & Kirim RPL
                          ]
                        </button>
                        <button
                          onClick={() => setShowRejectForm(true)}
                          className="w-full bg-gray-100 hover:bg-red-100 hover:text-red-700 text-gray-600 font-bold py-3 rounded transition flex items-center justify-center gap-2"
                        >
                          <X className="w-5 h-5" /> Tolak & Batalkan Tiket
                        </button>
                      </div>
                    ) : showRplForm ? (
                      <div className="animate-fadeIn">
                        <p className="text-sm text-gray-600 mb-4 bg-yellow-50 p-3 rounded border border-yellow-200">
                          Sistem akan secara kolektif membangkitkan data Surat
                          Jalan pengganti baru berelasi ke pesanan ini. Harap
                          lampirkan Foto DO pengganti.
                        </p>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Upload Bukti Fisik DO Pengganti *
                        </label>
                        <label className="relative overflow-hidden flex flex-col items-center justify-center w-full h-32 border-2 border-indigo-200 border-dashed rounded-md cursor-pointer hover:bg-indigo-50 transition bg-gray-50 mb-4">
                          <div className="flex flex-col items-center justify-center pt-2 pb-2">
                            <Camera className="w-6 h-6 text-indigo-400 mb-2" />
                            <p className="text-sm text-gray-600 font-medium">
                              Unggah Faktur Baru
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              .JPG / .PNG / .PDF (Max 5MB)
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0])
                                setRplInvoiceFile(e.target.files[0]);
                            }}
                          />
                          {rplInvoiceFile && (
                            <div className="absolute inset-0 bg-indigo-100/90 rounded flex items-center justify-center font-bold text-indigo-800 text-sm">
                              {rplInvoiceFile.name} (Siap Diunggah)
                            </div>
                          )}
                        </label>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShowRplForm(false);
                              setRplInvoiceFile(null);
                            }}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded transition"
                          >
                            Kembali
                          </button>
                          <button
                            onClick={handleApproveAndSendRPL}
                            disabled={isSubmitting || !rplInvoiceFile}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded shadow transition"
                          >
                            {isSubmitting ? "Memproses..." : "Submit RPL Baru"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="animate-fadeIn">
                        <p className="text-sm text-gray-600 mb-4 bg-red-50 p-3 rounded border border-red-200">
                          Operasi ini akan membatalkan tiket retur secara
                          permanen. Mohon berikan alasan penolakan.
                        </p>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Catatan Penolakan (Koperasi) *
                        </label>
                        <textarea
                          className="w-full bg-gray-50 border rounded-md px-3 py-2 text-sm text-gray-600 mb-4 focus:ring-2 focus:ring-red-200 focus:border-red-400"
                          rows={3}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Mengapa retur ini tidak valid?"
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShowRejectForm(false);
                              setRejectReason("");
                            }}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded transition"
                          >
                            Kembali
                          </button>
                          <button
                            onClick={handleRejectTicket}
                            disabled={isSubmitting || !rejectReason.trim()}
                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded shadow transition"
                          >
                            {isSubmitting ? "Memproses..." : "Konfirmasi Tolak"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-green-800 mb-1">
                      Tiket Terselesaikan
                    </h3>
                    <p className="text-sm text-green-700">
                      Barang ganti rugi (RPL) untuk tiket ini telah dikirim
                      Koperasi.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
