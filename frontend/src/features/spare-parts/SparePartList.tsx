import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { apiClient } from "../../lib/api";
import { useAuth } from "../../app/AuthContext";
import {  } from "lucide-react";
import Swal from "sweetalert2";
import styles from "./SparePartList.module.css";

interface SparePart {
  id: number;
  kode_suku_cadang: string;
  nama_suku_cadang: string;
  category?: {
    id: number;
    nama_kategori: string;
  };
  category_id?: number;
  kategori?: string;
  satuan?: string;
  harga_jual?: number;
  harga_aktif?: string;
  stok_sekarang?: number;
  stok_minimum?: number;
  status?: string;
}

const SparePartList: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [parts, setParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editPartId, setEditPartId] = useState<number | null>(null);

  // Dynamic Categories from API
  const { data: categoriesData } = useSWR(
    "/categories",
    async (url: string) => {
      const res = await apiClient.get(url);
      return res.data.data as any[];
    },
  );

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStockStatus, setFilterStockStatus] = useState("");

  const [formData, setFormData] = useState({
    kode_suku_cadang: "",
    nama_suku_cadang: "",
    category_id: "",
    satuan: "Pcs",
    stok_sekarang: 0,
    stok_minimum: 0,
    status: "active",
  });

  const fetchParts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/spare-parts");

      const mappedParts = (response.data.data || []).map((p: any) => ({
        id: p.id,
        kode_suku_cadang: p.kode_suku_cadang,
        nama_suku_cadang: p.nama_suku_cadang,
        category: p.category,
        category_id: p.category_id,
        kategori: p.category?.nama_kategori,
        harga_aktif: p.harga_aktif,
        stok_sekarang: p.stock?.stok_sekarang || 0,
        stok_minimum: p.stock?.stok_minimum || 0,
        satuan: "Pcs", // Mock UI missing from API
        status:
          (p.stock?.stok_sekarang || 0) > (p.stock?.stok_minimum || 0)
            ? "active"
            : "inactive",
      }));

      setParts(mappedParts);
    } catch (err) {
      console.error("Gagal mengambil data suku cadang", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const handleToggleForm = () => {
    if (isFormOpen) {
      setIsFormOpen(false);
      setEditPartId(null);
      setFormData({
        kode_suku_cadang: "",
        nama_suku_cadang: "",
        category_id: "",
        satuan: "Pcs",
        stok_sekarang: 0,
        stok_minimum: 0,
        status: "active",
      });
    } else {
      setIsFormOpen(true);
    }
  };

  const handleEdit = (p: SparePart) => {
    setEditPartId(p.id);
    setFormData({
      kode_suku_cadang: p.kode_suku_cadang,
      nama_suku_cadang: p.nama_suku_cadang,
      category_id: p.category_id?.toString() || "",
      satuan: p.satuan || "Pcs",
      stok_sekarang: p.stok_sekarang || 0,
      stok_minimum: p.stok_minimum || 0,
      status: "active", // defaulting as not all mocked in database
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    try {
      if (
        !formData.kode_suku_cadang ||
        !formData.nama_suku_cadang ||
        !formData.category_id ||
        !formData.satuan
      ) {
        Swal.fire({
          icon: "warning",
          title: "Peringatan",
          text: "Harap lengkapi field wajib (*).",
        });
        return;
      }

      const payload: any = { ...formData };
      payload.category_id = Number(payload.category_id);

      if (!editPartId) {
        // Backend expects 'stok_awal' on creation
        payload.stok_awal = Number(payload.stok_sekarang) || 0;
        payload.stok_minimum = Number(payload.stok_minimum) || 0;
        delete payload.stok_sekarang;
      }

      delete payload.status; // computed from stock levels

      if (editPartId) {
        payload.stok_sekarang = Number(payload.stok_sekarang) || 0;
        payload.stok_minimum = Number(payload.stok_minimum) || 0;
        await apiClient.put(`/spare-parts/${editPartId}`, payload);
      } else {
        await apiClient.post("/spare-parts", payload);
      }

      fetchParts();
      setIsFormOpen(false);
      setEditPartId(null);
      setFormData({
        kode_suku_cadang: "",
        nama_suku_cadang: "",
        category_id: "",
        satuan: "Pcs",
        stok_sekarang: 0,
        stok_minimum: 0,
        status: "active",
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data suku cadang berhasil disimpan.",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err: any) {
      console.error("Gagal menyimpan data suku cadang", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text:
          err.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data suku cadang.",
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Suku Cadang?",
      text: "Anda yakin ingin menghapus data suku cadang ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/spare-parts/${id}`);
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Data suku cadang berhasil dihapus.",
          showConfirmButton: false,
          timer: 1500,
        });
        fetchParts();
      } catch (err: any) {
        console.error("Failed to delete spare part", err);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: err.response?.data?.message || "Gagal menghapus suku cadang.",
        });
      }
    }
  };

  const formatCurrency = (val: number | string | undefined | null) => {
    if (!val) return "-";
    const num = typeof val === "string" ? parseFloat(val) : val;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const filteredParts = parts.filter((p) => {
    const matchesSearch =
      p.nama_suku_cadang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kode_suku_cadang.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory
      ? (p.kategori || "").toLowerCase() === filterCategory.toLowerCase()
      : true;

    const isCritical = (p.stok_sekarang || 0) <= (p.stok_minimum || 0);
    const pStockStatus = isCritical ? "minimum" : "aman";
    const matchesStock = filterStockStatus
      ? pStockStatus === filterStockStatus
      : true;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {isAdmin ? "Master Suku Cadang" : "Informasi Stok"}
        </h1>
        <p className={styles.pageSubtitle}>
          {isAdmin
            ? "Kelola referensi barang, harga jual, dan batas stok minimum"
            : "Informasi ketersediaan barang untuk mendukung operasional"}
        </p>
      </div>
      {/* Unified Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-5 flex flex-wrap gap-4 items-start justify-between border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-end">
            <div
              className={styles.filterGroup}
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                Cari
              </label>
              <input
                type="text"
                placeholder="Kode atau nama suku cadang"
                style={{
                  padding: "8px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  outline: "none",
                  color: "#334155",
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div
              className={styles.filterGroup}
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                Kategori
              </label>
              <select
                style={{
                  padding: "8px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  outline: "none",
                  color: "#334155",
                  backgroundColor: "white",
                }}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">Semua kategori</option>
                {categoriesData?.map((c: any) => (
                  <option key={c.id} value={c.nama_kategori}>
                    {c.nama_kategori}
                  </option>
                ))}
              </select>
            </div>
            <div
              className={styles.filterGroup}
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                Status Stok
              </label>
              <select
                style={{
                  padding: "8px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  outline: "none",
                  color: "#334155",
                  backgroundColor: "white",
                }}
                value={filterStockStatus}
                onChange={(e) => setFilterStockStatus(e.target.value)}
              >
                <option value="">Semua status</option>
                <option value="aman">Aman</option>
                <option value="minimum">Minimum</option>
              </select>
            </div>
          </div>

          {isAdmin && (
            <button className={styles.addBtn} onClick={handleToggleForm}>
              + Tambah Suku Cadang
            </button>
          )}
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-left">
                  Kode
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-left">
                  Nama Suku Cadang
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-left">
                  Kategori
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-right">
                  Harga Jual
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-right">
                  Stok
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-right">
                  Minimum
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-center">
                  Status
                </th>
                {isAdmin && (
                  <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-center">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-gray-500">
                    Memuat...
                  </td>
                </tr>
              ) : parts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-gray-500">
                    Tidak ada data master suku cadang yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredParts.map((p) => {
                  const isCritical =
                    (p.stok_sekarang || 0) <= (p.stok_minimum || 0);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="text-sm text-gray-800 px-4 py-3 text-left">
                        {p.kode_suku_cadang}
                      </td>
                      <td
                        className="text-sm text-gray-800 px-4 py-3 text-left"
                        style={{ fontWeight: 500, color: "#0f2c4a" }}
                      >
                        {p.nama_suku_cadang}
                      </td>
                      <td className="text-sm text-gray-800 px-4 py-3 text-left">
                        {p.kategori}
                      </td>
                      <td className="text-sm text-gray-800 px-4 py-3 text-right">
                        {formatCurrency(p.harga_aktif)}
                      </td>
                      <td className="text-sm text-gray-800 px-4 py-3 text-right">
                        {p.stok_sekarang}
                      </td>
                      <td className="text-sm text-gray-800 px-4 py-3 text-right">
                        {p.stok_minimum}
                      </td>
                      <td className="text-sm text-gray-800 px-4 py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium inline-block text-center ${
                            isCritical
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isCritical ? "Minimum" : "Aman"}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="text-sm text-gray-800 px-4 py-3 text-center">
                          <div className="flex gap-2 items-center">
                            <button
                              className="bg-[#f59e0b] hover:bg-[#d97706] text-white font-medium text-sm px-4 py-1.5 rounded transition shadow-sm"
                              onClick={() => handleEdit(p)}
                            >
                              Edit
                            </button>
                            <button
                              className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-medium text-sm px-4 py-1.5 rounded transition shadow-sm"
                              onClick={() => handleDelete(p.id)}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className={styles.modalOverlay} onClick={handleToggleForm}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.panelTitle}>
              {editPartId ? "Edit Suku Cadang" : "Form Suku Cadang"}
            </h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Kode *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="SC-006"
                  value={formData.kode_suku_cadang}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kode_suku_cadang: e.target.value,
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nama Suku Cadang *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Masukkan nama barang"
                  value={formData.nama_suku_cadang}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nama_suku_cadang: e.target.value,
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Kategori *</label>
                <select
                  className={styles.formInput}
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Pilih Kategori
                  </option>
                  {categoriesData?.map((c) => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.nama_kategori}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Satuan *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Pcs"
                  value={formData.satuan}
                  onChange={(e) =>
                    setFormData({ ...formData, satuan: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Stok Awal *</label>
                <input
                  type="number"
                  className={styles.formInput}
                  placeholder="0"
                  value={formData.stok_sekarang}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stok_sekarang: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Batas Minimum *</label>
                <input
                  type="number"
                  className={styles.formInput}
                  placeholder="0"
                  value={formData.stok_minimum}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stok_minimum: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status *</label>
                <select
                  className={styles.formSelect}
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={handleToggleForm}
              >
                Batal
              </button>
              <button
                type="button"
                className={styles.btnSave}
                onClick={handleSave}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SparePartList;
