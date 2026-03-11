import React from "react";
import { BarChart3 } from "lucide-react";
import { attendanceApi } from "../api";
import { useFetch } from "../hooks/useData";
import { Avatar, Badge, LoadingState, EmptyState } from "../components/ui";

export default function SummaryPage() {
  const { data: summary, loading, error } = useFetch(attendanceApi.getSummary);

  if (loading) return <LoadingState message="Loading summary..." />;
  if (error)   return <div style={{ color: "var(--red)", padding: 24 }}>Error: {error}</div>;

  const rows = summary || [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Attendance Summary</h2>
          <p>Per-employee attendance stats across all time</p>
        </div>
      </div>

      <div className="card">
        {rows.length === 0 ? (
          <EmptyState
            icon={<BarChart3 size={28} />}
            title="No data yet"
            description="Add employees and mark attendance to see the summary"
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Present Days</th>
                  <th>Absent Days</th>
                  <th>Total Marked</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
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
                    <td>
                      {r.present_days > 0
                        ? <span className="badge badge-green">✓ {r.present_days}</span>
                        : <span style={{ color: "var(--muted2)", fontSize: 13 }}>—</span>
                      }
                    </td>
                    <td>
                      {r.absent_days > 0
                        ? <span className="badge badge-red">{r.absent_days}</span>
                        : <span style={{ color: "var(--muted2)", fontSize: 13 }}>—</span>
                      }
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: 13 }}>{r.total_marked}</td>
                    <td>
                      {r.total_marked === 0 ? (
                        <span style={{ color: "var(--muted2)", fontSize: 13 }}>Not tracked</span>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 140 }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div className="progress-fill" style={{ width: `${r.attendance_rate}%` }} />
                          </div>
                          <span style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: r.attendance_rate >= 75
                              ? "var(--green)" : r.attendance_rate >= 50
                              ? "var(--amber)" : "var(--red)",
                            minWidth: 40
                          }}>
                            {r.attendance_rate}%
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      {rows.length > 0 && (
        <div style={{ display: "flex", gap: 20, marginTop: 14, padding: "0 4px" }}>
          <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "var(--green)" }} />
            ≥ 75% — Good
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "var(--amber)" }} />
            50–74% — Average
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "var(--red)" }} />
            {"< 50% — Low"}
          </div>
        </div>
      )}
    </div>
  );
}
