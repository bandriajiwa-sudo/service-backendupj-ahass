import sys

fileName = r'D:\Inventory-Service-Imformation-System\frontend\src\features\orders\ShipmentList.tsx'
with open(fileName, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add import
text = text.replace('import styles from "./ShipmentList.module.css";', 'import styles from "./ShipmentList.module.css";\nimport DeliveryNoteModal from "../../components/common/DeliveryNoteModal";\nimport { FileText } from "lucide-react";')

# 2. Add state
text = text.replace('  const [viewDetailReturn, setViewDetailReturn] = useState<any | null>(null);', '  const [viewDetailReturn, setViewDetailReturn] = useState<any | null>(null);\n  const [viewDetailOrder, setViewDetailOrder] = useState<any | null>(null);')

# 3. Add button next to Proses Penerimaan
btn_target = '''                        {group.statusFisik === "Tahap Verifikasi"
                          ? "Proses Penerimaan"
                          : "Selesai"}
                      </button>
                    </td>'''
btn_replace = '''                        {group.statusFisik === "Tahap Verifikasi"
                          ? "Proses Penerimaan"
                          : "Selesai"}
                      </button>
                      <button
                        onClick={() => setViewDetailOrder(group)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm font-semibold transition-colors bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 ml-2"
                      >
                        <FileText className="w-4 h-4" /> Lihat Detail
                      </button>
                    </td>'''
text = text.replace(btn_target, btn_replace)

# 4. Add modal at the end
modal_target = '    </div>\n  );\n}'
modal_replace = '''
      {/* View Detail Modal (Card + A4) */}
      {viewDetailOrder && (
        <DeliveryNoteModal
          group={viewDetailOrder}
          onClose={() => setViewDetailOrder(null)}
        />
      )}
    </div>
  );
}'''
text = text.replace(modal_target, modal_replace)

with open(fileName, 'w', encoding='utf-8') as f:
    f.write(text)

print('FO UI patched successfully')
