import React, { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import { useAuth } from "../../app/AuthContext";
import Swal from "sweetalert2";
import { Search, Download, AlertTriangle } from "lucide-react";
import styles from "../orders/ShipmentList.module.css";

interface ReturnEvidences {
  id: number;
  evidence_type: string;
  original_filename: string;
}

interface ReturnDetail {
  id: number;
  quantity: number;
  reason: string;
  spare_part_order_detail: {
    id: number;
    spare_part: {
      kode_suku_cadang: string;
      nama_suku_cadang: string;
    };
  };
  spare_part_shipment: {
    id: number;
    evidences: ReturnEvidences[];
  };
}

interface ReturnHeader {
  id: number;
  nomor_tiket_retur: string;
  status:
    | "menunggu_pengiriman_ulang"
    | "dikirim_ulang"
    | "selesai"
    | "dibatalkan";
  created_at: string;
  resolved_at: string | null;
  spare_part_order: {
    id: number;
    nomor_surat_order: string;
  };
  spare_part_returns: ReturnDetail[];
}

interface KoperasiReturnsProps {
  isEmbedded?: boolean;
}

const KoperasiReturns: React.FC<KoperasiReturnsProps> = ({ isEmbedded }) => {
  const { user } = useAuth();
  const [returns, setReturns] = useState<ReturnHeader[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State for Image/PDF Preview & Detail
  const [selectedReturnDetail, setSelectedReturnDetail] =
    useState<ReturnHeader | null>(null);
  const [previewEvidenceUrl, setPreviewEvidenceUrl] = useState<string | null>(
    null,
  );
  const [previewEvidenceName, setPreviewEvidenceName] = useState<string | null>(
    null,
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const fetchReturns = async () => {
    try {
      const res = await apiClient.get("/spare-part-returns");
      setReturns(res.data.data);
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: "error", text: "Gagal memuat daftar Retur Logistik" });
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

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
      Swal.fire({ icon: "error", text: "Terjadi kesalahan unduh bukti retur" });
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

  const openDetailModal = (ret: any) => {
    setSelectedReturnDetail(ret);
    setPreviewEvidenceUrl(null);
    setPreviewEvidenceName(null);
  };

  const handleCreateReplacement = async (returnId: number) => {
    const { value: file } = await Swal.fire({
      title: "Kirim Ganti Rugi",
      html: `
        <p style="font-size: 14px; color: #475569; margin-bottom: 20px;">
          Langkah ini akan menerbitkan <strong>Replacement Shipment</strong> baru untuk FO verifikasi ulang.<br/>
          Anda diwajibkan melampirkan foto logistik ganti ruginya sebelum dikirim.
        </p>
        <input type="file" id="swal-file3" class="swal2-file" accept="image/*,application/pdf">
      `,
      preConfirm: () => {
        const fileInput = document.getElementById(
          "swal-file3",
        ) as HTMLInputElement;
        const uploadFile = fileInput.files ? fileInput.files[0] : null;
        if (!uploadFile) {
          Swal.showValidationMessage(
            "Bukti foto kotak/logistik ganti rugi wajb diunggah",
          );
          return false;
        }
        return uploadFile;
      },
      showCancelButton: true,
      confirmButtonText: "Terbitkan Replacement DO",
    });

    if (file) {
      Swal.fire({
        title: "Mentransmisikan Barang Baru...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        // 1. Trigger Replacement Endpoints
        const resp = await apiClient.post(
          `/spare-part-returns/${returnId}/replacement-shipment`,
        );
        const newShipments = resp.data.data;

        // 2. Upload Evidence Replacement and Submit
        await Promise.all(
          newShipments.map(async (shipment: any) => {
            const formDataObj = new FormData();
            formDataObj.append("evidence_type", "shipment_replacement");
            formDataObj.append("file", file);

            await apiClient.post(
              `/spare-part-shipments/${shipment.id}/evidences`,
              formDataObj,
              { headers: { "Content-Type": "multipart/form-data" } },
            );

            return apiClient.post(
              `/spare-part-shipments/${shipment.id}/submit`,
            );
          }),
        );

        fetchReturns();
        Swal.fire({
          icon: "success",
          title: "Berhasil Memberi Ganti Rugi",
          text: "Logistik pengganti (Replacement DO) telah diterbangkan. Silakan melacak pada tabel Shipment.",
        });
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          text:
            err.response?.data?.message ||
            "Terdapat bentrokan saat mengirim pengganti",
        });
      }
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "menunggu_pengiriman_ulang":
        return (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
            Butuh Ganti Rugi
          </span>
        );
      case "dikirim_ulang":
        return (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
            Sedang Terkirim Ulang
          </span>
        );
      case "selesai":
        return (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
            Retur Rampung
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">
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

  const displayed = returns.filter((r) => {
    const s = searchTerm.toLowerCase();
    if (!searchTerm) return true;

    return r.spare_part_returns.some((detail) =>
      (detail.spare_part_order_detail?.spare_part?.nama_suku_cadang || "")
        .toLowerCase()
        .includes(s),
    );
  });

  return (
    <div className={isEmbedded ? "" : styles.container}>
      {!isEmbedded && (
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Penanganan Retur & Komplain</h1>
            <p className={styles.pageSubtitle}>
              Tindak lanjut laporan logistik yang ditolak lapangan
              (Pecah/Rusak/Cacat)
            </p>
          </div>
        </div>
      )}

      <div className={styles.tableCard}>
        <div className="p-4 flex flex-wrap gap-4 items-center border-b border-gray-200">
          <div className={styles.searchGroup}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Cari suku cadang keluhan..."
              className={styles.toolbarInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableCell}>No. Tiket</th>
                <th className={styles.tableCell}>Order Reference</th>
                <th className={styles.tableCell}>
                  Alasan Ditolak / Dikeluhkan
                </th>
                <th className={styles.tableCell}>Status Retur</th>
                <th className={styles.tableCell}>Lampiran (Detail)</th>
                <th className={styles.tableCell}>Aksi Koperasi</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {displayed.map((ret) => {
                const totalItems = ret.spare_part_returns.length;
                const aggregatedQuantity = ret.spare_part_returns.reduce(
                  (acc, curr) => acc + curr.quantity,
                  0,
                );

                return (
                  <tr key={ret.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <span className="font-semibold text-gray-700 flex items-center gap-1">
                        <AlertTriangle size={16} className="text-red-500" />
                        {ret.nomor_tiket_retur}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(ret.created_at)}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <span className="font-medium text-gray-800">
                        ORD-
                        {ret.spare_part_order?.id?.toString().padStart(4, "0")}
                      </span>
                      <br />
                      <span className="text-sm text-gray-600">
                        [{ret.spare_part_order?.nomor_surat_order}]
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <p className="text-sm font-semibold text-red-600">
                        {totalItems} Item Bermasalah
                      </p>
                      <span className="text-xs text-gray-500">
                        Total ganti rugi: {aggregatedQuantity} Pcs
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      {statusBadge(ret.status)}
                    </td>
                    <td className={styles.tableCell}>
                      <button
                        onClick={() => openDetailModal(ret)}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded text-xs font-semibold border border-blue-200 transition-colors inline-block text-center whitespace-nowrap shadow-sm"
                      >
                        Buka Rincian ({totalItems} Laporan)
                      </button>
                    </td>
                    <td className={styles.tableCell}>
                      {user?.role === "koperasi" &&
                        ret.status === "menunggu_pengiriman_ulang" && (
                          <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded shadow-sm text-sm"
                            title="Kirim ulang unit pengganti secara operasional"
                            onClick={() => handleCreateReplacement(ret.id)}
                          >
                            Kirim Ganti Rugi
                          </button>
                        )}
                      {ret.status !== "menunggu_pengiriman_ulang" && (
                        <span className="text-sm text-gray-400 cursor-not-allowed">
                          Dalam Proses / Selesai
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {displayed.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500 bg-gray-50"
                  >
                    Tidak ada tiket retur barang bermasalah di logistik. Aman
                    terkendali!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL RETUR & GAMBAR BUKTI */}
      {selectedReturnDetail && (
        <div
          className="fixed inset-0 bg-[#0f2c4a]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => {
            setSelectedReturnDetail(null);
            setPreviewEvidenceUrl(null);
            setPreviewEvidenceName(null);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Detail Retur Logistik (Bukt Penolakan FO)
                </h2>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <span>
                    Tiket: RET-
                    {selectedReturnDetail.id.toString().padStart(4, "0")}
                  </span>
                  <span>|</span>
                  <span>
                    Log: {formatDate(selectedReturnDetail.created_at)}
                  </span>
                </div>
              </div>
              <div>{statusBadge(selectedReturnDetail.status)}</div>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
              <div className="mb-6 flex justify-between items-center bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                    Nomor Order Reference Induk
                  </label>
                  <div className="text-sm font-bold text-blue-700">
                    ORD-
                    {selectedReturnDetail.spare_part_order?.id
                      ?.toString()
                      .padStart(4, "0")}
                    <span className="ml-2 text-gray-500 font-normal">
                      [
                      {selectedReturnDetail.spare_part_order?.nomor_surat_order}
                      ]
                    </span>
                  </div>
                </div>
              </div>

              {selectedReturnDetail.spare_part_returns?.map(
                (detail: any, index: number) => (
                  <div
                    key={detail.id}
                    className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm"
                  >
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                      Item #{index + 1}:{" "}
                      {
                        detail.spare_part_order_detail?.spare_part
                          ?.nama_suku_cadang
                      }
                    </h3>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                          Kode Suku Cadang
                        </label>
                        <div className="text-sm font-semibold text-gray-800">
                          {
                            detail.spare_part_order_detail?.spare_part
                              ?.kode_suku_cadang
                          }
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                          Kuantitas Unit Diminta Ganti
                        </label>
                        <div className="text-sm font-bold text-red-600">
                          {detail.quantity} Unit
                        </div>
                      </div>

                      <div className="col-span-2 bg-red-50 border border-red-100 rounded p-3">
                        <label className="block text-[11px] font-semibold text-red-600 mb-1">
                          Catatan Keluhan Penolakan (FO)
                        </label>
                        <div className="text-sm text-red-700 italic">
                          " {detail.reason} "
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                        Foto Bukti Cacat/Rusak
                      </label>
                      {detail.spare_part_shipment?.evidences?.filter(
                        (e: any) => e.evidence_type === "damage_or_defect",
                      ).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {detail.spare_part_shipment.evidences
                            .filter(
                              (e: any) =>
                                e.evidence_type === "damage_or_defect",
                            )
                            .map((ev: any, idx: number) => (
                              <div
                                key={ev.id}
                                className="flex items-center gap-0 border border-gray-200 rounded overflow-hidden shadow-sm hover:shadow-md bg-white transition-all group"
                              >
                                <button
                                  onClick={() =>
                                    previewEvidence(ev.id, ev.original_filename)
                                  }
                                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 font-semibold"
                                >
                                  Bukti #{idx + 1}
                                </button>
                                <button
                                  title="Download Berkas"
                                  onClick={() =>
                                    downloadEvidence(
                                      ev.id,
                                      ev.original_filename,
                                    )
                                  }
                                  className="px-2 py-1.5 text-gray-400 border-l border-gray-200 hover:text-blue-600 hover:bg-blue-50"
                                >
                                  <Download size={14} />
                                </button>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Tidak ada foto bukti lampiran.
                        </span>
                      )}
                    </div>
                  </div>
                ),
              )}

              {isPreviewLoading ? (
                <div className="h-64 flex flex-col items-center justify-center bg-gray-100 animate-pulse rounded-lg border border-gray-200">
                  <p className="text-gray-500 font-medium">
                    Memuat Foto Bukti S3...
                  </p>
                </div>
              ) : previewEvidenceUrl ? (
                <div className="bg-gray-100 rounded-lg p-2 border border-gray-200 shadow-inner flex flex-col">
                  <div className="text-xs text-gray-500 mb-2 px-2 py-1 font-mono">
                    Pratinjau: {previewEvidenceName}
                  </div>
                  {previewEvidenceName?.toLowerCase().endsWith(".pdf") ? (
                    <iframe
                      src={previewEvidenceUrl}
                      className="w-full h-96 rounded border border-gray-300"
                      title="PDF Preview"
                    />
                  ) : (
                    <img
                      src={previewEvidenceUrl}
                      alt="Bukti Preview"
                      className="w-full h-auto max-h-[500px] object-contain rounded border border-gray-300 bg-white"
                    />
                  )}
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p className="text-xs text-gray-400">
                    Klik salah satu tombol lampiran di atas untuk pratinjau
                    bukti penolakan Koperasi.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end sticky bottom-0">
              <button
                className="px-6 py-2.5 text-sm font-bold text-white bg-gray-800 rounded-md shadow hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setSelectedReturnDetail(null);
                  setPreviewEvidenceUrl(null);
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KoperasiReturns;
