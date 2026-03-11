import React, { useState, useMemo } from "react";
import { Plus, CalendarCheck } from "lucide-react";
import { attendanceApi, employeeApi } from "../api";
import { useFetch } from "../hooks/useData";
import { useToast } from "../context/ToastContext";
import { Avatar, Badge, LoadingState, EmptyState, StatusBadge } from "../components/ui";
import MarkAttendanceModal from "../components/MarkAttendanceModal";

const today = () => new Date().toISOString().split("T")[0];

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric"
  });

export default function AttendancePage() {
  const toast = useToast();

  const [filters, setFilters] = useState({ employee_id: "", from: "", to: "" });
  const [showMark, setShowMark] = useState(false);

  // Memoize filters object to avoid unnecessary refetches
  const filterParams = useMemo(() => {
    const p = {};
    if (filters.employee_id) p.employee_id = filters.employee_id;
    if (filters.from)        p.from        = filters.from;
    if (filters.to)          p.to          = filters.to;
    return p;
  }, [filters]);

  const {
    data: records, loading, error, refetch
  } = useFetch(() => attendanceApi.getAll(filterParams), [JSON.stringify(filterParams)]);

  const {
    data: employees, loading: empLoading
  } = useFetch(employeeApi.getAll);

  const set = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const clearFilters = () => setFilters({ employee_id: "", from: "", to: "" });

  const hasFilters = filters.employee_id || filters.from || filters.to;

  const handleMarkSuccess = (_, message) => {
    toast(message, "success");
    setShowMark(false);
    refetch();
  };

  if (error) return <div style={{ color: "var(--red)", padding: 24 }}>Error: {error}</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Attendance Records</h2>
          <p>{(records || []).length} record{(records || []).length !== 1 ? "s" : ""} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowMark(true)}>
          <Plus size={15} />
          Mark Attendance
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="form-select"
          value={filters.employee_id}
          onChange={(e) => set("employee_id", e.target.value)}
          disabled={empLoading}
        >
          <option value="">All Employees</option>
          {(employees || []).map((e) => (
            <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>
          ))}
        </select>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>From</span>
          <input
            className="form-input"
            type="date"
            value={filters.from}
            onChange={(e) => set("from", e.target.value)}
            style={{ width: 160 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>To</span>
          <input
            className="form-input"
            type="date"
            value={filters.to}
            onChange={(e) => set("to", e.target.value)}
            style={{ width: 160 }}
          />
        </div>

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            Clear filters
          </button>
        )}

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => set("from", today()) & set("to", today())}
        >
          Today
        </button>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <LoadingState message="Loading attendance records..." />
        ) : (records || []).length === 0 ? (
          <EmptyState
            icon={<CalendarCheck size={28} />}
            title="No attendance records"
            description={hasFilters ? "No records match the current filters" : "Start by marking attendance for your employees"}
            action={
              !hasFilters ? (
                <button className="btn btn-primary btn-sm" onClick={() => setShowMark(true)}>
                  <Plus size={14} /> Mark Attendance
                </button>
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear filters</button>
              )
            }
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(records || []).map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="emp-cell">
                        <Avatar name={r.full_name} />
                        <div>
                          <div className="emp-name">{r.full_name}</div>
                          <div className="emp-code">{r.emp_code}</div>
                        </div>
                      </div>
                    </td>
                    <td><Badge variant="blue">{r.department}</Badge></td>
                    <td style={{ color: "var(--muted)", fontSize: 13 }}>{fmtDate(r.date)}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showMark && (
        <MarkAttendanceModal
          employees={employees || []}
          onClose={() => setShowMark(false)}
          onSuccess={handleMarkSuccess}
        />
      )}
    </div>
  );
}
