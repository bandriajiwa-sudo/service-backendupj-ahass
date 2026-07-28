const fs = require("fs");
let text = fs.readFileSync(
  "frontend/src/features/orders/ReceiptList.tsx",
  "utf8",
);

text = text.replace(
  /<div className=\{styles\.filterBar\}>/g,
  '<div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">',
);
text = text.replace(
  /<div className=\{styles\.tableContainer\}>/g,
  '<div className="overflow-x-auto w-full">',
);
text = text.replace(
  /<thead>\s*<tr>/s,
  '<thead className="bg-gray-50 border-y border-gray-200 text-gray-700 text-sm font-semibold">\n            <tr>',
);

// Replacing specific <th ...>
text = text.replace(
  /<th style=\{\{ minWidth: "120px" \}\}>/g,
  '<th className="whitespace-nowrap px-4 py-3 text-left">',
);
text = text.replace(
  /<th>/g,
  '<th className="whitespace-nowrap px-4 py-3 text-left">',
);
text = text.replace(
  /<th className="whitespace-nowrap px-4 py-3 text-left">Qty Diterima \/ Diorder<\/th>/g,
  '<th className="whitespace-nowrap px-4 py-3 text-center">Qty Diterima / Diorder</th>',
);
text = text.replace(
  /<th className="whitespace-nowrap px-4 py-3 text-left">Aksi Verifikasi<\/th>/g,
  '<th className="whitespace-nowrap px-4 py-3 text-center">Aksi Verifikasi</th>',
);

text = text.replace(
  /<tr key=\{item\.id\}>/g,
  '<tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">',
);
text = text.replace(/<td>/g, '<td className="px-4 py-3 text-left">');
text = text.replace(
  /<td className="px-4 py-3 text-left">\s*\{item\.jumlah_diterima\}\s*\/\s*\{item\.spare_part_order\?.jumlah\}\s*<\/td>/g,
  '<td className="px-4 py-3 text-center">\n                      {item.jumlah_diterima} / {item.spare_part_order?.jumlah}\n                    </td>',
);
text = text.replace(
  /<td className="px-4 py-3 text-left">\s*\{item\.status_verifikasi === "menunggu" && user\?\.role === "kepala_upj" \? \(/g,
  '<td className="px-4 py-3 text-center">\n                      {item.status_verifikasi === "menunggu" && user?.role === "kepala_upj" ? (',
);

fs.writeFileSync("frontend/src/features/orders/ReceiptList.tsx", text);
console.log("SUCCESS!");
