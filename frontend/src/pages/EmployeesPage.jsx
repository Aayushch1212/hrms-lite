import React, { useState, useMemo } from "react";
import { UserPlus, Trash2, Search, Users } from "lucide-react";
import { employeeApi } from "../api";
import { useFetch, useAction } from "../hooks/useData";
import { useToast } from "../context/ToastContext";
import { Avatar, Badge, LoadingState, EmptyState } from "../components/ui";
import AddEmployeeModal from "../components/AddEmployeeModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function EmployeesPage() {
  const toast = useToast();
  const { data: employees, loading, error, refetch } = useFetch(employeeApi.getAll);
  const { execute: del, loading: deleting } = useAction(employeeApi.remove);

  const [search,      setSearch]      = useState("");
  const [deptFilter,  setDeptFilter]  = useState("");
  const [showAdd,     setShowAdd]     = useState(false);
  const [deleteTarget,setDeleteTarget]= useState(null);

  const allEmployees = employees || [];

  const departments = useMemo(() => {
    const set = new Set(allEmployees.map((e) => e.department));
    return [...set].sort();
  }, [allEmployees]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allEmployees.filter((e) => {
      const matchSearch = !q ||
        e.full_name.toLowerCase().includes(q) ||
        e.employee_id.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q);
      const matchDept = !deptFilter || e.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [allEmployees, search, deptFilter]);

  const handleDelete = async () => {
    const res = await del(deleteTarget.id);
    if (res.ok) {
      toast(res.data.message, "success");
      setDeleteTarget(null);
      refetch();
    } else {
      toast(res.error, "error");
    }
  };

  const handleAddSuccess = (_, message) => {
    toast(message, "success");
    setShowAdd(false);
    refetch();
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (loading) return <LoadingState message="Loading employees..." />;
  if (error)   return <div style={{ color: "var(--red)", padding: 24 }}>Error: {error}</div>;

  return (
    <div className="fade-in">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>All Employees</h2>
          <p>{allEmployees.length} employee{allEmployees.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <UserPlus size={15} />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--muted2)" }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32, width: 240 }}
            placeholder="Search by name, ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        {(search || deptFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setDeptFilter(""); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title={search || deptFilter ? "No results found" : "No employees yet"}
            description={search || deptFilter
              ? "Try adjusting your search or filter"
              : "Add your first employee to get started"
            }
            action={
              !search && !deptFilter && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
                  <UserPlus size={14} /> Add Employee
                </button>
              )
            }
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Present Days</th>
                  <th>Joined</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="emp-cell">
                        <Avatar name={emp.full_name} />
                        <div>
                          <div className="emp-name">{emp.full_name}</div>
                          <div className="emp-code">{emp.employee_id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: 13 }}>{emp.email}</td>
                    <td><Badge variant="blue">{emp.department}</Badge></td>
                    <td>
                      <span className="badge badge-green">
                        ✓ {emp.present_days} day{emp.present_days !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: 13 }}>{fmtDate(emp.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-icon btn-danger btn-sm"
                        title="Delete employee"
                        onClick={() => setDeleteTarget(emp)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <AddEmployeeModal
          onClose={() => setShowAdd(false)}
          onSuccess={handleAddSuccess}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          employee={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  );
}
