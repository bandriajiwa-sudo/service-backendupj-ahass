import { useState } from "react";
import useSWR from "swr";
import { apiClient } from "../../lib/api";
import Swal from "sweetalert2";

interface Category {
  id: number;
  kode_kategori: string | null;
  nama_kategori: string;
}

export const CategoryList = () => {
  const { data, error, mutate } = useSWR(
    "/api/v1/categories",
    async (url: string) => {
      const res = await apiClient.get(url);
      return res.data.data as Category[];
    },
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    kode_kategori: "",
    nama_kategori: "",
  });

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingData(category);
      setFormData({
        kode_kategori: category.kode_kategori || "",
        nama_kategori: category.nama_kategori,
      });
    } else {
      setEditingData(null);
      setFormData({ kode_kategori: "", nama_kategori: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingData) {
        await apiClient.put(`/categories/${editingData.id}`, formData);
        Swal.fire("Berhasil", "Kategori diupdate!", "success");
      } else {
        await apiClient.post("/categories", formData);
        Swal.fire("Berhasil", "Kategori ditambahkan!", "success");
      }
      setIsModalOpen(false);
      mutate();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Terjadi kesalahan",
        "error",
      );
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Kategori?",
      text: "Data tidak bisa dikembalikan. Jika kategori masih dipakai suku cadang, maka tidak bisa dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/categories/${id}`);
        Swal.fire("Dihapus!", "Kategori berhasil dihapus.", "success");
        mutate();
      } catch (err: any) {
        Swal.fire(
          "Gagal",
          err.response?.data?.message || "Kategori mungkin masih digunakan.",
          "error",
        );
      }
    }
  };

  if (error) return <div>Gagal memuat kategori.</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm w-full">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Master Kategori Suku Cadang
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#0057b7] text-white px-4 py-2 rounded font-medium hover:bg-[#004494]"
        >
          + Tambah Kategori
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm md:text-base">
              <th className="p-4 font-semibold text-gray-600">ID</th>
              <th className="p-4 font-semibold text-gray-600">Kode</th>
              <th className="p-4 font-semibold text-gray-600">Nama Kategori</th>
              <th className="p-4 font-semibold text-gray-600 min-w[150px]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((cat: Category) => (
              <tr
                key={cat.id}
                className="border-b border-gray-100 hover:bg-gray-50/50"
              >
                <td className="p-4 text-gray-600">{cat.id}</td>
                <td className="p-4 text-gray-800 font-medium">
                  {cat.kode_kategori || "-"}
                </td>
                <td className="p-4 text-gray-600">{cat.nama_kategori}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(cat)}
                      className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded hover:bg-amber-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Data kategori kosong.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {editingData ? "Edit Kategori" : "Tambah Kategori"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Kode Kategori
                  </label>
                  <input
                    type="text"
                    value={formData.kode_kategori}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kode_kategori: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057b7]/20 focus:border-[#0057b7]"
                    placeholder="Opsional (misal: KTG-001)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_kategori}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nama_kategori: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057b7]/20 focus:border-[#0057b7]"
                    placeholder="Wajib diisi (misal: Oli Mesin)"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-medium text-white bg-[#0057b7] rounded hover:bg-[#004494] transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
