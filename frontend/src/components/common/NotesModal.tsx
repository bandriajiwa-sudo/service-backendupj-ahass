import React from "react";
import { MessageSquare, X } from "lucide-react";

interface NotesModalProps {
  orderId: number;
  catatanFo: string | null;
  catatanKoperasi: string | null;
  onClose: () => void;
}

const NotesModal: React.FC<NotesModalProps> = ({
  orderId,
  catatanFo,
  catatanKoperasi,
  onClose,
}) => {
  const hasNotes = !!catatanFo || !!catatanKoperasi;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,44,74,0.4)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          width: "100%",
          maxWidth: "440px",
          maxHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MessageSquare size={20} color="#3b82f6" />
            <h3
              style={{
                margin: 0,
                fontSize: "1rem",
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              Catatan Order #{orderId}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
            }}
            title="Tutup"
          >
            <X size={20} color="#94a3b8" />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {!hasNotes && (
            <div
              style={{
                textAlign: "center",
                padding: "32px 16px",
                color: "#94a3b8",
                fontSize: "0.875rem",
              }}
            >
              Belum ada catatan pada order ini.
            </div>
          )}

          {catatanFo && (
            <div
              style={{
                backgroundColor: "#eff6ff",
                padding: "12px 16px",
                borderRadius: "10px",
                border: "1px solid #bfdbfe",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#2563eb",
                  display: "block",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Front Office
              </span>
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#1e293b",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {catatanFo}
              </span>
            </div>
          )}

          {catatanKoperasi && (
            <div
              style={{
                backgroundColor: "#faf5ff",
                padding: "12px 16px",
                borderRadius: "10px",
                border: "1px solid #e9d5ff",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#7c3aed",
                  display: "block",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Koperasi
              </span>
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#1e293b",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {catatanKoperasi}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Compact badge button for table cell
export const NotesBadge: React.FC<{
  catatanFo: string | null;
  catatanKoperasi: string | null;
  onClick: () => void;
}> = ({ catatanFo, catatanKoperasi, onClick }) => {
  const count = (catatanFo ? 1 : 0) + (catatanKoperasi ? 1 : 0);

  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "8px",
        border: count > 0 ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
        background: count > 0 ? "#eff6ff" : "#f8fafc",
        cursor: "pointer",
        transition: "all 0.2s",
        fontSize: "0.8rem",
        fontWeight: 600,
        color: count > 0 ? "#2563eb" : "#94a3b8",
        whiteSpace: "nowrap",
      }}
      title="Lihat Catatan"
    >
      <MessageSquare size={14} />
      {count > 0 ? (
        <>
          <span>{count}</span>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#3b82f6",
              display: "inline-block",
            }}
          />
        </>
      ) : (
        <span>—</span>
      )}
    </button>
  );
};

export default NotesModal;
