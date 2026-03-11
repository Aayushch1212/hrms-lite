require("dotenv").config();

const express = require("express");
const cors    = require("cors");

const employeeRoutes   = require("./routes/employees");
const attendanceRoutes = require("./routes/attendance");
const dashboardRoute   = require("./routes/dashboard");
const { errorHandler } = require("./middleware/errorHandler");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (dev)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`  → ${req.method} ${req.path}`);
    next();
  });
}

// ── Routes ───────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "HRMS Lite API is running", timestamp: new Date().toISOString() });
});

app.use("/api/dashboard",   dashboardRoute);
app.use("/api/employees",   employeeRoutes);
app.use("/api/attendance",  attendanceRoutes);

// 404 fallback
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.path}' not found` });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  HRMS Lite API`);
  console.log(`    http://localhost:${PORT}/api\n`);
});

module.exports = app;
