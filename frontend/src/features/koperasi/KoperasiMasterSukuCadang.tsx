import React, { useState, useEffect } from "react";
import { Edit, Save } from "lucide-react";
import Swal from "sweetalert2";
import { apiClient } from "../../lib/api";

const KoperasiMasterSukuCadang: React.FC = () => {
  const [spareParts, setSpareParts] = useState<any[]>([]);
  const [editPriceId, setEditPriceId] = useState<number | null>(null);
  const [editPriceValue, setEditPriceValue] = useState("");

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const fetchSpareParts = async () => {
    try {
      const res = await apiClient.get("/spare-parts");
      setSpareParts(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePrice = async (partId: number) => {
    if (!editPriceValue || parseInt(editPriceValue) < 0) {
      Swal.fire({ icon: "error", title: "Error", text: "Harga tidak valid" });
      return;
    }

    try {
      await apiClient.post(`/spare-parts/${partId}/update-price`, {
        harga_jual: parseInt(editPriceValue),
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Harga jual berhasil diupdate",
        timer: 1500,
        showConfirmButton: false,
      });
      setEditPriceId(null);
      fetchSpareParts();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Kesalahan server",
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-fade-in-up">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-bold text-gray-800">
          Direktori Data Master Suku Cadang (Kelola Harga Aktif)
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Menampilkan direktori inventori dan mengizinkan modifikasi paksa harga
          jual (menyimpan riwayat otomatis). Harga di bawah ini ditentukan dari
          transaksi penerimaan stok (Shipment) terbaru di Gudang.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Kode</th>
              <th className="px-6 py-4 font-medium">Nama Suku Cadang</th>
              <th className="px-6 py-4 font-medium">Harga Aktif</th>
              <th className="px-6 py-4 font-medium text-center">Stok Gudang</th>
              <th className="px-6 py-4 font-medium text-center">Aksi Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {spareParts.length > 0 ? (
              spareParts.map((part: any) => (
                <tr
                  key={part.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 font-mono text-xs text-gray-500 font-medium">
                    [{part.kode_suku_cadang}]
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">
                      {part.nama_suku_cadang}
                    </span>
                    <span className="text-xs text-gray-400 font-normal ml-1">
                      / {part.category?.nama_kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editPriceId === part.id ? (
                      <input
                        type="number"
                        className="w-full px-3 py-1.5 text-sm border border-blue-400 rounded-lg outline-none ring-2 ring-blue-100"
                        value={editPriceValue}
                        onChange={(e) => setEditPriceValue(e.target.value)}
                        placeholder="Rp..."
                      />
                    ) : (
                      <span className="font-semibold text-blue-600">
                        {part.harga_aktif
                          ? formatRupiah(part.harga_aktif)
                          : "---"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-full ${part.stock?.stok_sekarang <= part.stock?.stok_minimum ? "bg-red-50 text-red-700 ring-1 ring-red-600/20" : "bg-green-50 text-green-700 ring-1 ring-green-600/20"}`}
                    >
                      {part.stock?.stok_sekarang || 0} {part.satuan || "Pcs"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editPriceId === part.id ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setEditPriceId(null)}
                          className="text-gray-500 hover:text-gray-700 text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleUpdatePrice(part.id)}
                          className="text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-medium"
                        >
                          <Save size={14} /> Simpan
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditPriceId(part.id);
                          setEditPriceValue(part.harga_aktif || "");
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium border border-blue-100"
                        title="Koreksi manual log harga jual"
                      >
                        <Edit size={14} /> Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Belum ada modul suku cadang
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KoperasiMasterSukuCadang;
