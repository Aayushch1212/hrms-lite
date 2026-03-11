import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import Layout from "./components/Layout";
import DashboardPage  from "./pages/DashboardPage";
import EmployeesPage  from "./pages/EmployeesPage";
import AttendancePage from "./pages/AttendancePage";
import SummaryPage    from "./pages/SummaryPage";

export default function App() {
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/"           element={<DashboardPage />} />
          <Route path="/employees"  element={<EmployeesPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/summary"    element={<SummaryPage />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ToastProvider>
  );
}
