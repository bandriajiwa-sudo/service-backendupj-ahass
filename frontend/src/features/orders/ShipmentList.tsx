import { useState, useEffect, useMemo } from "react";
import { apiClient } from "../../lib/api";
import Swal from "sweetalert2";
import { Search, Camera, Check, X, XCircle } from "lucide-react";
import styles from "./ShipmentList.module.css";
import DeliveryNoteModal from "../../components/common/DeliveryNoteModal";
import ReturnDetailModal from "../../components/common/ReturnDetailModal";
import { FileText } from "lucide-react";

interface OrderDetail {
  id: number;
  jumlah_qty: number;
  spare_part: {
    kode_suku_cadang: string;
    nama_suku_cadang: string;
    satuan?: string;
  };
}
interface Order {
  id: number;
  nomor_surat_order: string;
  status: string;
  created_at: string;
  spare_part_order_details: OrderDetail[];
}
interface ShipmentEvidence {
  id: number;
  evidence_type: string;
  original_filename: string;
}
interface Shipment {
  id: number;
  quantity: number;
  status: string;
  rejection_note: string | null;
  created_at: string;
  shipment_type: string;
  spare_part_order_detail: {
    id: number;
    jumlah_qty: number;
    spare_part: {
      kode_suku_cadang: string;
      nama_suku_cadang: string;
      satuan?: string;
    };
    spare_part_order: Order;
  };
  evidences?: ShipmentEvidence[];
}

export default function ShipmentList() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [returnHeaders, setReturnHeaders] = useState<any[]>([]);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFOTab, setActiveFOTab] = useState<"initial" | "returns">(
    "initial",
  );

  // Modal FO: Partial Return Verification
  const [verifyBatchOrder, setVerifyBatchOrder] = useState<any | null>(null);
  const [batchDecisions, setBatchDecisions] = useState<
    Record<
      number,
      { status: "disetujui" | "ditolak"; alasan?: string; foto?: File | null }
    >
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal FO: Return Detail
  const [viewDetailReturn, setViewDetailReturn] = useState<any | null>(null);
  const [viewDetailOrder, setViewDetailOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchShipments();
    if (activeFOTab === "returns") {
      fetchReturnHeaders();
    }
  }, [activeFOTab]);

  const fetchShipments = async () => {
    try {
      const res = await apiClient.get("/spare-part-shipments");
      setShipments(res.data.data);
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: "error", text: "Gagal memuat data pengiriman" });
    }
  };

  const fetchReturnHeaders = async () => {
    try {
      const res = await apiClient.get("/spare-part-returns");
      const headers = res.data.data;

      const formatted = headers.map((header: any) => ({
        header: header,
        items: header.spare_part_returns || [],
      }));
      setReturnHeaders(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  // Derived: Group FO Shipments (Tab 1)
  const groupedOrders = useMemo(() => {
    const list = shipments;
    const groups: Record<string, any> = {};

    list.forEach((s: any) => {
      const order = s.spare_part_order_detail?.spare_part_order;
      if (!order) return;
      const orderNo = order.nomor_surat_order;
      if (!groups[orderNo]) {
        groups[orderNo] = {
          order: order,
          shipments: [],
          totalQty: 0,
          types: new Set(),
          statusFisik: "Disetujui",
        };
      }
      groups[orderNo].shipments.push(s);
      groups[orderNo].types.add(
        s.spare_part_order_detail.spare_part.kode_suku_cadang,
      );

      // Determine overall group status
      if (s.status === "menunggu_verifikasi") {
        groups[orderNo].statusFisik = "Tahap Verifikasi";
      } else if (
        groups[orderNo].statusFisik !== "Tahap Verifikasi" &&
        s.status === "ditolak"
      ) {
        groups[orderNo].statusFisik = "Ada Retur";
      }
    });

    return Object.values(groups)
      .map((g: any) => {
        // Deduplicate shipments by detail ID so replacement overlaps do not double the totalQty metric.
        const unique = Array.from(
          new Map(
            g.shipments.map((s: any) => [
              s.spare_part_order_detail?.id || s.id,
              s,
            ]),
          ).values(),
        );
        g.totalQty = unique.reduce(
          (acc: number, s: any) => acc + (s.quantity || 0),
          0,
        );
        return g;
      })
      .filter((g: any) => {
        if (!searchTerm) return true;
        return g.order.nomor_surat_order
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.order.created_at).getTime() -
          new Date(a.order.created_at).getTime(),
      );
  }, [shipments, searchTerm]);

  const handleOpenVerifyBatch = (group: any) => {
    const initDecisions: any = {};
    group.shipments.forEach((s: any) => {
      if (s.status === "menunggu_verifikasi") {
        // Default select "disetujui" to save FO time
        initDecisions[s.id] = { status: "disetujui", alasan: "", foto: null };
      }
    });
    setBatchDecisions(initDecisions);
    setVerifyBatchOrder(group);
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: If any "ditolak", it must have foto+alasan attached
    let invalid = false;
    const payloadItems: any[] = [];

    Object.entries(batchDecisions).forEach(([shipmentId, dec]) => {
      const decision = dec as {
        status: "disetujui" | "ditolak";
        alasan?: string;
        foto?: File | null;
      };
      if (decision.status === "ditolak") {
        if (!decision.alasan || !decision.foto) {
          invalid = true;
        }
        payloadItems.push({
          shipment_id: parseInt(shipmentId),
          status: "ditolak",
          alasan: decision.alasan,
        });
      } else {
        payloadItems.push({
          shipment_id: parseInt(shipmentId),
          status: "disetujui",
          alasan: null,
        });
      }
    });

    if (invalid) {
      Swal.fire({
        icon: "warning",
        text: "Semua item dengan status [RETUR] wajib melampirkan Alasan dan Foto Bukti",
      });
      return;
    }

    if (payloadItems.length === 0) return;

    setIsSubmitting(true);
    try {
      for (const [id, d] of Object.entries(batchDecisions)) {
        const dec = d as {
          status: "disetujui" | "ditolak";
          alasan?: string;
          foto?: File | null;
        };
        if (dec.status === "ditolak" && dec.foto) {
          const fd = new FormData();
          fd.append("evidence_type", "damage_or_defect");
          fd.append("file", dec.foto);
          await apiClient.post(`/spare-part-shipments/${id}/evidences`, fd, {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
          });
        }
      }

      // Then execute verification batch
      await apiClient.post("/spare-part-shipments/batch-verify", {
        items: payloadItems,
      });

      Swal.fire({
        icon: "success",
        text: "Konfirmasi Penerimaan selesai diproses!",
      });
      setVerifyBatchOrder(null);
      fetchShipments();
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        text: err.response?.data?.message || "Gagal menyimpan hasil verifikasi",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Logistik Pengiriman DO</h1>
        <p className={styles.pageSubtitle}>
          Catat kedatangan logistik gudang & lampirkan dokumen foto faktur
        </p>
      </div>

      {/* Beautiful Tab Switching Card */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-2 sm:w-max">
        <button
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex-1 sm:flex-none text-center ${
            activeFOTab === "initial"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => setActiveFOTab("initial")}
        >
          Penerimaan PO Baru
        </button>
        <button
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex-1 sm:flex-none text-center ${
            activeFOTab === "returns"
              ? "bg-red-500 text-white shadow-md shadow-red-200"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => setActiveFOTab("returns")}
        >
          Barang Retur (Tiket RPL)
        </button>
      </div>

      {/* Styled Search Card Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-gray-50"
            placeholder="Cari referensi order atau tiket retur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {activeFOTab === "initial" && (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Tanggal PO</th>
                  <th>Ringkasan Barang</th>
                  <th>Total Kirim</th>
                  <th>Status Fisik</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {groupedOrders.map((group: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="font-semibold text-gray-800">
                      {group.order.nomor_surat_order}
                    </td>
                    <td className="text-sm text-gray-600">
                      {new Date(
                        group.order.tanggal_pengajuan,
                      ).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="text-sm text-gray-600">
                      {group.types.size} Jenis Suku Cadang
                    </td>
                    <td className="font-medium text-gray-700">
                      {group.totalQty} Item
                    </td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          group.statusFisik === "Tahap Verifikasi"
                            ? "bg-yellow-100 text-yellow-700"
                            : group.statusFisik === "Ada Retur"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {group.statusFisik}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenVerifyBatch(group)}
                        disabled={group.statusFisik !== "Tahap Verifikasi"}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                          group.statusFisik === "Tahap Verifikasi"
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        {group.statusFisik === "Tahap Verifikasi"
                          ? "Proses Penerimaan"
                          : "Selesai"}
                      </button>
                      <button
                        onClick={() => setViewDetailOrder(group)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm font-semibold transition-colors bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 ml-2"
                      >
                        <FileText className="w-4 h-4" /> Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
                {groupedOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      Tidak ada pengiriman dalam proses verifikasi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TIKET RETUR TAB (FO) */}
      {activeFOTab === "returns" && (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No Tiket Retur</th>
                  <th>Referensi Order Awal</th>
                  <th>Jumlah Barang Retur</th>
                  <th>Status Respon Koperasi</th>
                  <th>Waktu Laporan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {returnHeaders.map((grp: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="font-bold text-gray-800">
                      {grp.header.nomor_tiket_retur}
                    </td>
                    <td className="text-gray-600 font-medium">
                      SO-XXX // need expansion support
                    </td>
                    <td className="font-semibold text-gray-700">
                      {grp.items.reduce(
                        (acc: any, i: any) => acc + i.quantity,
                        0,
                      )}{" "}
                      Item
                    </td>
                    <td>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          grp.header.status === "menunggu_pengiriman_ulang"
                            ? "bg-yellow-100 text-yellow-700"
                            : grp.header.status === "dikirim_ulang"
                              ? "bg-blue-100 text-blue-700"
                              : grp.header.status === "selesai"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {grp.header.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="text-gray-500 text-sm">
                      {new Date(grp.header.created_at).toLocaleString("id-ID")}
                    </td>
                    <td>
                      <button
                        onClick={() => setViewDetailReturn(grp)}
                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded text-sm font-semibold transition"
                      >
                        Detail Retur
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Partial Return Verify Modal */}
      {verifyBatchOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Cek Fisik & Penerimaan Barang
                </h2>
                <p className="text-sm text-gray-500">
                  Ref: {verifyBatchOrder.order.nomor_surat_order}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    // Set all to disetujui shortcut
                    const updated = { ...batchDecisions };
                    Object.keys(updated).forEach((k: string) => {
                      updated[parseInt(k)].status = "disetujui";
                    });
                    setBatchDecisions(updated);
                  }}
                  className="px-4 py-2 bg-green-50 text-green-700 font-semibold rounded hover:bg-green-100 text-sm flex items-center gap-2 transition"
                >
                  [ ✅ Terima Semua Baik ]
                </button>
                <button
                  onClick={() => setVerifyBatchOrder(null)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Body List */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div className="space-y-4">
                {verifyBatchOrder.shipments.map((shipment: any) => {
                  const isUnverified =
                    shipment.status === "menunggu_verifikasi";
                  // Jika item sudah diverifikasi FO di sesi lampau, lock.
                  if (!isUnverified) return null;

                  const decision = batchDecisions[shipment.id];
                  const isRetur = decision?.status === "ditolak";

                  return (
                    <div
                      key={shipment.id}
                      className={`bg-white rounded-lg border-2 p-4 shadow-sm transition-all ${isRetur ? "border-red-400" : "border-gray-200"}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <span className="text-xs text-gray-500 tracking-wider font-semibold uppercase">
                            {
                              shipment.spare_part_order_detail.spare_part
                                .kode_suku_cadang
                            }
                          </span>
                          <h3 className="font-bold text-gray-800 text-lg leading-tight">
                            {
                              shipment.spare_part_order_detail.spare_part
                                .nama_suku_cadang
                            }
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 font-medium">
                            Qty Dikirim:{" "}
                            <span className="bg-gray-100 px-2 rounded font-bold">
                              {shipment.quantity}{" "}
                              {
                                shipment.spare_part_order_detail.spare_part
                                  .satuan
                              }
                            </span>
                          </p>
                        </div>

                        <div className="flex bg-gray-100 p-1 rounded-md shadow-inner gap-1 min-w-[240px]">
                          <button
                            onClick={() =>
                              setBatchDecisions({
                                ...batchDecisions,
                                [shipment.id]: {
                                  ...decision,
                                  status: "disetujui",
                                },
                              })
                            }
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded transition ${
                              !isRetur
                                ? "bg-white shadow text-green-600"
                                : "text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            <Check className="w-4 h-4" /> Terima Baik
                          </button>
                          <button
                            onClick={() =>
                              setBatchDecisions({
                                ...batchDecisions,
                                [shipment.id]: {
                                  ...decision,
                                  status: "ditolak",
                                },
                              })
                            }
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded transition ${
                              isRetur
                                ? "bg-white shadow text-red-600"
                                : "text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            <XCircle className="w-4 h-4" /> Retur / Rusak
                          </button>
                        </div>
                      </div>

                      {/* Expendable Retur Form */}
                      {isRetur && (
                        <div className="mt-4 pt-4 border-t border-red-100 grid md:grid-cols-2 gap-4 animate-fadeIn">
                          <div>
                            <label className="block text-sm font-semibold text-red-800 mb-1">
                              Alasan Retur / Kendala Fisik *
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Misal: Kaca retak, baut kurang..."
                              className="w-full border-red-200 rounded-md focus:ring-red-400 focus:border-red-400 text-sm bg-red-50/50 p-2"
                              value={decision?.alasan || ""}
                              onChange={(e) =>
                                setBatchDecisions({
                                  ...batchDecisions,
                                  [shipment.id]: {
                                    ...decision,
                                    alasan: e.target.value,
                                  },
                                })
                              }
                            ></textarea>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-red-800 mb-1">
                              Upload Bukti Foto Laporan *
                            </label>
                            <label className="flex flex-col items-center justify-center w-full h-[76px] border-2 border-red-200 border-dashed rounded-md cursor-pointer hover:bg-red-50 bg-white transition relative">
                              <div className="flex flex-col items-center justify-center pt-2 pb-2">
                                <Camera className="w-5 h-5 text-red-400 mb-1" />
                                <p className="text-xs text-red-600 font-medium">
                                  Format JPG/PNG
                                </p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setBatchDecisions({
                                      ...batchDecisions,
                                      [shipment.id]: {
                                        ...decision,
                                        foto: e.target.files[0],
                                      },
                                    });
                                  }
                                }}
                              />
                              {decision?.foto && (
                                <div className="absolute inset-0 bg-green-50 rounded flex items-center justify-center p-2 text-center text-xs font-bold text-green-700 border-2 border-green-200">
                                  ✓ {decision.foto.name}
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setVerifyBatchOrder(null)}
                className="px-5 py-2.5 rounded font-semibold text-gray-600 hover:bg-gray-200 transition"
              >
                Batalkan
              </button>
              <button
                onClick={handleBatchSubmit}
                disabled={isSubmitting}
                className={`px-8 py-2.5 rounded font-bold text-white shadow-md transition ${isSubmitting ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
              >
                {isSubmitting
                  ? "Memproses Pengiriman..."
                  : "[ 🚀 Konfirmasi Penerimaan ]"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* TIKET RETUR DETAIL MODAL */}
      {viewDetailReturn && (
        <ReturnDetailModal
          group={viewDetailReturn}
          onClose={() => setViewDetailReturn(null)}
        />
      )}

      {/* View Detail Modal (Card + A4) */}
      {viewDetailOrder && (
        <DeliveryNoteModal
          group={viewDetailOrder}
          onClose={() => setViewDetailOrder(null)}
        />
      )}
    </div>
  );
}
