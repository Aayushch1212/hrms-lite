import React, { useState } from "react";
import { UserPlus, Check } from "lucide-react";
import { Modal, Alert, Spinner } from "./ui";
import { employeeApi } from "../api";
import { useAction } from "../hooks/useData";

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing",
  "Sales", "Operations", "Finance", "HR", "Legal", "Support",
];

const INITIAL = { employee_id: "", full_name: "", email: "", department: "" };

export default function AddEmployeeModal({ onClose, onSuccess }) {
  const [form, setForm]     = useState(INITIAL);
  const [fieldErr, setFieldErr] = useState({});
  const { execute, loading, error, setError } = useAction(employeeApi.create);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (fieldErr[key]) setFieldErr((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.employee_id.trim()) errs.employee_id = "Required";
    if (!form.full_name.trim())   errs.full_name   = "Required";
    if (!form.email.trim())       errs.email       = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.department)         errs.department  = "Required";
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
      title="Add New Employee"
      subtitle="Fill in the details below to create an employee record"
      onClose={onClose}
    >
      {error && <Alert message={error} onClose={() => setError(null)} />}

      <div className="form-grid">
        {/* Employee ID */}
        <div className="form-group">
          <label className="form-label">Employee ID <span className="required">*</span></label>
          <input
            className={`form-input${fieldErr.employee_id ? " error" : ""}`}
            placeholder="e.g. EMP001"
            value={form.employee_id}
            onChange={(e) => set("employee_id", e.target.value)}
          />
          {fieldErr.employee_id && <span className="form-error">{fieldErr.employee_id}</span>}
        </div>

        {/* Department */}
        <div className="form-group">
          <label className="form-label">Department <span className="required">*</span></label>
          <select
            className={`form-select${fieldErr.department ? " error" : ""}`}
            value={form.department}
            onChange={(e) => set("department", e.target.value)}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {fieldErr.department && <span className="form-error">{fieldErr.department}</span>}
        </div>

        {/* Full Name */}
        <div className="form-group form-full">
          <label className="form-label">Full Name <span className="required">*</span></label>
          <input
            className={`form-input${fieldErr.full_name ? " error" : ""}`}
            placeholder="e.g. Jane Smith"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
          />
          {fieldErr.full_name && <span className="form-error">{fieldErr.full_name}</span>}
        </div>

        {/* Email */}
        <div className="form-group form-full">
          <label className="form-label">Email Address <span className="required">*</span></label>
          <input
            className={`form-input${fieldErr.email ? " error" : ""}`}
            type="email"
            placeholder="e.g. jane@company.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          {fieldErr.email && <span className="form-error">{fieldErr.email}</span>}
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? <Spinner size={14} /> : <Check size={14} />}
            {loading ? "Creating..." : "Add Employee"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
