import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Modal, Spinner } from "./ui";

export default function DeleteConfirmModal({ employee, onClose, onConfirm, loading }) {
  return (
    <Modal title="Delete Employee" onClose={onClose} maxWidth={420}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "var(--red-lt)", display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <AlertTriangle size={20} color="var(--red)" />
        </div>
        <div>
          <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>
            You are about to permanently delete{" "}
            <strong style={{ color: "var(--text)" }}>{employee.full_name}</strong>{" "}
            ({employee.employee_id}). All their attendance records will also be removed.
          </p>
          <p style={{ fontSize: 13, color: "var(--red)", marginTop: 8, fontWeight: 500 }}>
            This action cannot be undone.
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size={14} /> : <Trash2 size={14} />}
          {loading ? "Deleting..." : "Delete Employee"}
        </button>
      </div>
    </Modal>
  );
}
