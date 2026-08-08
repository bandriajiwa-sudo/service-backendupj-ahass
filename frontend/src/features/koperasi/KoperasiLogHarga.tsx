import { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import Swal from "sweetalert2";
import { Loader2, RefreshCw } from "lucide-react";

export default function KoperasiLogHarga() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 50,
    total: 0,
  });

  const fetchLogs = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(
        `/spare-part-price-logs?page=${page}&per_page=${pagination.perPage}`,
      );
      setLogs(response.data.data);
      setPagination({
        currentPage: response.data.meta.current_page,
        perPage: response.data.meta.per_page,
        total: response.data.meta.total,
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        text: "Gagal memuat log riwayat harga suku cadang",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="animate-fadeIn p-2 sm:p-6 lg:p-8 flex-1 w-full bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-bl-full -z-10 opacity-70"></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Log Harga Suku Cadang (Riwatar Perubahan)
            </h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base max-w-2xl leading-relaxed">
              Daftar rekam jejak historikal atau log penetapan harga jual suku
              cadang setiap kali penerimaan barang baru dilakukan dari Supplier
              (Penerimaan DO) ke Pusat Koperasi.
            </p>
          </div>
          <button
            onClick={() => fetchLogs(pagination.currentPage)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 hover:shadow-sm focus:ring-4 focus:ring-gray-100 transition-all text-sm"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-600" : ""}`}
            />
            {isLoading ? "Sinkronisasi..." : "Refresh Data"}
          </button>
        </div>

        {/* Data Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
          {isLoading && logs.length === 0 ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
              <p className="text-gray-500 font-medium">Memuat Log Harga...</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 uppercase text-xs tracking-wider text-gray-500">
                    <th className="px-6 py-4 font-bold">Waktu Penetapan</th>
                    <th className="px-6 py-4 font-bold">ID / Kode Parts</th>
                    <th className="px-6 py-4 font-bold">Nama Suku Cadang</th>
                    <th className="px-6 py-4 font-bold">Harga Jual Baru</th>
                    <th className="px-6 py-4 font-bold">Aktor / Penerima DO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600 font-medium">
                          {new Date(log.created_at).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                          {log.shipment?.spare_part_order_detail?.spare_part
                            ?.kode_suku_cadang || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {log.shipment?.spare_part_order_detail?.spare_part
                          ?.nama_suku_cadang || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-emerald-700 font-bold bg-emerald-50 inline-block px-3 py-1 rounded-md border border-emerald-100">
                          {formatRupiah(log.harga_jual)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600 font-semibold flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-brand-dark overflow-hidden shrink-0">
                            {log.shipment?.shipped_by?.name
                              ? log.shipment.shipped_by.name
                                  .substring(0, 1)
                                  .toUpperCase()
                              : "?"}
                          </div>
                          {log.shipment?.shipped_by?.name || "Sistem Automasi"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {logs.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="inline-flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                          <RefreshCw className="w-8 h-8 text-gray-400 mb-3" />
                          <h3 className="text-gray-900 font-bold text-lg">
                            Belum Ada Log Harga
                          </h3>
                          <p className="text-gray-500 max-w-sm mt-1">
                            Histori ini masih kosong, semua perubahan atau
                            konfirmasi harga penjualan baru akan direkam di sini
                            saat barang DO diterima Koperasi.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Simple Pagination Footer - Optional for visual completion */}
          {pagination.total > 0 && (
            <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">
                Menampilkan{" "}
                {(pagination.currentPage - 1) * pagination.perPage + 1} -
                {Math.min(
                  pagination.currentPage * pagination.perPage,
                  pagination.total,
                )}{" "}
                dari {pagination.total} Log
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.currentPage <= 1 || isLoading}
                  onClick={() => fetchLogs(pagination.currentPage - 1)}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border rounded shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={
                    pagination.currentPage * pagination.perPage >=
                      pagination.total || isLoading
                  }
                  onClick={() => fetchLogs(pagination.currentPage + 1)}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border rounded shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
