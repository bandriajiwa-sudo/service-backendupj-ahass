import React, { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import styles from "../transactions/TransactionList.module.css";

const FOHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Date Filtering State
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const res = await apiClient.get(`/transactions?${params.toString()}`);
      setTransactions(res.data.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (number: number) => {
    if (isNaN(number)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  const setQuickFilter = (type: "today" | "this_month") => {
    const today = new Date();
    const isoToday = today.toISOString().split("T")[0];
    if (type === "today") {
      setStartDate(isoToday);
      setEndDate(isoToday);
    } else if (type === "this_month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      setStartDate(firstDay);
      setEndDate(isoToday);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Daftar Transaksi</h1>
          <p className={styles.subtitle}>
            Riwayat transaksi jasa dan penjualan suku cadang
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "flex-end",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}
          >
            Dari Tanggal
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              outline: "none",
              color: "#334155",
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}
          >
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              outline: "none",
              color: "#334155",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", paddingBottom: "2px" }}>
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f1f5f9",
              color: "#475569",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.9rem",
            }}
          >
            Reset
          </button>
          <button
            onClick={() => setQuickFilter("today")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#e0f2fe",
              color: "#0284c7",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.9rem",
            }}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setQuickFilter("this_month")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#e0f2fe",
              color: "#0284c7",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.9rem",
            }}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      <div
        style={{
          overflowX: "auto",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "1000px",
          }}
        >
          <thead
            style={{
              backgroundColor: "#f9fafb",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <tr>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                NO. NOTA
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                TANGGAL
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                PETUGAS
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                MEKANIK
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                METODE BAYAR
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                TOTAL JASA
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                TOTAL SUKU CADANG
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "right",
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                TOTAL BIAYA
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                AKSI
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                  }}
                >
                  Memuat data riwayat transaksi...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#64748b",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      color: "#475569",
                      marginBottom: "8px",
                    }}
                  >
                    Pencarian Kosong
                  </div>
                  <div style={{ fontSize: "0.9rem" }}>
                    Tidak ada transaksi yang ditemukan.
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((t) => {
                const totalJasaParams = t.transaction_services || [];
                const totalPartsParams = t.transaction_spare_parts || [];

                const servicesCost = totalJasaParams.reduce(
                  (acc: number, cur: any) => acc + Number(cur.biaya_jasa || 0),
                  0,
                );
                const partsCost = totalPartsParams.reduce(
                  (acc: number, cur: any) => acc + Number(cur.total_harga || 0),
                  0,
                );
                const totalCalculated = servicesCost + partsCost;

                const mechanicsList = totalJasaParams
                  .map((s: any) => s.mechanic?.nama_mekanik)
                  .filter(Boolean);
                const uniqueMechanics =
                  Array.from(new Set(mechanicsList)).join(", ") || "-";

                const txDate = new Date(t.tanggal);
                const formattedDate = `${txDate.getDate().toString().padStart(2, "0")}/${(txDate.getMonth() + 1).toString().padStart(2, "0")}/${txDate.getFullYear()} ${txDate.getHours().toString().padStart(2, "0")}:${txDate.getMinutes().toString().padStart(2, "0")}`;

                return (
                  <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td
                      style={{
                        padding: "16px",
                        fontWeight: 600,
                        color: "#1e293b",
                        fontSize: "0.9rem",
                      }}
                    >
                      {t.no_nota || "-"}
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        color: "#475569",
                        fontSize: "0.9rem",
                      }}
                    >
                      {formattedDate}
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        color: "#334155",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                      }}
                    >
                      {t.user?.nama_user || "-"}
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        color: "#475569",
                        fontSize: "0.9rem",
                      }}
                    >
                      {uniqueMechanics}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          backgroundColor: "#e0e7ff",
                          color: "#4f46e5",
                          borderRadius: "100px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        Cash
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        color: "#475569",
                        fontSize: "0.9rem",
                      }}
                    >
                      {totalJasaParams.length}
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        color: "#475569",
                        fontSize: "0.9rem",
                      }}
                    >
                      {totalPartsParams.length}
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        fontWeight: 600,
                        color: "#1e293b",
                        textAlign: "right",
                        fontSize: "0.95rem",
                      }}
                    >
                      {formatRupiah(totalCalculated)}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() =>
                            window.open(
                              `/api/v1/transactions/${t.id}/print`,
                              "_blank",
                            )
                          }
                          style={{
                            padding: "6px 12px",
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#ffffff",
                            color: "#475569",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          Cetak Nota
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FOHistory;
