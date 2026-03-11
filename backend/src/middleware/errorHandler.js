/**
 * Global Express error handler.
 * Catches any error passed to next(err) and returns a consistent JSON response.
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // SQLite constraint errors
  if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
    const msg = err.message.includes("employees.employee_id")
      ? "Employee ID already exists"
      : err.message.includes("employees.email")
      ? "Email address already registered"
      : err.message.includes("attendance")
      ? "Attendance already marked for this employee on this date"
      : "Duplicate entry";
    return res.status(409).json({ success: false, message: msg });
  }

  const status = err.status || 500;
  const message = status < 500 ? err.message : "Internal server error";
  res.status(status).json({ success: false, message });
}

module.exports = { errorHandler };
