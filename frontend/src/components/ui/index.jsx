import React from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";

// ── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 18 }) {
  return <div className="spinner" style={{ width: size, height: size }} />;
}

// ── Loading State ────────────────────────────────────────────────────────────
export function LoadingState({ message = "Loading..." }) {
  return (
    <div className="loading-state">
      <Spinner size={20} />
      <span>{message}</span>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-desc">{description}</div>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}

// ── Alert ────────────────────────────────────────────────────────────────────
export function Alert({ type = "error", message, onClose }) {
  if (!message) return null;
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div className={`alert alert-${type}`}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Icon size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          <X size={13} />
        </button>
      )}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, subtitle, onClose, children, maxWidth = 500 }) {
  // Close on backdrop click
  const onBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div className="modal-backdrop" onClick={onBackdrop}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle && <div className="modal-desc">{subtitle}</div>}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={15} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = "gray" }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// ── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name }) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
  return <div className="avatar">{initials}</div>;
}

// ── Status Badge for attendance ──────────────────────────────────────────────
export function StatusBadge({ status }) {
  if (status === "Present") return <Badge variant="green">● Present</Badge>;
  if (status === "Absent")  return <Badge variant="red">● Absent</Badge>;
  return null;
}
