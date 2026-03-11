import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, UserX, ClipboardList, Building2, ArrowRight } from "lucide-react";
import { dashboardApi } from "../api";
import { useFetch } from "../hooks/useData";
import { LoadingState, EmptyState, Badge, StatusBadge } from "../components/ui";

function StatCard({ label, value, icon: Icon, variant, sub }) {
  return (
    <div className="stat-card">
      <div className={`stat-card-accent ${variant}`} />
      <div className={`stat-icon ${variant}`}>
        <Icon size={18} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted2)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(dashboardApi.get);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error)   return (
    <div className="card card-body" style={{ color: "var(--red)" }}>
      Failed to load dashboard: {error}
    </div>
  );

  const rate = data.totalEmployees > 0
    ? Math.round((data.presentToday / data.totalEmployees) * 100)
    : 0;

  return (
    <div className="fade-in">
      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total Employees"  value={data.totalEmployees} icon={Users}        variant="teal"  sub="All registered" />
        <StatCard label="Present Today"    value={data.presentToday}   icon={UserCheck}    variant="green" sub={data.today} />
        <StatCard label="Absent Today"     value={data.absentToday}    icon={UserX}        variant="red"   sub="Marked absent" />
        <StatCard label="Total Records"    value={data.totalRecords}   icon={ClipboardList} variant="amber" sub="All entries" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Attendance Rate */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Today's Attendance</div>
              <div className="card-subtitle">{data.today}</div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/attendance")}
              style={{ gap: 4 }}
            >
              View <ArrowRight size={13} />
            </button>
          </div>
          <div className="card-body">
            {data.totalEmployees === 0 ? (
              <EmptyState
                icon={<Users size={26} />}
                title="No employees yet"
                description="Add employees to start tracking attendance"
                action={
                  <button className="btn btn-primary btn-sm" onClick={() => navigate("/employees")}>
                    Add Employees
                  </button>
                }
              />
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
                  <span style={{ fontSize: 48, fontWeight: 800, color: "var(--accent)", letterSpacing: "-2px", lineHeight: 1 }}>
                    {rate}<span style={{ fontSize: 22, fontWeight: 600 }}>%</span>
                  </span>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>
                    {data.presentToday} of {data.totalEmployees} employees
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${rate}%` }} />
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
                    <span style={{ color: "var(--muted)" }}>Present: <strong>{data.presentToday}</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)" }} />
                    <span style={{ color: "var(--muted)" }}>Absent: <strong>{data.absentToday}</strong></span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Departments */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Departments</div>
              <div className="card-subtitle">{data.departments.length} active departments</div>
            </div>
            <Building2 size={18} color="var(--muted2)" />
          </div>
          <div className="card-body">
            {data.departments.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 13 }}>No departments yet.</p>
            ) : (
              <div className="dept-pills">
                {data.departments.map((d) => (
                  <div key={d.department} className="dept-pill">
                    <Building2 size={13} color="var(--muted)" />
                    <span style={{ fontSize: 13 }}>{d.department}</span>
                    <span className="dept-count">{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      {data.recentAttendance.length > 0 && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Recent Attendance</div>
              <div className="card-subtitle">Last 10 entries</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/attendance")} style={{ gap: 4 }}>
              All records <ArrowRight size={13} />
            </button>
          </div>
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
                {data.recentAttendance.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.full_name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>{r.emp_code}</div>
                    </td>
                    <td><Badge variant="blue">{r.department}</Badge></td>
                    <td style={{ color: "var(--muted)", fontSize: 13 }}>
                      {new Date(r.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
