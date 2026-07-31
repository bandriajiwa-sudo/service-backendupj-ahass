import { useState } from "react";
import useSWR from "swr";
import { apiClient } from "../../lib/api";
import Swal from "sweetalert2";

interface User {
  id: number;
  nama_user: string;
  role: string;
  status: string;
  login?: {
    username: string;
  };
}

interface Personnel {
  id: number;
  user_id: number;
  nama_pegawai: string;
  unit_kerja: string;
  posisi: string;
  user?: User;
}

export const PersonnelList = () => {
  const { data, error, mutate } = useSWR("/personnels", async (url: string) => {
    const res = await apiClient.get(url);
    return res.data.data as Personnel[];
  });

  const { data: usersData } = useSWR("/users", async (url: string) => {
    const res = await apiClient.get(url);
    return res.data.data as User[];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<Personnel | null>(null);

  const [formData, setFormData] = useState({
    user_id: "",
    nama_pegawai: "",
    unit_kerja: "",
    posisi: "",
  });

  const handleOpenModal = (personnel?: Personnel) => {
    if (personnel) {
      setEditingData(personnel);
      setFormData({
        user_id: personnel.user_id.toString(),
        nama_pegawai: personnel.nama_pegawai,
        unit_kerja: personnel.unit_kerja,
        posisi: personnel.posisi,
      });
    } else {
      setEditingData(null);
      setFormData({
        user_id: "",
        nama_pegawai: "",
        unit_kerja: "",
        posisi: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, user_id: parseInt(formData.user_id) };
      if (editingData) {
        await apiClient.put(`/personnels/${editingData.id}`, payload);
        Swal.fire("Berhasil", "Data personel diupdate!", "success");
      } else {
        await apiClient.post("/personnels", payload);
        Swal.fire("Berhasil", "Personel ditambahkan!", "success");
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
      title: "Hapus Personel?",
      text: "Data profil akan dihapus (tetapi akun login tetap ada).",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/personnels/${id}`);
        Swal.fire("Dihapus!", "Personel berhasil dihapus.", "success");
        mutate();
      } catch (err: any) {
        Swal.fire("Gagal", "Terjadi kesalahan sistem.", "error");
      }
    }
  };

  if (error) return <div>Gagal memuat personil.</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm w-full">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Master Data Personel
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#0057b7] text-white px-4 py-2 rounded font-medium hover:bg-[#004494]"
        >
          + Tambah Profil
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm md:text-base">
              <th className="p-4 font-semibold text-gray-600">ID</th>
              <th className="p-4 font-semibold text-gray-600">Akun (Role)</th>
              <th className="p-4 font-semibold text-gray-600">Nama Pegawai</th>
              <th className="p-4 font-semibold text-gray-600">Unit / Posisi</th>
              <th className="p-4 font-semibold text-gray-600 min-w[150px]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((p: Personnel) => (
              <tr
                key={p.id}
                className="border-b border-gray-100 hover:bg-gray-50/50"
              >
                <td className="p-4 text-gray-600">{p.id}</td>
                <td className="p-4 text-gray-800 font-medium">
                  {p.user?.login?.username || p.user?.nama_user}{" "}
                  <span className="text-xs text-gray-400">
                    ({p.user?.role})
                  </span>
                </td>
                <td className="p-4 text-gray-600">{p.nama_pegawai}</td>
                <td className="p-4">
                  <div className="text-gray-800">{p.unit_kerja}</div>
                  <div className="text-sm text-gray-500">{p.posisi}</div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(p)}
                      className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded hover:bg-amber-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
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
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Data personil kosong.
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
                {editingData
                  ? "Edit Profil Personel"
                  : "Tambah Profil Personel"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Akun User (1 banding 1) *
                  </label>
                  <select
                    required
                    disabled={!!editingData} // Tidak bisa edit user_id jika sudah ada profil
                    value={formData.user_id}
                    onChange={(e) =>
                      setFormData({ ...formData, user_id: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057b7]/20 focus:border-[#0057b7] disabled:opacity-50"
                  >
                    <option value="" disabled>
                      -- Pilih Akun --
                    </option>
                    {usersData?.map((u: User) => (
                      <option key={u.id} value={u.id}>
                        {u.login?.username || u.nama_user} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nama Pegawai Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_pegawai}
                    onChange={(e) =>
                      setFormData({ ...formData, nama_pegawai: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057b7]/20 focus:border-[#0057b7]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Unit Kerja *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit_kerja}
                    onChange={(e) =>
                      setFormData({ ...formData, unit_kerja: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057b7]/20 focus:border-[#0057b7]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Posisi / Jabatan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.posisi}
                    onChange={(e) =>
                      setFormData({ ...formData, posisi: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057b7]/20 focus:border-[#0057b7]"
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
