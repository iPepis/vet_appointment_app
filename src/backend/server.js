const express = require('express');
const app = express();
//
// Allows the server to understand JSON data
app.use(express.json());

// ─────────────────────────────────────────
// IMPORT DATABASE FUNCTIONS
// ─────────────────────────────────────────
const {
  addClient,
  getAllClients,
  getClientById,
  deleteClient,
  addAppointment,
  getAllAppointments,
  deleteAppointment
} = require('../database/queries');


// ─────────────────────────────────────────
// CLIENT ROUTES
// ─────────────────────────────────────────

// GET all clients
// Frontend calls this to show the list of clients
app.get('/api/clients', (req, res) => {
  try {
    const clients = getAllClients();
    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET a single client by ID
app.get('/api/clients/:id', (req, res) => {
  try {
    const client = getClientById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST add a new client
// Frontend sends: { name, surname, email, phone }
app.post('/api/clients', (req, res) => {
  try {
    const { name, surname, email, phone } = req.body;

    // Make sure all fields are filled
    if (!name || !surname || !email || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required (name, surname, email, phone)' 
      });
    }

    const clientId = addClient(name, surname, email, phone);
    res.json({ success: true, clientId, message: 'Client added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE a client
app.delete('/api/clients/:id', (req, res) => {
  try {
    deleteClient(req.params.id);
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ─────────────────────────────────────────
// APPOINTMENT ROUTES
// ─────────────────────────────────────────

// GET all appointments (with client info)
app.get('/api/appointments', (req, res) => {
  try {
    const appointments = getAllAppointments();
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST add a new appointment
// Frontend sends: { clientId, petName, petType, shotDate }
app.post('/api/appointments', (req, res) => {
  try {
    const { clientId, petName, petType, shotDate } = req.body;

    // Make sure all fields are filled
    if (!clientId || !petName || !petType || !shotDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required (clientId, petName, petType, shotDate)' 
      });
    }

    // Make sure the client exists
    const client = getClientById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const appointmentId = addAppointment(clientId, petName, petType, shotDate);
    res.json({ 
      success: true, 
      appointmentId, 
      message: 'Appointment added successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE an appointment
app.delete('/api/appointments/:id', (req, res) => {
  try {
    deleteAppointment(req.params.id);
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ─────────────────────────────────────────
// START THE SERVER
// ─────────────────────────────────────────
const PORT = 3000;

function startServer() {
  return new Promise((resolve) => {
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
      resolve();
    });
  });
}

module.exports = { startServer };