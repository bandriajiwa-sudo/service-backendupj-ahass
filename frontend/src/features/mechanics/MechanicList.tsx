import React, { useEffect, useState } from "react";
import { apiClient } from "../../lib/api";
import { Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import styles from "./MechanicList.module.css";

interface Mechanic {
  id: number;
  mechanic_code: string;
  nama_mekanik: string;
  status: string;
}

const MechanicList: React.FC = () => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editMechanicId, setEditMechanicId] = useState<number | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    mechanic_code: "",
    nama_mekanik: "",
    status: "active",
  });

  const fetchMechanics = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/mechanics");
      // Fallback if data is missing
      setMechanics(response.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data mekanik", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  const handleSave = async () => {
    try {
      if (!formData.nama_mekanik || !formData.status) {
        Swal.fire({
          icon: "warning",
          title: "Peringatan",
          text: "Harap isi nama mekanik dan status.",
        });
        return;
      }

      const payload = { ...formData };

      if (editMechanicId) {
        await apiClient.put(`/mechanics/${editMechanicId}`, payload);
      } else {
        await apiClient.post("/mechanics", payload);
      }

      // Cleanup
      fetchMechanics();
      setIsFormOpen(false);
      setEditMechanicId(null);
      setFormData({
        mechanic_code: "",
        nama_mekanik: "",
        status: "active",
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data mekanik berhasil disimpan.",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err: any) {
      console.error("Gagal menyimpan data mekanik", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text:
          err.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data mekanik.",
      });
    }
  };

  const handleToggleForm = () => {
    if (isFormOpen) {
      setIsFormOpen(false);
      setEditMechanicId(null);
      setFormData({
        mechanic_code: "",
        nama_mekanik: "",
        status: "active",
      });
    } else {
      setIsFormOpen(true);
    }
  };

  const handleEdit = (m: Mechanic) => {
    setEditMechanicId(m.id);
    setFormData({
      mechanic_code: m.mechanic_code,
      nama_mekanik: m.nama_mekanik,
      status: m.status,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Mekanik?",
      text: "Anda yakin ingin menghapus mekanik ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/mechanics/${id}`);
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Data mekanik berhasil dihapus.",
          showConfirmButton: false,
          timer: 1500,
        });
        fetchMechanics();
      } catch (err: any) {
        console.error("Failed to delete mechanic", err);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: err.response?.data?.message || "Gagal menghapus mekanik.",
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "aktif":
        return (
          <span className={`${styles.badge} ${styles.badgeActive}`}>Aktif</span>
        );
      case "inactive":
      case "tidak aktif":
        return (
          <span className={`${styles.badge} ${styles.badgeInactive}`}>
            Tidak Aktif
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const filteredMechanics = mechanics.filter((m) => {
    const matchesSearch =
      m.nama_mekanik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mechanic_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? m.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Data Mekanik</h1>
        <p className={styles.pageSubtitle}>
          Kelola mekanik untuk pencatatan layanan jasa servis
        </p>
      </div>

      <div className={styles.tableCard}>
        <div
          className={styles.toolbar}
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            margin: 0,
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            borderRadius: 0,
            backgroundColor: "transparent",
          }}
        >
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Cari Mekanik</label>
              <input
                type="text"
                placeholder="Nama atau kode mekanik"
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Status</label>
              <select
                className={styles.selectInput}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
          </div>

          <button className={styles.addBtn} onClick={handleToggleForm}>
            + Tambah Mekanik
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Mekanik</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: "center", padding: "24px" }}
                  >
                    Memuat...
                  </td>
                </tr>
              ) : mechanics.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: "center", padding: "24px" }}
                  >
                    Belum ada data atau kata kunci tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredMechanics.map((m) => (
                  <tr key={m.id}>
                    <td>{m.mechanic_code}</td>
                    <td style={{ fontWeight: 500, color: "#0f2c4a" }}>
                      {m.nama_mekanik}
                    </td>
                    <td>{getStatusBadge(m.status)}</td>
                    <td>
                      <div className={styles.actionLinks}>
                        <span
                          className={styles.actionLink}
                          onClick={() => handleEdit(m)}
                        >
                          Edit
                        </span>
                        <Trash2
                          size={18}
                          className={styles.actionIconDanger}
                          onClick={() => handleDelete(m.id)}
                          style={{ cursor: "pointer", color: "#f43f5e" }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
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
              {editMechanicId ? "Edit Mekanik" : "Form Tambah Mekanik"}
            </h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Kode Mekanik *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Otomatis: MK-XXX"
                  value={formData.mechanic_code}
                  disabled
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nama Mekanik *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Masukkan nama mekanik"
                  value={formData.nama_mekanik}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_mekanik: e.target.value })
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

export default MechanicList;
