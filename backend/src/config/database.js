const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, "../../../hrms.db");

let db;

function getDb() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    initSchema(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id          TEXT PRIMARY KEY,
      employee_id TEXT UNIQUE NOT NULL,
      full_name   TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      department  TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id          TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      date        TEXT NOT NULL,
      status      TEXT NOT NULL CHECK(status IN ('Present','Absent')),
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      UNIQUE(employee_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
  `);
}

module.exports = { getDb };