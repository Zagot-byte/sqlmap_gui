const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let sqlmapProcess = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#1e1e1e',
    icon: path.join(__dirname, 'assets/icons/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    frame: true,
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Load the index.html
  mainWindow.loadFile('src/index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (sqlmapProcess) {
      sqlmapProcess.kill();
    }
  });
}

// App ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Start SQLMap scan
ipcMain.handle('start-sqlmap', async (event, options) => {
  try {
    const sqlmapPath = path.join(__dirname, '../sqlmap.py');
    const args = buildSQLMapArgs(options);

    sqlmapProcess = spawn('python3', [sqlmapPath, ...args]);

    // Send output to renderer
    sqlmapProcess.stdout.on('data', (data) => {
      mainWindow.webContents.send('sqlmap-output', data.toString());
    });

    sqlmapProcess.stderr.on('data', (data) => {
      mainWindow.webContents.send('sqlmap-error', data.toString());
    });

    sqlmapProcess.on('close', (code) => {
      mainWindow.webContents.send('sqlmap-complete', code);
      sqlmapProcess = null;
    });

    return { success: true, message: 'SQLMap started successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Stop SQLMap scan
ipcMain.handle('stop-sqlmap', async () => {
  if (sqlmapProcess) {
    sqlmapProcess.kill();
    sqlmapProcess = null;
    return { success: true, message: 'SQLMap stopped' };
  }
  return { success: false, message: 'No active scan' };
});

// Build SQLMap CLI arguments from options
function buildSQLMapArgs(options) {
  const args = [];

  // Target
  if (options.url) args.push('-u', options.url);
  if (options.data) args.push('--data', options.data);
  if (options.cookie) args.push('--cookie', options.cookie);
  if (options.requestFile) args.push('-r', options.requestFile);

  // Detection
  if (options.level) args.push('--level', options.level.toString());
  if (options.risk) args.push('--risk', options.risk.toString());

  // Enumeration
  if (options.getDbs) args.push('--dbs');
  if (options.getTables) args.push('--tables');
  if (options.getColumns) args.push('--columns');
  if (options.dumpTable) args.push('--dump');

  // General
  if (options.batch) args.push('--batch');
  if (options.verbose) args.push('-v', options.verbose.toString());

  // Techniques
  if (options.technique) args.push('--technique', options.technique);

  // More options will be added as we build the UI

  return args;
}

// Save project
ipcMain.handle('save-project', async (event, projectData) => {
  const fs = require('fs').promises;
  const projectsDir = path.join(__dirname, '../projects');

  try {
    // Create projects directory if it doesn't exist
    await fs.mkdir(projectsDir, { recursive: true });

    const filePath = path.join(projectsDir, `${projectData.name}.json`);
    await fs.writeFile(filePath, JSON.stringify(projectData, null, 2));

    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Load project
ipcMain.handle('load-project', async (event, projectName) => {
  const fs = require('fs').promises;
  const filePath = path.join(__dirname, '../projects', `${projectName}.json`);

  try {
    const data = await fs.readFile(filePath, 'utf8');
    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// List projects
ipcMain.handle('list-projects', async () => {
  const fs = require('fs').promises;
  const projectsDir = path.join(__dirname, '../projects');

  try {
    const files = await fs.readdir(projectsDir);
    const projects = files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
    return { success: true, projects };
  } catch (error) {
    return { success: true, projects: [] };
  }
});
