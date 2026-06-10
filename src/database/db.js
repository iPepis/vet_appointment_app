const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const initSqlJs = require('sql.js');

// Where the database file will be saved
const dbFolder = app.getPath('userData');
const dbPath = path.join(dbFolder, 'vet-reminder.db');

let db;

async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database file if it exists, otherwise create new
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      surname     TEXT NOT NULL,
      email       TEXT NOT NULL,
      phone       TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id      INTEGER NOT NULL,
      pet_name       TEXT NOT NULL,
      pet_type       TEXT NOT NULL,
      shot_date      TEXT NOT NULL,
      reminder_sent  INTEGER DEFAULT 0,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );
  `);

  // Save database to disk
  saveDatabase();
  console.log('Database ready at:', dbPath);
  return db;
}

// Call this after every change to save to disk
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function getDb() {
  return db;
}

module.exports = { initDatabase, saveDatabase, getDb };