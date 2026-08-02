import React, { useState, useEffect } from "react";
import { Search, Printer } from "lucide-react";
import { apiClient } from "../../lib/api";
import styles from "../transactions/TransactionList.module.css";
import PrintHeader from "../../components/common/PrintHeader";
import PrintFooter from "../../components/common/PrintFooter";

const LaporanSukuCadang: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Date Filtering State
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const res = await apiClient.get(
        `/reports/spare-parts-sales?${params.toString()}`,
      );
      setData(res.data.data);
    } catch (err) {
      console.error("Gagal mengambil laporan suku cadang", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getFormatPeriod = () => {
    if (!startDate && !endDate) return "Semua Periode";
    const start = startDate
      ? new Date(startDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "...";
    const end = endDate
      ? new Date(endDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "...";
    return `Periode: ${start} s/d ${end}`;
  };

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.spare_part?.nama_suku_cadang
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.transaction?.no_nota
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  return (
    <div className={`${styles.container} print:p-0 print:m-0`}>
      <PrintHeader
        title="Laporan Pengadaan Suku Cadang"
        subtitle="Unit Produksi dan Jasa (UPJ) Otomotif & AHASS"
        periodLabel={startDate || endDate ? getFormatPeriod() : ""}
      />

      <div className={`${styles.pageHeader} print:hidden`}>
        <div>
          <h1 className={styles.pageTitle}>Laporan Penjualan Suku Cadang</h1>
          <p className={styles.pageSubtitle}>
            Rekap penjualan material gudang koperasi per periode
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 print:shadow-none print:border-none">
        {/* Toolbar section hides on print */}
        <div className="p-5 flex flex-wrap gap-4 items-end justify-between border-b border-gray-200 print:hidden">
          <div className="flex flex-wrap gap-4 items-start flex-1 min-w-[200px]">
            <div className="relative w-full max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari nota atau suku cadang..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white w-full text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors h-[38px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Mulai
              </span>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors h-[38px] w-40"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Sampai
              </span>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors h-[38px] w-40"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <button
              className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-md px-4 h-[38px] flex items-center justify-center transition-colors shadow-sm min-w-[120px]"
              onClick={handlePrint}
            >
              <Printer size={16} className="mr-2" />
              Cetak PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full print:overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 print:bg-gray-100 print:border-b-2 print:border-black">
              <tr>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-left">
                  Tanggal
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-left">
                  No. Nota
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-left">
                  Nama Suku Cadang
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-center">
                  Qty
                </th>
                <th className="whitespace-nowrap text-gray-700 text-sm font-semibold px-4 py-3 text-right">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-gray-500">
                    Memuat data laporan...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-gray-500">
                    Tidak ada penjualan suku cadang yang ditemukan pada periode
                    ini.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors print:border-b"
                  >
                    <td className="text-sm text-gray-800 px-4 py-3 text-left">
                      {new Date(item.transaction?.tanggal).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </td>
                    <td className="text-sm text-gray-800 px-4 py-3 text-left font-medium">
                      {item.transaction?.no_nota || "-"}
                    </td>
                    <td className="text-sm text-gray-800 px-4 py-3 text-left">
                      {item.spare_part?.nama_suku_cadang || "-"}
                    </td>
                    <td className="text-sm text-gray-800 px-4 py-3 text-center">
                      {item.jumlah}
                    </td>
                    <td className="text-sm font-medium text-gray-900 px-4 py-3 text-right">
                      {formatCurrency(item.total_harga)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Table Footer containing Total inside print only or standard display */}
            {filteredData.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td
                    colSpan={3}
                    className="text-right text-sm font-bold text-gray-700 px-4 py-3"
                  >
                    Total Transaksi Suku Cadang:
                  </td>
                  <td className="text-center text-sm font-bold text-gray-900 px-4 py-3">
                    {filteredData.reduce(
                      (sum, item) => sum + (Number(item.jumlah) || 0),
                      0,
                    )}{" "}
                    Pcs
                  </td>
                  <td className="text-right text-sm font-bold text-gray-900 px-4 py-3">
                    {formatCurrency(
                      filteredData.reduce(
                        (sum, item) => sum + (Number(item.total_harga) || 0),
                        0,
                      ),
                    )}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <PrintFooter />
    </div>
  );
};

export default LaporanSukuCadang;
