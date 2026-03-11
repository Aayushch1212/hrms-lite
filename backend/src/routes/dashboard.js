const express = require("express");
const { getDb } = require("../config/database");

const router = express.Router();

// ── GET /api/dashboard ──────────────────────────────────────────────────────
router.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split("T")[0];

    const totalEmployees = db.prepare(`SELECT COUNT(*) AS c FROM employees`).get().c;
    const presentToday   = db.prepare(`SELECT COUNT(*) AS c FROM attendance WHERE date = ? AND status = 'Present'`).get(today).c;
    const absentToday    = db.prepare(`SELECT COUNT(*) AS c FROM attendance WHERE date = ? AND status = 'Absent'`).get(today).c;
    const totalRecords   = db.prepare(`SELECT COUNT(*) AS c FROM attendance`).get().c;

    const departments = db
      .prepare(`SELECT department, COUNT(*) AS count FROM employees GROUP BY department ORDER BY count DESC`)
      .all();

    const recentAttendance = db
      .prepare(
        `SELECT a.date, a.status, e.full_name, e.employee_id AS emp_code, e.department
         FROM attendance a JOIN employees e ON e.id = a.employee_id
         ORDER BY a.created_at DESC LIMIT 10`
      )
      .all();

    res.json({
      success: true,
      data: {
        today,
        totalEmployees,
        presentToday,
        absentToday,
        totalRecords,
        departments,
        recentAttendance,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
