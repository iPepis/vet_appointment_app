const { app, BrowserWindow } = require('electron');
const { initDatabase } = require('./database/db');
const { startServer } = require('./backend/server');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadFile('src/frontend/index.html');
}

app.whenReady().then(async () => {
  // Step 1 - Start the database
  await initDatabase();
  console.log('Database initialized');

  // Step 2 - Start the backend server
  await startServer();
  console.log('Server started');

  // Step 3 - Open the window
  createWindow();
});

// Close the app when all windows are closed (Windows & Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

