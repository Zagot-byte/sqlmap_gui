/* ============================================
   Main App - Application initialization
   ============================================ */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    console.log('SQLMap GUI initializing...');

    // Initialize UI Controller
    UIController.init();

    // Setup event listeners
    setupEventListeners();

    // Setup IPC listeners for SQLMap output
    setupIPCListeners();

    console.log('SQLMap GUI ready!');
}

function setupEventListeners() {
    // Start scan button
    const startBtn = document.getElementById('start-scan-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            SQLMapRunner.startScan();
        });
    }

    // Stop scan button
    const stopBtn = document.getElementById('stop-scan-btn');
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            SQLMapRunner.stopScan();
        });
    }

    // Clear console button
    const clearBtn = document.getElementById('clear-console-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            UIController.clearConsole();
            showNotification('Console cleared.', 'info');
        });
    }

    // Save project button
    const saveProjectBtn = document.getElementById('save-project-btn');
    if (saveProjectBtn) {
        saveProjectBtn.addEventListener('click', () => {
            ProjectManager.saveProject();
        });
    }

    // Load project button
    const loadProjectBtn = document.getElementById('load-project-btn');
    if (loadProjectBtn) {
        loadProjectBtn.addEventListener('click', () => {
            ProjectManager.loadProject();
        });
    }

    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showNotification('Settings panel coming soon!', 'info');
        });
    }
}

function setupIPCListeners() {
    // Listen for SQLMap output
    window.sqlmapAPI.onOutput((data) => {
        SQLMapRunner.handleOutput(data);
    });

    // Listen for SQLMap errors
    window.sqlmapAPI.onError((data) => {
        SQLMapRunner.handleError(data);
    });

    // Listen for scan completion
    window.sqlmapAPI.onComplete((exitCode) => {
        SQLMapRunner.handleComplete(exitCode);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+S or Cmd+S - Save project
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        ProjectManager.saveProject();
    }

    // Ctrl+O or Cmd+O - Load project
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        ProjectManager.loadProject();
    }

    // Ctrl+Enter or Cmd+Enter - Start scan
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!SQLMapRunner.isRunning) {
            SQLMapRunner.startScan();
        }
    }

    // Escape - Stop scan
    if (e.key === 'Escape') {
        if (SQLMapRunner.isRunning) {
            SQLMapRunner.stopScan();
        }
    }
});

console.log('App.js loaded');
