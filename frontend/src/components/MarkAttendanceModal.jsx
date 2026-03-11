import React, { useState } from "react";
import { Check } from "lucide-react";
import { Modal, Alert, Spinner } from "./ui";
import { attendanceApi } from "../api";
import { useAction } from "../hooks/useData";

const today = () => new Date().toISOString().split("T")[0];

export default function MarkAttendanceModal({ employees, onClose, onSuccess }) {
  const [form, setForm]       = useState({ employee_id: "", date: today(), status: "Present" });
  const [fieldErr, setFieldErr] = useState({});
  const { execute, loading, error, setError } = useAction(attendanceApi.mark);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (fieldErr[key]) setFieldErr((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.employee_id) errs.employee_id = "Please select an employee";
    if (!form.date)        errs.date        = "Date is required";
    if (!form.status)      errs.status      = "Status is required";
    setFieldErr(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    const res = await execute(form);
    if (res.ok) onSuccess(res.data.data, res.data.message);
  };

  return (
    <Modal
      title="Mark Attendance"
      subtitle="Select an employee and mark their attendance status"
      onClose={onClose}
    >
      {error && <Alert message={error} onClose={() => setError(null)} />}

      <div className="form-grid">
        {/* Employee select */}
        <div className="form-group form-full">
          <label className="form-label">Employee <span className="required">*</span></label>
          <select
            className={`form-select${fieldErr.employee_id ? " error" : ""}`}
            value={form.employee_id}
            onChange={(e) => set("employee_id", e.target.value)}
          >
            <option value="">— Select employee —</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name} ({e.employee_id}) — {e.department}
              </option>
            ))}
          </select>
          {fieldErr.employee_id && <span className="form-error">{fieldErr.employee_id}</span>}
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">Date <span className="required">*</span></label>
          <input
            className={`form-input${fieldErr.date ? " error" : ""}`}
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
          {fieldErr.date && <span className="form-error">{fieldErr.date}</span>}
        </div>

        {/* Status */}
        <div className="form-group">
          <label className="form-label">Status <span className="required">*</span></label>
          <select
            className={`form-select${fieldErr.status ? " error" : ""}`}
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
          {fieldErr.status && <span className="form-error">{fieldErr.status}</span>}
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? <Spinner size={14} /> : <Check size={14} />}
            {loading ? "Saving..." : "Mark Attendance"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
