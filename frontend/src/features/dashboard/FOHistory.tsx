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
          <h1 className={styles.pageTitle}>Daftar Transaksi</h1>
          <p className={styles.pageSubtitle}>
            Riwayat transaksi jasa dan penjualan suku cadang
          </p>
        </div>
      </div>

      {/* Unified Table Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-5 flex flex-wrap gap-4 items-end border-b border-gray-200">
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

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-left">
                  NO. NOTA
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-left">
                  TANGGAL
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-left">
                  PETUGAS
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-left">
                  MEKANIK
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-center">
                  PAYMENT
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-left">
                  JENIS JASA
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-right">
                  TOTAL
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-center">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-gray-500">
                    Memuat data riwayat transaksi...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-10 text-gray-500">
                    <div className="text-lg font-semibold text-gray-600 mb-2">
                      Pencarian Kosong
                    </div>
                    <div className="text-sm">
                      Tidak ada transaksi yang ditemukan.
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const totalJasaParams = t.transaction_services || [];
                  const totalPartsParams = t.transaction_spare_parts || [];

                  const servicesCost = totalJasaParams.reduce(
                    (acc: number, cur: any) =>
                      acc + Number(cur.biaya_jasa || 0),
                    0,
                  );
                  const partsCost = totalPartsParams.reduce(
                    (acc: number, cur: any) =>
                      acc + Number(cur.total_harga || 0),
                    0,
                  );
                  const totalCalculated = servicesCost + partsCost;

                  const mechanicsList = totalJasaParams
                    .map((s: any) => s.mechanic?.nama_mekanik)
                    .filter(Boolean);
                  const uniqueMechanics =
                    Array.from(new Set(mechanicsList)).join(", ") || "-";

                  const jenisJasaList = totalJasaParams
                    .map((s: any) => s.nama_jasa)
                    .filter(Boolean);
                  const uniqueJenisJasa =
                    Array.from(new Set(jenisJasaList)).join(", ") || "-";

                  const txDate = new Date(t.tanggal);
                  const formattedDate = `${txDate.getDate().toString().padStart(2, "0")}/${(txDate.getMonth() + 1).toString().padStart(2, "0")}/${txDate.getFullYear()} ${txDate.getHours().toString().padStart(2, "0")}:${txDate.getMinutes().toString().padStart(2, "0")}`;

                  return (
                    <tr
                      key={t.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="text-sm text-gray-800 px-4 py-3 text-left font-semibold">
                        {t.no_nota || "-"}
                      </td>
                      <td className="text-sm text-gray-800 px-4 py-3 text-left">
                        {formattedDate}
                      </td>
                      <td className="text-sm text-gray-800 px-4 py-3 text-left font-medium">
                        {t.user?.nama_user || "-"}
                      </td>
                      <td className="text-sm text-gray-800 px-4 py-3 text-left">
                        {uniqueMechanics}
                      </td>
                      <td className="text-sm text-gray-800 px-4 py-3 text-center">
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold">
                          Cash
                        </span>
                      </td>
                      <td className="text-sm text-gray-800 px-4 py-3 text-left">
                        <span className="text-gray-700 font-medium whitespace-pre-wrap">
                          {uniqueJenisJasa}
                        </span>
                      </td>
                      <td className="text-sm text-gray-800 px-4 py-3 text-right font-semibold">
                        {formatRupiah(totalCalculated)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() =>
                              window.open(
                                `/api/v1/transactions/${t.id}/print`,
                                "_blank",
                              )
                            }
                            className="px-3 py-1 rounded text-sm font-medium transition-colors shadow-sm"
                            style={{
                              backgroundColor: "#38bdf8",
                              color: "#ffffff",
                              border: "none",
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
    </div>
  );
};

export default FOHistory;
