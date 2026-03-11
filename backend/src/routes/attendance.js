const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../config/database");
const { validate, attendanceSchema } = require("../middleware/validate");

const router = express.Router();

// ── GET /api/attendance ─────────────────────────────────────────────────────
// Supports query params: employee_id, date, from, to
router.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const { employee_id, date, from, to } = req.query;

    const conditions = ["1=1"];
    const params = [];

    if (employee_id) { conditions.push("a.employee_id = ?"); params.push(employee_id); }
    if (date)        { conditions.push("a.date = ?");         params.push(date); }
    if (from)        { conditions.push("a.date >= ?");        params.push(from); }
    if (to)          { conditions.push("a.date <= ?");        params.push(to); }

    const records = db
      .prepare(
        `SELECT
          a.id,
          a.employee_id,
          a.date,
          a.status,
          a.created_at,
          e.full_name,
          e.employee_id AS emp_code,
          e.department
        FROM attendance a
        JOIN employees e ON e.id = a.employee_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY a.date DESC, e.full_name ASC`
      )
      .all(...params);

    res.json({ success: true, data: records, count: records.length });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/attendance/summary ─────────────────────────────────────────────
// Per-employee attendance stats (bonus feature)
router.get("/summary", (req, res, next) => {
  try {
    const db = getDb();
    const summary = db
      .prepare(
        `SELECT
          e.id,
          e.employee_id  AS emp_code,
          e.full_name,
          e.department,
          COALESCE(SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END), 0) AS present_days,
          COALESCE(SUM(CASE WHEN a.status = 'Absent'  THEN 1 ELSE 0 END), 0) AS absent_days,
          COALESCE(COUNT(a.id), 0) AS total_marked,
          CASE
            WHEN COUNT(a.id) = 0 THEN 0
            ELSE ROUND(
              100.0 * SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / COUNT(a.id), 1
            )
          END AS attendance_rate
        FROM employees e
        LEFT JOIN attendance a ON a.employee_id = e.id
        GROUP BY e.id
        ORDER BY e.full_name ASC`
      )
      .all();

    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/attendance ────────────────────────────────────────────────────
// Upserts — re-marking the same employee+date updates the status.
router.post("/", validate(attendanceSchema), (req, res, next) => {
  try {
    const db = getDb();
    const { employee_id, date, status } = req.body;

    const emp = db
      .prepare(`SELECT id FROM employees WHERE id = ?`)
      .get(employee_id);
    if (!emp) {
      const err = new Error("Employee not found");
      err.status = 404;
      return next(err);
    }

    const existing = db
      .prepare(`SELECT id FROM attendance WHERE employee_id = ? AND date = ?`)
      .get(employee_id, date);

    let record;
    if (existing) {
      db.prepare(`UPDATE attendance SET status = ? WHERE id = ?`).run(status, existing.id);
      record = db.prepare(`SELECT * FROM attendance WHERE id = ?`).get(existing.id);
    } else {
      const id = uuidv4();
      db.prepare(
        `INSERT INTO attendance (id, employee_id, date, status) VALUES (?, ?, ?, ?)`
      ).run(id, employee_id, date, status);
      record = db.prepare(`SELECT * FROM attendance WHERE id = ?`).get(id);
    }

    // Enrich with employee info
    const enriched = db
      .prepare(
        `SELECT a.*, e.full_name, e.employee_id AS emp_code, e.department
         FROM attendance a JOIN employees e ON e.id = a.employee_id
         WHERE a.id = ?`
      )
      .get(record.id);

    res.status(201).json({
      success: true,
      data: enriched,
      message: "Attendance marked successfully",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
