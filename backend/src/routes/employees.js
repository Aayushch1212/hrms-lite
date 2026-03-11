const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getDb } = require("../config/database");
const { validate, employeeSchema } = require("../middleware/validate");

const router = express.Router();

// ── GET /api/employees ──────────────────────────────────────────────────────
// Returns all employees with their present_days count (bonus feature).
router.get("/", (req, res, next) => {
  try {
    const db = getDb();
    const employees = db
      .prepare(
        `SELECT
          e.id,
          e.employee_id,
          e.full_name,
          e.email,
          e.department,
          e.created_at,
          COALESCE(SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END), 0) AS present_days,
          COALESCE(COUNT(a.id), 0) AS total_marked
        FROM employees e
        LEFT JOIN attendance a ON a.employee_id = e.id
        GROUP BY e.id
        ORDER BY e.created_at DESC`
      )
      .all();

    res.json({ success: true, data: employees, count: employees.length });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/employees/:id ──────────────────────────────────────────────────
router.get("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const emp = db
      .prepare(`SELECT * FROM employees WHERE id = ?`)
      .get(req.params.id);

    if (!emp) {
      const err = new Error("Employee not found");
      err.status = 404;
      return next(err);
    }
    res.json({ success: true, data: emp });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/employees ─────────────────────────────────────────────────────
router.post("/", validate(employeeSchema), (req, res, next) => {
  try {
    const db = getDb();
    const { employee_id, full_name, email, department } = req.body;

    const id = uuidv4();
    db.prepare(
      `INSERT INTO employees (id, employee_id, full_name, email, department)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, employee_id.trim(), full_name.trim(), email.trim().toLowerCase(), department.trim());

    const created = db.prepare(`SELECT * FROM employees WHERE id = ?`).get(id);
    res.status(201).json({
      success: true,
      data: created,
      message: "Employee created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/employees/:id ───────────────────────────────────────────────
router.delete("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const emp = db
      .prepare(`SELECT id, full_name FROM employees WHERE id = ?`)
      .get(req.params.id);

    if (!emp) {
      const err = new Error("Employee not found");
      err.status = 404;
      return next(err);
    }

    db.prepare(`DELETE FROM employees WHERE id = ?`).run(req.params.id);

    res.json({
      success: true,
      message: `Employee '${emp.full_name}' deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
