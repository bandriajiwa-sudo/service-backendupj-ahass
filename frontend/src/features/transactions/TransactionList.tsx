import React, { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import { useAuth } from "../../app/AuthContext";
import Swal from "sweetalert2";
import { Trash2 } from "lucide-react";
import styles from "./TransactionList.module.css";

interface UserApi {
  id: number;
  nama_user: string;
  role: string;
}

interface Mechanic {
  id: number;
  nama_mekanik: string;
}

interface SparePart {
  id: number;
  nama_suku_cadang: string;
  harga_jual: number;
  stok_sekarang: number;
}

interface JasaItem {
  id_mekanik: number;
  nama_mekanik: string;
  nama_jasa: string;
  biaya_jasa: number;
  keterangan: string;
  subtotal: number;
}

interface PartItem {
  id_master_suku_cadang: number;
  nama_suku_cadang: string;
  harga_satuan: number;
  stok_tersedia: number;
  qty: number;
  subtotal: number;
}

const TransactionList: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserApi[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);

  // Cart States
  const [jasaList, setJasaList] = useState<JasaItem[]>([]);
  const [partList, setPartList] = useState<PartItem[]>([]);

  // Nota State
  const [nomorNota, setNomorNota] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [selectedFoUser, setSelectedFoUser] = useState("");

  // Jasa Form
  const [jasaForm, setJasaForm] = useState({
    nama_jasa: "",
    id_mekanik: "",
    keterangan: "",
    biaya_jasa: "",
  });

  // Part Form
  const [partForm, setPartForm] = useState({
    id_master_suku_cadang: "",
    stok_tersedia: "",
    qty: "1",
    harga_jual: "",
  });

  useEffect(() => {
    fetchDependancies();

    // Set default values including initial date
    const today = new Date().toISOString().split("T")[0];
    setTanggal(today);

    if (user) {
      setSelectedFoUser(user.id.toString());
    }
  }, [user]);

  // When date changes, regenerate the nota
  useEffect(() => {
    if (tanggal) {
      const d = new Date(tanggal);
      const pad = (n: number) => n.toString().padStart(2, "0");
      const dStr = `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
      setNomorNota(`NT01-${dStr}`);
    }
  }, [tanggal]);

  const fetchDependancies = async () => {
    try {
      const [resUsers, resMech, resParts] = await Promise.all([
        apiClient.get("/users"),
        apiClient.get("/mechanics"),
        apiClient.get("/spare-parts"),
      ]);

      const foUsers = resUsers.data.data.filter(
        (u: any) => u.role === "front_office" || u.role === "admin",
      );
      setUsers(foUsers);

      setMechanics(resMech.data.data.filter((m: any) => m.status === "active"));

      const mappedParts = resParts.data.data.map((p: any) => ({
        id: p.id,
        nama_suku_cadang: p.nama_suku_cadang,
        harga_jual: parseFloat(p.harga_jual),
        stok_sekarang: p.stock?.stok_sekarang || 0,
      }));
      setSpareParts(mappedParts);
    } catch (err) {
      console.error("Gagal load masters", err);
    }
  };

  const handlePartSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    if (!pId) {
      setPartForm({
        id_master_suku_cadang: "",
        stok_tersedia: "",
        qty: "1",
        harga_jual: "",
      });
      return;
    }
    const part = spareParts.find((x) => x.id === parseInt(pId));
    if (part) {
      setPartForm({
        ...partForm,
        id_master_suku_cadang: pId,
        stok_tersedia: part.stok_sekarang.toString(),
        harga_jual: part.harga_jual.toString(),
      });
    }
  };

  const addJasa = () => {
    if (!jasaForm.nama_jasa || !jasaForm.id_mekanik || !jasaForm.biaya_jasa) {
      Swal.fire({ icon: "warning", text: "Lengkapi data jasa servis utama!" });
      return;
    }
    const mech = mechanics.find((m) => m.id === parseInt(jasaForm.id_mekanik));
    const price = parseFloat(jasaForm.biaya_jasa);

    const newItem: JasaItem = {
      id_mekanik: parseInt(jasaForm.id_mekanik),
      nama_mekanik: mech?.nama_mekanik || "",
      nama_jasa: jasaForm.nama_jasa,
      biaya_jasa: price,
      keterangan: jasaForm.keterangan || "-",
      subtotal: price,
    };
    setJasaList([...jasaList, newItem]);
    setJasaForm({
      id_mekanik: "",
      nama_jasa: "",
      keterangan: "",
      biaya_jasa: "",
    });
  };

  const addPart = () => {
    if (!partForm.id_master_suku_cadang || !partForm.qty) {
      Swal.fire({ icon: "warning", text: "Lengkapi data suku cadang!" });
      return;
    }
    const qty = parseInt(partForm.qty);
    const part = spareParts.find(
      (p) => p.id === parseInt(partForm.id_master_suku_cadang),
    );
    if (!part) return;

    if (qty > part.stok_sekarang) {
      Swal.fire({
        icon: "error",
        title: "Stok Tidak Cukup!",
        text: `Sisa stok: ${part.stok_sekarang}`,
      });
      return;
    }

    const newItem: PartItem = {
      id_master_suku_cadang: part.id,
      nama_suku_cadang: part.nama_suku_cadang,
      qty: qty,
      harga_satuan: part.harga_jual,
      stok_tersedia: part.stok_sekarang,
      subtotal: part.harga_jual * qty,
    };
    setPartList([...partList, newItem]);
    setPartForm({
      id_master_suku_cadang: "",
      stok_tersedia: "",
      qty: "1",
      harga_jual: "",
    });
  };

  const removeJasa = (index: number) => {
    setJasaList(jasaList.filter((_, i) => i !== index));
  };

  const removePart = (index: number) => {
    setPartList(partList.filter((_, i) => i !== index));
  };

  const subtotalJasa = jasaList.reduce((acc, curr) => acc + curr.subtotal, 0);
  const subtotalPart = partList.reduce((acc, curr) => acc + curr.subtotal, 0);
  const grandTotal = subtotalJasa + subtotalPart;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  const handleCheckout = async () => {
    if (jasaList.length === 0 && partList.length === 0) {
      Swal.fire({ icon: "warning", text: "Nota masih kosong!" });
      return;
    }

    const payload = {
      tanggal: tanggal,
      user_id: parseInt(selectedFoUser),
      no_nota: nomorNota,
      services: jasaList.map((c) => ({
        mechanic_id: c.id_mekanik,
        nama_jasa: c.nama_jasa,
        biaya_jasa: c.biaya_jasa,
        keterangan_jasa: c.keterangan,
      })),
      spare_parts: partList.map((c) => ({
        spare_part_id: c.id_master_suku_cadang,
        jumlah: c.qty,
      })),
    };

    try {
      await apiClient.post("/transactions", payload);
      Swal.fire({
        icon: "success",
        title: "Transaksi Berhasil",
        text: "Data nota tersimpan.",
      });
      setJasaList([]);
      setPartList([]);
      fetchDependancies();
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || err.message,
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Transaksi Baru</h1>
        <p className={styles.pageSubtitle}>
          Catat jasa servis dan suku cadang dalam satu nota
        </p>
      </div>

      <div className={styles.cardContainer}>
        {/* INFORMASI TRANSAKSI */}
        <div className={styles.card}>
          <div className={styles.cardHeaderFlex}>
            <h2 className={styles.cardTitle}>Informasi Transaksi</h2>
            <span className={styles.badgeDraft}>Draft</span>
          </div>
          <div className={styles.formGridInfo}>
            <div className={styles.formGroup}>
              <label>Nomor Nota</label>
              <input
                type="text"
                value={nomorNota}
                onChange={(e) => setNomorNota(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Tanggal</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Petugas</label>
              <select
                value={selectedFoUser}
                onChange={(e) => setSelectedFoUser(e.target.value)}
              >
                <option value="">Pilih Petugas (FO)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama_user} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.dashboardGrid}>
          <div className={styles.leftColumn}>
            {/* DETAIL JASA SERVIS */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Detail Jasa Servis</h2>
              <div className={styles.formGridDynamic}>
                <div className={styles.formGroup}>
                  <label>Jenis Jasa *</label>
                  <input
                    type="text"
                    placeholder="Pilih layanan jasa"
                    value={jasaForm.nama_jasa}
                    onChange={(e) =>
                      setJasaForm({ ...jasaForm, nama_jasa: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Mekanik *</label>
                  <select
                    value={jasaForm.id_mekanik}
                    onChange={(e) =>
                      setJasaForm({ ...jasaForm, id_mekanik: e.target.value })
                    }
                  >
                    <option value="">Pilih mekanik</option>
                    {mechanics.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama_mekanik}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Keterangan</label>
                  <input
                    type="text"
                    placeholder="Catatan..."
                    value={jasaForm.keterangan}
                    onChange={(e) =>
                      setJasaForm({ ...jasaForm, keterangan: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Harga Jasa *</label>
                  <input
                    type="number"
                    placeholder="Rp0"
                    value={jasaForm.biaya_jasa}
                    onChange={(e) =>
                      setJasaForm({ ...jasaForm, biaya_jasa: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className={styles.btnActionRight}>
                <button className={styles.btnAddOutline} onClick={addJasa}>
                  Simpan
                </button>
              </div>

              {jasaList.length > 0 && (
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Jasa</th>
                        <th>Mekanik</th>
                        <th>Keterangan</th>
                        <th>Harga</th>
                        <th>Subtotal</th>
                        <th style={{ width: "40px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {jasaList.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.nama_jasa}</td>
                          <td>{item.nama_mekanik}</td>
                          <td>{item.keterangan}</td>
                          <td>{formatIDR(item.biaya_jasa)}</td>
                          <td>{formatIDR(item.subtotal)}</td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              title="Hapus"
                              type="button"
                              className={styles.btnIconDelete}
                              onClick={() => removeJasa(idx)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* DETAIL SUKU CADANG */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Detail Suku Cadang</h2>
              <div className={styles.formGridDynamic}>
                <div className={styles.formGroup}>
                  <label>Suku Cadang *</label>
                  <select
                    value={partForm.id_master_suku_cadang}
                    onChange={handlePartSelect}
                  >
                    <option value="">Cari kode atau nama barang</option>
                    {spareParts.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={p.stok_sekarang <= 0}
                      >
                        {p.nama_suku_cadang}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Stok Tersedia</label>
                  <input
                    type="text"
                    disabled
                    value={
                      partForm.stok_tersedia
                        ? partForm.stok_tersedia + " pcs"
                        : ""
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Jumlah *</label>
                  <input
                    type="number"
                    min="1"
                    value={partForm.qty}
                    onChange={(e) =>
                      setPartForm({ ...partForm, qty: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Harga Jual</label>
                  <input
                    type="text"
                    disabled
                    value={
                      partForm.harga_jual
                        ? formatIDR(parseFloat(partForm.harga_jual))
                        : "Rp0"
                    }
                  />
                </div>
              </div>

              <div className={styles.btnActionRight}>
                <button className={styles.btnAddOutline} onClick={addPart}>
                  Simpan
                </button>
              </div>

              {partList.length > 0 && (
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Suku Cadang</th>
                        <th>Stok</th>
                        <th>Qty</th>
                        <th>Harga</th>
                        <th>Subtotal</th>
                        <th style={{ width: "40px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {partList.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.nama_suku_cadang}</td>
                          <td>{item.stok_tersedia}</td>
                          <td>{item.qty}</td>
                          <td>{formatIDR(item.harga_satuan)}</td>
                          <td>{formatIDR(item.subtotal)}</td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              title="Hapus"
                              type="button"
                              className={styles.btnIconDelete}
                              onClick={() => removePart(idx)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className={styles.rightColumn}>
            {/* RINGKASAN TRANSAKSI */}
            <div className={styles.cardSummary}>
              <h2 className={styles.cardTitle}>RANGKUMAN TRANSAKSI</h2>
              <div className={styles.summaryStack}>
                <div className={styles.summaryRow}>
                  <span>Subtotal (Jasa)</span>
                  <span>{formatIDR(subtotalJasa)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Subtotal (Parts)</span>
                  <span>{formatIDR(subtotalPart)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Total</span>
                  <span>Rp 0</span>
                </div>

                <hr className={styles.summaryDivider} />

                <div className={styles.summaryTotal}>
                  <span className={styles.totalLabel}>Total Pembayaran</span>
                  <span className={styles.totalValue}>
                    {formatIDR(grandTotal)}
                  </span>
                </div>

                <div className={styles.paymentMethod}>
                  <span className={styles.paymentLabel}>Payment Method</span>
                  <div className={styles.radioGroup}>
                    <label>
                      <input type="radio" name="payment" defaultChecked /> Cash
                    </label>
                    <label>
                      <input type="radio" name="payment" /> Transfer
                    </label>
                  </div>
                </div>

                <div className={styles.summaryActionGrid}>
                  <button className={styles.btnDraft} type="button">
                    SIMPAN DRAFT
                  </button>
                  <button
                    className={styles.btnCetak}
                    type="button"
                    onClick={handleCheckout}
                  >
                    SIMPAN & CETAK NOTA
                  </button>
                  <button
                    className={styles.btnBatal}
                    type="button"
                    onClick={() => {
                      setJasaList([]);
                      setPartList([]);
                    }}
                  >
                    BATAL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
