const { getDb, saveDatabase } = require('./db');

// ─────────────────────────────────────────
// CLIENT FUNCTIONS
// ─────────────────────────────────────────

function addClient(name, surname, email, phone) {
  const db = getDb();
  db.run(
    `INSERT INTO clients (name, surname, email, phone) VALUES (?, ?, ?, ?)`,
    [name, surname, email, phone]
  );
  // Get the last inserted ID
  const result = db.exec(`SELECT last_insert_rowid() as id`);
  saveDatabase();
  return result[0].values[0][0];
}

function getAllClients() {
  const db = getDb();
  const result = db.exec(`SELECT * FROM clients`);
  if (result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

function getClientById(id) {
  const db = getDb();
  const result = db.exec(`SELECT * FROM clients WHERE id = ${id}`);
  if (result.length === 0) return null;
  const columns = result[0].columns;
  const row = result[0].values[0];
  const obj = {};
  columns.forEach((col, i) => obj[col] = row[i]);
  return obj;
}

function deleteClient(id) {
  const db = getDb();
  db.run(`DELETE FROM appointments WHERE client_id = ?`, [id]);
  db.run(`DELETE FROM clients WHERE id = ?`, [id]);
  saveDatabase();
}

// ─────────────────────────────────────────
// APPOINTMENT FUNCTIONS
// ─────────────────────────────────────────

function addAppointment(clientId, petName, petType, shotDate) {
  const db = getDb();
  db.run(
    `INSERT INTO appointments (client_id, pet_name, pet_type, shot_date) VALUES (?, ?, ?, ?)`,
    [clientId, petName, petType, shotDate]
  );
  const result = db.exec(`SELECT last_insert_rowid() as id`);
  saveDatabase();
  return result[0].values[0][0];
}

function getAllAppointments() {
  const db = getDb();
  const result = db.exec(`
    SELECT 
      appointments.id,
      appointments.pet_name,
      appointments.pet_type,
      appointments.shot_date,
      appointments.reminder_sent,
      clients.name,
      clients.surname,
      clients.email,
      clients.phone
    FROM appointments
    JOIN clients ON appointments.client_id = clients.id
    ORDER BY appointments.shot_date ASC
  `);
  if (result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

function getAppointmentsDueForReminder() {
  const db = getDb();
  const today = new Date();
  const reminderDate = new Date(today);
  reminderDate.setDate(today.getDate() + 7);
  const dateString = reminderDate.toISOString().split('T')[0];

  const result = db.exec(`
    SELECT 
      appointments.id,
      appointments.pet_name,
      appointments.pet_type,
      appointments.shot_date,
      clients.name,
      clients.surname,
      clients.email,
      clients.phone
    FROM appointments
    JOIN clients ON appointments.client_id = clients.id
    WHERE appointments.shot_date = '${dateString}'
    AND appointments.reminder_sent = 0
  `);
  if (result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

function markReminderSent(appointmentId) {
  const db = getDb();
  db.run(`UPDATE appointments SET reminder_sent = 1 WHERE id = ?`, [appointmentId]);
  saveDatabase();
}

function deleteAppointment(id) {
  const db = getDb();
  db.run(`DELETE FROM appointments WHERE id = ?`, [id]);
  saveDatabase();
}

module.exports = {
  addClient,
  getAllClients,
  getClientById,
  deleteClient,
  addAppointment,
  getAllAppointments,
  getAppointmentsDueForReminder,
  markReminderSent,
  deleteAppointment
};