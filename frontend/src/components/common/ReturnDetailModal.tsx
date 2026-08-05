import { useState, useEffect } from "react";
import { FileText, Clock, Image as ImageIcon, Calendar } from "lucide-react";
import { apiClient } from "../../lib/api";

interface ReturnDetailModalProps {
  group: any; // Using the complex structure of viewDetailReturn (grp.header, grp.items)
  onClose: () => void;
}

export default function ReturnDetailModal({
  group,
  onClose,
}: ReturnDetailModalProps) {
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    const fetchEvidence = async () => {
      // Find the first evidence in the return items that is damage_or_defect
      let targetEv: any = null;
      for (const item of group.items) {
        if (item.sparePartShipment?.evidences?.length > 0) {
          const ev = item.sparePartShipment.evidences.find(
            (e: any) => e.evidence_type === "damage_or_defect",
          );
          if (ev) {
            targetEv = ev;
            break;
          }
        }
      }

      if (targetEv) {
        setIsLoadingImage(true);
        try {
          const response = await apiClient.get(
            `/shipment-evidences/${targetEv.id}/download`,
            {
              responseType: "blob",
            },
          );
          objectUrl = URL.createObjectURL(response.data);
          setEvidenceUrl(objectUrl);
        } catch (error) {
          console.error("Gagal memuat gambar dari S3 (404):", error);
          setEvidenceUrl(null);
        } finally {
          setIsLoadingImage(false);
        }
      } else {
        setEvidenceUrl(null);
      }
    };

    fetchEvidence();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [group]);

  const totalItemDiretur = group.items.reduce(
    (acc: number, it: any) => acc + it.quantity,
    0,
  );

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60] p-4 sm:p-6 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 w-full max-w-4xl max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/80">
          <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Detail Tiket Retur / Pengganti - {group.header.nomor_tiket_retur}
          </h2>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[400px]">
            {/* Left Column: Image Viewer prominent display */}
            <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex flex-col relative group min-h-[300px]">
              <div className="bg-gray-100 border-b px-4 py-2 text-xs font-bold text-gray-600">
                Pratinjau Bukti / Kerusakan
              </div>
              <div className="flex-1 flex items-center justify-center relative bg-white">
                {isLoadingImage ? (
                  <div className="flex flex-col items-center justify-center text-gray-400 p-8 text-center animate-pulse">
                    <Clock className="w-10 h-10 mb-3 text-red-300 animate-spin" />
                    <p className="font-medium text-gray-500">
                      Memuat Foto Bukti...
                    </p>
                    <p className="text-xs mt-1 text-gray-400">
                      Mengambil data secara aman dari cloud
                    </p>
                  </div>
                ) : evidenceUrl ? (
                  <img
                    src={evidenceUrl}
                    alt="Bukti Retur"
                    className="w-full h-full object-contain absolute inset-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                    <ImageIcon className="w-12 h-12 mb-3 text-gray-300" />
                    <p className="font-medium text-gray-500">
                      Tidak Ada Foto Lampiran
                    </p>
                    <p className="text-xs mt-1">
                      Sistem tidak mendeteksi adanya bukti foto untuk retur ini.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Info & Action */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-extrabold text-gray-800 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
                Ringkasan Tiket Retur
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-yellow-50 text-yellow-600">
                      <Clock className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      Status Retur
                    </p>
                  </div>
                  <span
                    className={`font-bold text-sm ${
                      group.header.status === "selesai"
                        ? "text-green-700"
                        : group.header.status === "dikirim_ulang"
                          ? "text-blue-700"
                          : "text-yellow-700"
                    }`}
                  >
                    {group.header.status === "selesai"
                      ? "Selesai (Ditangani)"
                      : group.header.status === "dikirim_ulang"
                        ? "RPL Dikirim"
                        : "Proses Koperasi"}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-orange-50 text-orange-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      Tgl Pengajuan
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {new Date(group.header.created_at).toLocaleDateString(
                      "id-ID",
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm flex-1 mt-2 overflow-hidden flex flex-col">
                <h4 className="text-sm font-bold text-red-800 mb-3 flex justify-between">
                  <span>Rincian Barang Diretur</span>
                  <span className="text-gray-500 font-medium">
                    Total: {totalItemDiretur} item
                  </span>
                </h4>
                <div className="overflow-y-auto flex-1">
                  <div className="space-y-3">
                    {group.items.map((it: any) => (
                      <div
                        key={it.id}
                        className="border border-gray-100 rounded p-2 bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-gray-700 text-sm">
                            {it.sparePartOrderDetail?.sparePart
                              ?.nama_suku_cadang || "Suku Cadang"}
                          </span>
                          <span className="text-sm font-bold text-red-600 px-2 py-0.5 bg-red-100 rounded">
                            {it.quantity} Pcs
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {it.sparePartOrderDetail?.sparePart?.kode_suku_cadang}
                        </p>
                        <p className="text-xs mt-2 italic text-gray-600 border-t pt-1">
                          Kendala: "{it.reason}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-white flex items-center rounded-b-xl">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold transition-colors shadow-sm ml-auto text-sm"
          >
            Tutup Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
