import React from "react";

const PrintFooter: React.FC = () => {
  const formattedDate = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="hidden print:flex justify-end w-full mt-12 pt-8 break-inside-avoid">
      <div style={{ width: "220px", textAlign: "center" }}>
        <p className="mb-1 text-black font-medium text-sm">
          Yogyakarta, {formattedDate}
        </p>
        <p
          className="text-black font-medium text-sm"
          style={{ marginBottom: "80px" }}
        >
          Kepala UPJ Otomotif,
        </p>
        <div
          style={{
            borderBottom: "1.5px solid black",
            width: "100%",
            marginBottom: "6px",
          }}
        ></div>
        <p className="text-black text-left text-sm whitespace-pre">NIP.</p>
      </div>
    </div>
  );
};

export default PrintFooter;
