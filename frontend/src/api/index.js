import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Response interceptor — always resolve with response data
apiClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// ── Employee API ─────────────────────────────────────────────────────────────
export const employeeApi = {
  getAll:    ()         => apiClient.get("/employees"),
  getById:   (id)       => apiClient.get(`/employees/${id}`),
  create:    (data)     => apiClient.post("/employees", data),
  remove:    (id)       => apiClient.delete(`/employees/${id}`),
};

// ── Attendance API ───────────────────────────────────────────────────────────
export const attendanceApi = {
  getAll:    (params)   => apiClient.get("/attendance", { params }),
  getSummary:()         => apiClient.get("/attendance/summary"),
  mark:      (data)     => apiClient.post("/attendance", data),
};

// ── Dashboard API ────────────────────────────────────────────────────────────
export const dashboardApi = {
  get:       ()         => apiClient.get("/dashboard"),
};

// ── Health Check ─────────────────────────────────────────────────────────────
export const healthApi = {
  check:     ()         => apiClient.get("/health"),
};

export default apiClient;
