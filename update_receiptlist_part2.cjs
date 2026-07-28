const fs = require("fs");
let text = fs.readFileSync(
  "frontend/src/features/orders/ReceiptList.tsx",
  "utf8",
);

text = text.replace(
  /<div\s*className=\{styles\.toolbar\}\s*style=\{\{\s*margin:\s*"16px 20px 4px 20px"\s*\}\}\s*>/,
  '<div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">',
);
text = text.replace(
  /<div className=\{styles\.tableWrapper\}>/,
  '<div className="overflow-x-auto w-full">',
);
text = text.replace(
  /<td className="px-4 py-3 text-left">\s*<span style=\{\{ fontWeight: 700, color: "#047857" \}\}>\s*\{r\.jumlah_diterima\} Pcs Masuk\s*<\/span>/,
  '<td className="px-4 py-3 text-center">\n                      <span style={{ fontWeight: 700, color: "#047857" }}>\n                        {r.jumlah_diterima} Pcs Masuk\n                      </span>',
);
text = text.replace(
  /<td className="px-4 py-3 text-left">\s*\{r\.status_verifikasi === "menunggu" \? \(/,
  '<td className="px-4 py-3 text-center">\n                        {r.status_verifikasi === "menunggu" ? (',
);

fs.writeFileSync("frontend/src/features/orders/ReceiptList.tsx", text);
console.log("SUCCESS!");
