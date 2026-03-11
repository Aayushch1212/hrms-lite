import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, CalendarCheck, BarChart3, Layers
} from "lucide-react";
import { healthApi } from "../api";

const NAV = [
  { to: "/",          label: "Dashboard",  icon: LayoutDashboard },
  { to: "/employees", label: "Employees",  icon: Users },
  { to: "/attendance",label: "Attendance", icon: CalendarCheck },
  { to: "/summary",   label: "Summary",    icon: BarChart3 },
];

const PAGE_TITLES = {
  "/":           { title: "Dashboard",         breadcrumb: "Overview" },
  "/employees":  { title: "Employees",         breadcrumb: "Manage employee records" },
  "/attendance": { title: "Attendance",        breadcrumb: "Track daily attendance" },
  "/summary":    { title: "Attendance Summary",breadcrumb: "Per-employee attendance stats" },
};

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const page = PAGE_TITLES[pathname] || { title: "HRMS Lite", breadcrumb: "" };
  const [apiOk, setApiOk] = useState(null);

  useEffect(() => {
    healthApi.check()
      .then(() => setApiOk(true))
      .catch(() => setApiOk(false));
  }, []);

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <Layers size={18} />
          </div>
          <div className="logo-text-block">
            <div className="brand">HRMS Lite</div>
            <div className="sub">Admin Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Navigation</div>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className={`dot ${apiOk === false ? "dot-red" : "dot-green"}`} />
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              API {apiOk === false ? "Offline" : "Connected"}
            </span>
          </div>
          <div style={{ marginTop: 5, fontSize: 11, color: "var(--muted2)" }}>HRMS Lite v1.0</div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h1>{page.title}</h1>
            <div className="breadcrumb">{page.breadcrumb}</div>
          </div>
          <div className="topbar-right">
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric", year: "numeric"
              })}
            </span>
          </div>
        </header>

        <div className="page-body fade-in">{children}</div>
      </div>
    </div>
  );
}
