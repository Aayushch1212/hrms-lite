/**
 * Reusable validation helpers for request bodies.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE  = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Returns a middleware that validates req.body against a schema map.
 * Each entry: { required?: bool, validate?: (v) => string|null }
 */
function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      const isEmpty = value === undefined || value === null || String(value).trim() === "";

      if (rules.required && isEmpty) {
        errors.push(`'${field}' is required`);
        continue;
      }
      if (!isEmpty && rules.validate) {
        const msg = rules.validate(String(value).trim());
        if (msg) errors.push(msg);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }
    next();
  };
}

const employeeSchema = {
  employee_id: {
    required: true,
    validate: (v) => v.length < 2 ? "'employee_id' must be at least 2 characters" : null,
  },
  full_name: {
    required: true,
    validate: (v) => v.length < 2 ? "'full_name' must be at least 2 characters" : null,
  },
  email: {
    required: true,
    validate: (v) => !EMAIL_RE.test(v) ? "Invalid email format" : null,
  },
  department: { required: true },
};

const attendanceSchema = {
  employee_id: { required: true },
  date: {
    required: true,
    validate: (v) => {
      if (!DATE_RE.test(v)) return "Date must be in YYYY-MM-DD format";
      const d = new Date(v);
      if (isNaN(d.getTime())) return "Invalid date value";
      return null;
    },
  },
  status: {
    required: true,
    validate: (v) => !["Present", "Absent"].includes(v) ? "Status must be 'Present' or 'Absent'" : null,
  },
};

module.exports = { validate, employeeSchema, attendanceSchema };
