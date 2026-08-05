import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { apiClient } from "../../lib/api";
import PrintHeader from "./PrintHeader";

type ViewStep = "card" | "a4";

interface DeliveryNoteModalProps {
  group: any;
  onClose: () => void;
}

export default function DeliveryNoteModal({
  group,
  onClose,
}: DeliveryNoteModalProps) {
  const [step, setStep] = useState<ViewStep>("card");
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;

    const loadEvidence = async () => {
      // If there's an evidence file attached to the first shipment
      if (
        group?.shipments?.length > 0 &&
        group.shipments[0].evidences?.length > 0
      ) {
        setIsLoadingImage(true);
        try {
          const ev = group.shipments[0].evidences[0];
          const response = await apiClient.get(
            `/shipment-evidences/${ev.id}/download`,
            {
              responseType: "blob",
            },
          );
          objectUrl = URL.createObjectURL(response.data);
          setEvidenceUrl(objectUrl);
        } catch (error) {
          console.error("Gagal memuat gambar (File hilang / S3 404):", error);
          setEvidenceUrl(null);
        } finally {
          setIsLoadingImage(false);
        }
      } else {
        setEvidenceUrl(null);
      }
    };

    loadEvidence();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [group]);

  const handlePrint = () => {
    setTimeout(() => window.print(), 300);
  };

  const calculateTotalSales = () => {
    return uniqueShipments.reduce(
      (acc: number, s: any) =>
        acc + s.quantity * parseFloat(s.harga_jual || "0"),
      0,
    );
  };

  const statusFisik =
    group.statusFisik ||
    (group.status === "disetujui" ? "Berhasil" : "Menunggu FO");

  // Dedup shipments so replacement batches don't artificially duplicate items/prices.
  // Group by spare_part_order_detail_id, the latter item (replacement) overwrites the original,
  // keeping the quantity exactly proportional to the original purchase order amount.
  const uniqueShipments = Array.from(
    new Map(
      group.shipments.map((s: any) => [
        s.spare_part_order_detail?.id || s.id,
        s,
      ]),
    ).values(),
  );

  const realTotalQty = uniqueShipments.reduce(
    (acc: number, s: any) => acc + (s.quantity || 0),
    0,
  );

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60] p-4 sm:p-6 backdrop-blur-sm">
      <div
        className={`bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 w-full ${
          step === "card" ? "max-w-3xl max-h-[85vh]" : "max-w-4xl max-h-[90vh]"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/80 print:hidden">
          <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Detail Surat Jalan -{" "}
            {group.orderInfo?.nomor_surat_order ||
              group.order?.nomor_surat_order}
          </h2>
          {step === "a4" && (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 text-sm print:hidden"
              >
                <Download className="w-4 h-4" /> Cetak / PDF
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6">
          {step === "card" ? (
            // ============================
            // STEP 1: QUICK VIEW CARD
            // ============================
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[400px]">
              {/* Left Column: Image Viewer prominent display */}
              <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center relative group min-h-[300px]">
                {isLoadingImage ? (
                  <div className="flex flex-col items-center justify-center text-gray-400 p-8 text-center animate-pulse">
                    <Clock className="w-10 h-10 mb-3 text-indigo-300 animate-spin-slow" />
                    <p className="font-medium text-gray-500">
                      Memuat Foto Bukti secara aman...
                    </p>
                  </div>
                ) : evidenceUrl ? (
                  <img
                    src={evidenceUrl}
                    alt="Bukti Pengiriman"
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
                      Sistem tidak mendeteksi adanya bukti foto pada catatan
                      ini.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Info & Action */}
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                    Ringkasan Pengiriman
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">
                          Referensi Order
                        </p>
                        <p className="font-bold text-gray-800">
                          {group.orderInfo?.nomor_surat_order ||
                            group.order?.nomor_surat_order}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Status */}
                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-md ${statusFisik === "Berhasil" || statusFisik === "Selesai" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}
                          >
                            {statusFisik === "Berhasil" ||
                            statusFisik === "Selesai" ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                            Status
                          </p>
                        </div>
                        <p
                          className={`font-bold text-sm ${statusFisik === "Berhasil" || statusFisik === "Selesai" ? "text-green-700" : "text-blue-700"}`}
                        >
                          {statusFisik}
                        </p>
                      </div>

                      {/* Pengaju */}
                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-purple-50 text-purple-600">
                            <User className="w-4 h-4" />
                          </div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                            Pengaju
                          </p>
                        </div>
                        <p
                          className="font-bold text-gray-800 text-sm truncate"
                          title={
                            group.orderInfo?.user?.name ||
                            group.order?.user?.name ||
                            "Koperasi"
                          }
                        >
                          {group.orderInfo?.user?.name ||
                            group.order?.user?.name ||
                            "Koperasi"}
                        </p>
                      </div>

                      {/* Tanggal */}
                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-orange-50 text-orange-600">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                            Tanggal
                          </p>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {new Date(
                            group.created_at || group.shipments[0]?.created_at,
                          ).toLocaleDateString("id-ID")}
                        </p>
                      </div>

                      {/* Total Item */}
                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-teal-50 text-teal-600">
                            <FileText className="w-4 h-4" />
                          </div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                            Total Item
                          </p>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {realTotalQty} Units
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => setStep("a4")}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-md shadow-indigo-200 transition-all active:scale-[0.98] border border-indigo-700 flex justify-center items-center gap-2"
                  >
                    Buka Surat Jalan (Rincian Item)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // ============================
            // STEP 2: FORMAL A4 LAYOUT
            // ============================
            <div className="flex-1 overflow-y-auto p-12 bg-white print:p-0 print:overflow-visible">
              <PrintHeader
                title="Laporan Penerimaan Suku Cadang"
                subtitle="Surat Jalan DO Berbasis Referensi Order"
                periodLabel=""
              />

              <div className="flex justify-between items-start mb-8 text-sm">
                <div>
                  <p>
                    <span className="font-semibold inline-block w-32">
                      No Referensi:
                    </span>{" "}
                    {group.orderInfo?.nomor_surat_order ||
                      group.order?.nomor_surat_order}
                  </p>
                  <p>
                    <span className="font-semibold inline-block w-32">
                      Status Verifikasi:
                    </span>{" "}
                    {statusFisik}
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    <span className="font-semibold inline-block w-32">
                      Tgl Dibuat:
                    </span>{" "}
                    {new Date(
                      group.created_at || group.shipments[0]?.created_at,
                    ).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              <table className="w-full text-sm border-collapse mb-8">
                <thead>
                  <tr className="border-b-2 border-black bg-gray-50">
                    <th className="py-2 px-3 text-left w-10">No</th>
                    <th className="py-2 px-3 text-left">
                      Kode & Nama Suku Cadang
                    </th>
                    <th className="py-2 px-3 text-center w-24">Qty</th>
                    <th className="py-2 px-3 text-right w-32">
                      Harga (Satuan)
                    </th>
                    <th className="py-2 px-3 text-right w-32">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueShipments.map((s: any, idx: number) => {
                    const harga = parseFloat(s.harga_jual || "0");
                    const total = harga * s.quantity;
                    return (
                      <tr key={s.id} className="border-b border-gray-200">
                        <td className="py-2 px-3">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <div className="font-semibold">
                            {
                              s.spare_part_order_detail?.spare_part
                                ?.nama_suku_cadang
                            }
                          </div>
                          <div className="text-xs text-gray-500">
                            {
                              s.spare_part_order_detail?.spare_part
                                ?.kode_suku_cadang
                            }
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {s.quantity}{" "}
                          {s.spare_part_order_detail?.spare_part?.satuan ||
                            "Pcs"}
                        </td>
                        <td className="py-2 px-3 text-right">
                          Rp {harga.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          Rp {total.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-black bg-gray-50 font-bold">
                    <td colSpan={2} className="py-2 px-3 text-right">
                      TOTAL
                    </td>
                    <td className="py-2 px-3 text-center">{realTotalQty}</td>
                    <td colSpan={2} className="py-2 px-3 text-right">
                      Rp {calculateTotalSales().toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-white flex justify-between items-center rounded-b-xl print:hidden">
          {step === "a4" ? (
            <button
              onClick={() => setStep("card")}
              className="text-gray-600 hover:text-indigo-600 font-semibold px-4 py-2 transition-colors border border-transparent hover:border-indigo-100 rounded-lg text-sm"
            >
              ← Kembali ke Ringkasan
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold transition-colors shadow-sm ml-auto text-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
