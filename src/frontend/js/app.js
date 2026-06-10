// ─────────────────────────────────────────
// LOAD DATA WHEN PAGE STARTS
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadClients();
  loadAppointments();
  populateClientSelect();
});

// ─────────────────────────────────────────
// CLIENT FUNCTIONS
// ─────────────────────────────────────────

async function addClient() {
  const name = document.getElementById('clientName').value.trim();
  const surname = document.getElementById('clientSurname').value.trim();
  const email = document.getElementById('clientEmail').value.trim();
  const phone = document.getElementById('clientPhone').value.trim();

  if (!name || !surname || !email || !phone) {
    showMessage('clientMessage', 'All fields are required', 'error');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, surname, email, phone })
    });

    const result = await response.json();

    if (!result.success) {
      showMessage('clientMessage', result.message, 'error');
      return;
    }

    showMessage('clientMessage', 'Client added successfully!', 'success');
    
    // Clear form
    document.getElementById('clientName').value = '';
    document.getElementById('clientSurname').value = '';
    document.getElementById('clientEmail').value = '';
    document.getElementById('clientPhone').value = '';

    // Reload lists
    loadClients();
    populateClientSelect();
  } catch (error) {
    showMessage('clientMessage', 'Error: ' + error.message, 'error');
  }
}

async function loadClients() {
  try {
    const response = await fetch('http://localhost:3000/api/clients');
    const result = await response.json();
    const clients = result.data || [];

    const tbody = document.querySelector('#clientsTable tbody');
    const noClients = document.getElementById('noClients');

    tbody.innerHTML = '';

    if (clients.length === 0) {
      tbody.parentElement.style.display = 'none';
      noClients.style.display = 'block';
      return;
    }

    tbody.parentElement.style.display = 'table';
    noClients.style.display = 'none';

    clients.forEach(client => {
      const row = `
        <tr>
          <td>${client.name} ${client.surname}</td>
          <td>${client.email}</td>
          <td>${client.phone}</td>
          <td><button class="danger" onclick="deleteClient(${client.id})">Delete</button></td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error('Error loading clients:', error);
  }
}

async function deleteClient(id) {
  if (!confirm('Are you sure you want to delete this client and all their appointments?')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!result.success) {
      alert('Error: ' + result.message);
      return;
    }

    loadClients();
    loadAppointments();
    populateClientSelect();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function populateClientSelect() {
  try {
    const response = await fetch('http://localhost:3000/api/clients');
    const result = await response.json();
    const clients = result.data || [];

    const select = document.getElementById('appointmentClient');
    const currentValue = select.value;

    select.innerHTML = '<option value="">-- Choose a client --</option>';

    clients.forEach(client => {
      const option = document.createElement('option');
      option.value = client.id;
      option.textContent = `${client.name} ${client.surname}`;
      select.appendChild(option);
    });

    select.value = currentValue;
  } catch (error) {
    console.error('Error loading clients:', error);
  }
}

// ─────────────────────────────────────────
// APPOINTMENT FUNCTIONS
// ─────────────────────────────────────────

async function addAppointment() {
  const clientId = document.getElementById('appointmentClient').value;
  const petName = document.getElementById('petName').value.trim();
  const petType = document.getElementById('petType').value;
  const shotDate = document.getElementById('shotDate').value;

  if (!clientId || !petName || !petType || !shotDate) {
    showMessage('appointmentMessage', 'All fields are required', 'error');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: parseInt(clientId), petName, petType, shotDate })
    });

    const result = await response.json();

    if (!result.success) {
      showMessage('appointmentMessage', result.message, 'error');
      return;
    }

    showMessage('appointmentMessage', 'Appointment scheduled successfully!', 'success');

    // Clear form
    document.getElementById('appointmentClient').value = '';
    document.getElementById('petName').value = '';
    document.getElementById('petType').value = '';
    document.getElementById('shotDate').value = '';

    // Reload list
    loadAppointments();
  } catch (error) {
    showMessage('appointmentMessage', 'Error: ' + error.message, 'error');
  }
}

async function loadAppointments() {
  try {
    const response = await fetch('http://localhost:3000/api/appointments');
    const result = await response.json();
    const appointments = result.data || [];

    const tbody = document.querySelector('#appointmentsTable tbody');
    const noAppointments = document.getElementById('noAppointments');

    tbody.innerHTML = '';

    if (appointments.length === 0) {
      tbody.parentElement.style.display = 'none';
      noAppointments.style.display = 'block';
      return;
    }

    tbody.parentElement.style.display = 'table';
    noAppointments.style.display = 'none';

    // Sort by date
    appointments.sort((a, b) => new Date(a.shot_date) - new Date(b.shot_date));

    appointments.forEach(appointment => {
      const date = new Date(appointment.shot_date).toLocaleDateString('en-US');
      const row = `
        <tr>
          <td>${appointment.name} ${appointment.surname}</td>
          <td>${appointment.pet_name}</td>
          <td>${appointment.pet_type}</td>
          <td>${date}</td>
          <td><button class="danger" onclick="deleteAppointment(${appointment.id})">Delete</button></td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error('Error loading appointments:', error);
  }
}

async function deleteAppointment(id) {
  if (!confirm('Are you sure you want to delete this appointment?')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/appointments/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!result.success) {
      alert('Error: ' + result.message);
      return;
    }

    loadAppointments();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────

function showMessage(elementId, message, type) {
  const msgEl = document.getElementById(elementId);
  msgEl.textContent = message;
  msgEl.className = `message show ${type}`;

  // Auto-hide after 4 seconds
  setTimeout(() => {
    msgEl.classList.remove('show');
  }, 4000);
}