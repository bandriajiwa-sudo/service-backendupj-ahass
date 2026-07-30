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

interface ReturnTicket {
  id: number;
  quantity: number;
  reason: string;
  status:
    | "menunggu_pengiriman_ulang"
    | "dikirim_ulang"
    | "selesai"
    | "dibatalkan";
  created_at: string;
  resolved_at: string | null;
  spare_part_order: {
    id: number;
    spare_part: {
      nama_suku_cadang: string;
    };
  };
  spare_part_shipment: {
    id: number;
    evidences: ReturnEvidences[];
  };
}

const KoperasiReturns: React.FC = () => {
  const { user } = useAuth();
  const [returns, setReturns] = useState<ReturnTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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
        const newShipmentId = resp.data.data.id;

        // 2. Upload Evidence Replacement
        const formDataObj = new FormData();
        formDataObj.append("evidence_type", "shipment_replacement");
        formDataObj.append("file", file);

        await apiClient.post(
          `/spare-part-shipments/${newShipmentId}/evidences`,
          formDataObj,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        // 3. Submit
        await apiClient.post(`/spare-part-shipments/${newShipmentId}/submit`);

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
    const suku = (
      r.spare_part_order?.spare_part?.nama_suku_cadang || ""
    ).toLowerCase();
    const s = searchTerm.toLowerCase();
    if (searchTerm && !suku.includes(s)) return false;
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Penanganan Retur & Komplain</h1>
          <p className={styles.pageSubtitle}>
            Tindak lanjut laporan logistik yang ditolak lapangan
            (Pecah/Rusak/Cacat)
          </p>
        </div>
      </div>

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
                <th className={styles.tableCell}>Lampiran (Bukti FO)</th>
                <th className={styles.tableCell}>Status Retur</th>
                <th className={styles.tableCell}>Aksi Koperasi</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {displayed.map((ret) => (
                <tr key={ret.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <span className="font-semibold text-gray-700 flex items-center gap-1">
                      <AlertTriangle size={16} className="text-red-500" />
                      RET-{ret.id.toString().padStart(4, "0")}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(ret.created_at)}
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className="font-medium text-gray-800">
                      ORD-{ret.spare_part_order.id.toString().padStart(4, "0")}
                    </span>
                    <br />
                    <span className="text-sm text-gray-600">
                      {ret.spare_part_order.spare_part.nama_suku_cadang}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <p className="text-sm font-semibold text-red-600">
                      "{ret.reason}"
                    </p>
                    <span className="text-xs text-gray-500">
                      Minta ganti: {ret.quantity} Pcs
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    {ret.spare_part_shipment.evidences &&
                    ret.spare_part_shipment.evidences.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {ret.spare_part_shipment.evidences
                          .filter(
                            (ev) => ev.evidence_type === "damage_or_defect",
                          )
                          .map((ev) => (
                            <button
                              key={ev.id}
                              onClick={() =>
                                downloadEvidence(ev.id, ev.original_filename)
                              }
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                            >
                              <Download size={14} /> Bukti Cacat FO
                            </button>
                          ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Tidak ada bukti
                      </span>
                    )}
                  </td>
                  <td className={styles.tableCell}>
                    {statusBadge(ret.status)}
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
              ))}
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
    </div>
  );
};

export default KoperasiReturns;
