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
  kode_suku_cadang: string;
  nama_suku_cadang: string;
  kategori: string;
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
  kode_suku_cadang: string;
  nama_suku_cadang: string;
  kategori: string;
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
  const [selectedKategori, setSelectedKategori] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

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
    kode_suku_cadang: "",
    kategori: "",
    stok_tersedia: "",
    qty: "1",
    harga_jual: "",
  });

  useEffect(() => {
    fetchDependancies();

    const today = new Date().toISOString().split("T")[0];
    setTanggal(today);

    // Auto Increment Numeration Triggered by Tanggal State later
    if (user) {
      setSelectedFoUser(user.id.toString());
    }
  }, [user]);

  // When date changes, regenerate the nota
  useEffect(() => {
    if (tanggal) {
      generateNomorNota(tanggal);
    }
  }, [tanggal]);

  const generateNomorNota = async (tgl: string) => {
    try {
      const res = await apiClient.get("/transactions");
      const dateStr = tgl.replace(/-/g, "");
      const prefix = `INV-${dateStr}-`;

      const sameDay = res.data.data.filter(
        (t: any) => t.no_nota && t.no_nota.startsWith(prefix),
      );

      const nextNum = (sameDay.length + 1).toString().padStart(3, "0");
      setNomorNota(`${prefix}${nextNum}`);
    } catch {
      const dateStr = tgl.replace(/-/g, "");
      setNomorNota(`INV-${dateStr}-001`);
    }
  };

  const fetchDependancies = async () => {
    try {
      const [resUsers, resMech, resParts] = await Promise.all([
        apiClient.get("/users"),
        apiClient.get("/mechanics"),
        apiClient.get("/spare-parts"),
      ]);

      const foUsers = resUsers.data.data.filter(
        (u: any) => u.role === "front_office",
      );
      setUsers(foUsers);

      setMechanics(resMech.data.data.filter((m: any) => m.status === "active"));

      const mappedParts = resParts.data.data.map((p: any) => ({
        id: p.id,
        kode_suku_cadang: p.kode_suku_cadang,
        kategori: p.kategori,
        nama_suku_cadang: p.nama_suku_cadang,
        harga_jual: parseFloat(p.harga_jual),
        stok_sekarang: p.stock?.stok_sekarang || 0,
      }));
      setSpareParts(mappedParts);
    } catch (err) {
      console.error("Gagal load masters", err);
    }
  };

  const handleKategoriChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKategori(e.target.value);
    setPartForm({
      id_master_suku_cadang: "",
      kode_suku_cadang: "",
      kategori: e.target.value,
      stok_tersedia: "",
      qty: "1",
      harga_jual: "",
    });
  };

  const handlePartSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    if (!pId) {
      setPartForm({
        id_master_suku_cadang: "",
        kode_suku_cadang: "",
        kategori: selectedKategori,
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
        kode_suku_cadang: part.kode_suku_cadang,
        kategori: part.kategori,
        stok_tersedia: part.stok_sekarang.toString(),
        harga_jual: part.harga_jual.toString(),
      });
    }
  };

  const kategoriList = Array.from(
    new Set(spareParts.map((p) => p.kategori).filter(Boolean)),
  );
  const filteredParts = selectedKategori
    ? spareParts.filter((p) => p.kategori === selectedKategori)
    : spareParts;

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
      kode_suku_cadang: part.kode_suku_cadang,
      nama_suku_cadang: part.nama_suku_cadang,
      kategori: part.kategori,
      qty: qty,
      harga_satuan: part.harga_jual,
      stok_tersedia: part.stok_sekarang,
      subtotal: part.harga_jual * qty,
    };
    setPartList([...partList, newItem]);
    setPartForm({
      id_master_suku_cadang: "",
      kode_suku_cadang: "",
      kategori: selectedKategori,
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
      const res = await apiClient.post("/transactions", payload);
      const txId = res.data.data?.id;

      if (txId) {
        // Fetch generated PDF blob
        const pdfRes = await apiClient.get(`/transactions/${txId}/print`, {
          responseType: "blob",
        });
        const file = new Blob([pdfRes.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(file);
        // Open PDF in new tab
        window.open(fileURL, "_blank");
      }

      Swal.fire({
        icon: "success",
        title: "Transaksi Berhasil",
        text: "Data nota tersimpan dan siap dicetak.",
      });
      setJasaList([]);
      setPartList([]);

      // Fetch fresh nota string for next transaction
      generateNomorNota(tanggal);
      fetchDependancies();
    } catch (err: any) {
      console.error(err);

      const errorMsg =
        err.response?.data?.errors?.no_nota?.[0] ||
        err.response?.data?.message ||
        err.message;

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: errorMsg,
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
                    {u.nama_user}
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

              <div
                className={styles.btnActionRight}
                style={{ marginTop: "16px" }}
              >
                <button
                  type="button"
                  className={styles.btnAddOutline}
                  onClick={addJasa}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    borderRadius: "6px",
                    fontWeight: 600,
                    border: "none",
                    padding: "8px 24px",
                  }}
                >
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
                  <label>Kategori</label>
                  <select
                    value={selectedKategori}
                    onChange={handleKategoriChange}
                  >
                    <option value="">Semua Kategori</option>
                    {kategoriList.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Kode Suku Cadang *</label>
                  <select
                    value={partForm.id_master_suku_cadang}
                    onChange={handlePartSelect}
                  >
                    <option value="">Pilih kode / nama barang</option>
                    {filteredParts.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={p.stok_sekarang <= 0}
                      >
                        {p.kode_suku_cadang} - {p.nama_suku_cadang}
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
              </div>

              <div
                className={styles.btnActionRight}
                style={{ marginTop: "16px" }}
              >
                <button
                  type="button"
                  className={styles.btnAddOutline}
                  onClick={addPart}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    borderRadius: "6px",
                    fontWeight: 600,
                    border: "none",
                    padding: "8px 24px",
                  }}
                >
                  Simpan
                </button>
              </div>

              {partList.length > 0 && (
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Kode Suku Cadang</th>
                        <th>Kategori</th>
                        <th>Stok</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                        <th style={{ width: "40px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {partList.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            {item.kode_suku_cadang} <br />
                            <small className={styles.textMuted}>
                              {item.nama_suku_cadang}
                            </small>
                          </td>
                          <td>{item.kategori}</td>
                          <td>{item.stok_tersedia}</td>
                          <td>{item.qty}</td>
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
                {jasaList.length > 0 && (
                  <div className={styles.receiptSection}>
                    <div className={styles.receiptTitle}>Daftar Jasa</div>
                    {jasaList.map((item, idx) => (
                      <div className={styles.receiptItem} key={`rj-${idx}`}>
                        <div className={styles.receiptItemName}>
                          {item.nama_jasa}
                        </div>
                        <div className={styles.receiptItemPrice}>
                          {formatIDR(item.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {partList.length > 0 && (
                  <div className={styles.receiptSection}>
                    <div className={styles.receiptTitle}>
                      Daftar Suku Cadang
                    </div>
                    {partList.map((item, idx) => (
                      <div className={styles.receiptItem} key={`rp-${idx}`}>
                        <div className={styles.receiptItemName}>
                          {item.qty}x {item.nama_suku_cadang}
                        </div>
                        <div className={styles.receiptItemPrice}>
                          {formatIDR(item.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(jasaList.length > 0 || partList.length > 0) && (
                  <hr className={styles.receiptDivider} />
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                    Subtotal (Jasa)
                  </span>
                  <span
                    style={{
                      color: "#1f2937",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                    }}
                  >
                    {formatIDR(subtotalJasa)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                    Subtotal (Parts)
                  </span>
                  <span
                    style={{
                      color: "#1f2937",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                    }}
                  >
                    {formatIDR(subtotalPart)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                    Total
                  </span>
                  <span
                    style={{
                      color: "#1f2937",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                    }}
                  >
                    {formatIDR(grandTotal)}
                  </span>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: "16px",
                    marginTop: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#1f2937" }}>
                    Total Pembayaran
                  </span>
                  <span
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {formatIDR(grandTotal)}
                  </span>
                </div>

                <div style={{ marginTop: "24px" }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      marginBottom: "8px",
                    }}
                  >
                    Payment Method
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Cash")}
                      style={{
                        flex: 1,
                        padding: "6px 12px",
                        textAlign: "center",
                        borderRadius: "6px",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor:
                          paymentMethod === "Cash" ? "#2563eb" : "#f3f4f6",
                        color: paymentMethod === "Cash" ? "#ffffff" : "#6b7280",
                      }}
                    >
                      Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Transfer")}
                      style={{
                        flex: 1,
                        padding: "6px 12px",
                        textAlign: "center",
                        borderRadius: "6px",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor:
                          paymentMethod === "Transfer" ? "#2563eb" : "#f3f4f6",
                        color:
                          paymentMethod === "Transfer" ? "#ffffff" : "#6b7280",
                      }}
                    >
                      Transfer
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: "24px" }}>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    style={{
                      width: "100%",
                      padding: "8px 16px",
                      backgroundColor: "#2563eb",
                      color: "white",
                      fontWeight: 500,
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                  >
                    SIMPAN & CETAK NOTA
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
