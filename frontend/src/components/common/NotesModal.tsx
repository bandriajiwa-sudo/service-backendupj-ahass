import React, { useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { apiClient } from "../../lib/api";
import Swal from "sweetalert2";

interface NotesModalProps {
  orderId: number;
  catatanFo: string | null;
  catatanKoperasi: string | null;
  userRole: string;
  onClose: () => void;
  onNoteSaved: () => void;
}

const NotesModal: React.FC<NotesModalProps> = ({
  orderId,
  catatanFo,
  catatanKoperasi,
  userRole,
  onClose,
  onNoteSaved,
}) => {
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSending(true);
    try {
      if (userRole === "front_office") {
        await apiClient.put(`/spare-part-orders/${orderId}`, {
          catatan: replyText.trim(),
        });
      } else if (userRole === "koperasi") {
        await apiClient.patch(`/spare-part-orders/${orderId}/decision`, {
          catatan: replyText.trim(),
        });
      }
      Swal.fire({
        icon: "success",
        title: "Catatan Disimpan",
        timer: 1200,
        showConfirmButton: false,
      });
      setReplyText("");
      onNoteSaved();
      onClose();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Gagal menyimpan catatan.",
      });
    } finally {
      setIsSending(false);
    }
  };

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
          maxWidth: "480px",
          maxHeight: "80vh",
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

        {/* Conversation Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            background: "#fafbfc",
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
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "12px 12px 12px 4px",
                  padding: "10px 14px",
                  maxWidth: "85%",
                }}
              >
                <div
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "#2563eb",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Front Office
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#1e293b",
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                  }}
                >
                  {catatanFo}
                </div>
              </div>
            </div>
          )}

          {catatanKoperasi && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  background: "#faf5ff",
                  border: "1px solid #e9d5ff",
                  borderRadius: "12px 12px 4px 12px",
                  padding: "10px 14px",
                  maxWidth: "85%",
                }}
              >
                <div
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "#7c3aed",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    textAlign: "right",
                  }}
                >
                  Koperasi
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#1e293b",
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                  }}
                >
                  {catatanKoperasi}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reply Input */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #e2e8f0",
            background: "#fff",
            display: "flex",
            gap: "8px",
            alignItems: "flex-end",
          }}
        >
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={
              userRole === "front_office"
                ? "Tulis catatan FO..."
                : "Tulis balasan Koperasi..."
            }
            rows={2}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              fontSize: "0.85rem",
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendReply();
              }
            }}
          />
          <button
            onClick={handleSendReply}
            disabled={isSending || !replyText.trim()}
            style={{
              background:
                isSending || !replyText.trim() ? "#94a3b8" : "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 14px",
              cursor:
                isSending || !replyText.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600,
              fontSize: "0.8rem",
              transition: "background 0.2s",
              whiteSpace: "nowrap",
            }}
            title="Kirim Catatan"
          >
            <Send size={16} />
          </button>
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
