/**
 * Frontend Initialization Module
 * Main entry point for frontend components initialization
 * Integrates panel loader, event handlers, and UI controllers
 */

// Import dependencies (modules should be loaded in index.html)
let panelLoader;
let uiController;
let sqlmapRunner;
let optionsMapper;
let resultsViewer;
let projectManager;
let exportManager;
let settingsManager;

/**
 * Initialize all frontend modules
 */
function initializeFrontend() {
    console.log('Initializing SQLMap GUI Frontend...');

    try {
        // Initialize panel loader
        panelLoader = new PanelLoader();
        panelLoader.init();
        console.log('✓ Panel Loader initialized');

        // Initialize UI controller if available
        if (typeof UIController !== 'undefined') {
            uiController = new UIController();
            uiController.init();
            console.log('✓ UI Controller initialized');
        }

        // Initialize options mapper if available
        if (typeof OptionsMapper !== 'undefined') {
            optionsMapper = new OptionsMapper();
            console.log('✓ Options Mapper initialized');
        }

        // Initialize results viewer if available
        if (typeof ResultsViewer !== 'undefined') {
            resultsViewer = new ResultsViewer();
            resultsViewer.init();
            console.log('✓ Results Viewer initialized');
        }

        // Initialize project manager if available
        if (typeof ProjectManager !== 'undefined') {
            projectManager = new ProjectManager();
            console.log('✓ Project Manager initialized');
        }

        // Initialize export manager if available
        if (typeof ExportManager !== 'undefined') {
            exportManager = new ExportManager();
            console.log('✓ Export Manager initialized');
        }

        // Initialize settings manager if available
        if (typeof SettingsManager !== 'undefined') {
            settingsManager = new SettingsManager();
            settingsManager.init();
            console.log('✓ Settings Manager initialized');
        }

        // Initialize SQLMap runner if available
        if (typeof SQLMapRunner !== 'undefined') {
            sqlmapRunner = new SQLMapRunner();
            console.log('✓ SQLMap Runner initialized');
        }

        // Set up event handlers
        setupEventHandlers();
        console.log('✓ Event handlers set up');

        // Set up form interactions
        setupFormInteractions();
        console.log('✓ Form interactions set up');

        // Initialize range sliders
        initRangeSliders();
        console.log('✓ Range sliders initialized');

        // Load saved settings
        loadSettings();
        console.log('✓ Settings loaded');

        console.log('✅ Frontend initialization complete!');

        // Log panel statistics
        const stats = panelLoader.getStats();
        console.log(`📊 Panel Stats: ${stats.totalPanels} panels registered`);

    } catch (error) {
        console.error('❌ Frontend initialization failed:', error);
        showError('Failed to initialize application. Please reload.');
    }
}

/**
 * Set up global event handlers
 */
function setupEventHandlers() {
    // Start scan button
    const startBtn = document.getElementById('start-scan-btn');
    if (startBtn) {
        startBtn.addEventListener('click', handleStartScan);
    }

    // Stop scan button
    const stopBtn = document.getElementById('stop-scan-btn');
    if (stopBtn) {
        stopBtn.addEventListener('click', handleStopScan);
    }

    // Clear console button
    const clearBtn = document.getElementById('clear-console-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', handleClearConsole);
    }

    // Save project button
    const saveBtn = document.getElementById('save-project-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveProject);
    }

    // Load project button
    const loadBtn = document.getElementById('load-project-btn');
    if (loadBtn) {
        loadBtn.addEventListener('click', handleLoadProject);
    }

    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });
}

/**
 * Set up form interactions (checkbox dependencies, etc.)
 */
function setupFormInteractions() {
    // POST data checkbox
    const usePostCheckbox = document.getElementById('use-post');
    const postDataInput = document.getElementById('post-data');
    if (usePostCheckbox && postDataInput) {
        usePostCheckbox.addEventListener('change', (e) => {
            postDataInput.disabled = !e.target.checked;
        });
    }

    // Cookie checkbox
    const useCookieCheckbox = document.getElementById('use-cookie');
    const cookieDataInput = document.getElementById('cookie-data');
    if (useCookieCheckbox && cookieDataInput) {
        useCookieCheckbox.addEventListener('change', (e) => {
            cookieDataInput.disabled = !e.target.checked;
        });
    }

    // Tor checkbox interactions
    const torCheckbox = document.getElementById('tor');
    const checkTorCheckbox = document.getElementById('check-tor');
    if (torCheckbox && checkTorCheckbox) {
        torCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                checkTorCheckbox.disabled = false;
            } else {
                checkTorCheckbox.checked = false;
                checkTorCheckbox.disabled = true;
            }
        });
    }
}

/**
 * Initialize range sliders with value display
 */
function initRangeSliders() {
    const rangeSliders = document.querySelectorAll('.range-slider');

    rangeSliders.forEach(slider => {
        const valueDisplay = document.getElementById(`${slider.id}-value`);

        if (valueDisplay) {
            // Set initial value
            valueDisplay.textContent = slider.value;

            // Update on input
            slider.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value;
            });
        }
    });
}

/**
 * Handle start scan button click
 */
async function handleStartScan() {
    console.log('Start scan clicked');

    // Validate panels
    const validation = panelLoader.validateAllPanels();
    if (!validation.valid) {
        showError(validation.errors.join('\n'));
        return;
    }

    // Get all form data
    const formData = panelLoader.getAllPanelData();
    console.log('Form data:', formData);

    // Map to CLI arguments
    let cliArgs = [];
    if (optionsMapper) {
        cliArgs = optionsMapper.mapFormDataToCLI(formData);
        console.log('CLI arguments:', cliArgs);
    }

    // Show loading overlay
    showLoading(true);

    // Start scan
    if (sqlmapRunner) {
        try {
            await sqlmapRunner.start(cliArgs);
            updateStatus('Scanning...');
        } catch (error) {
            console.error('Scan start failed:', error);
            showError('Failed to start scan: ' + error.message);
            showLoading(false);
        }
    } else {
        console.warn('SQLMap runner not available');
        showLoading(false);
    }
}

/**
 * Handle stop scan button click
 */
function handleStopScan() {
    console.log('Stop scan clicked');

    if (sqlmapRunner) {
        sqlmapRunner.stop();
        updateStatus('Scan stopped');
        showLoading(false);
    }
}

/**
 * Handle clear console button click
 */
function handleClearConsole() {
    const consoleOutput = document.getElementById('console-output');
    if (consoleOutput) {
        consoleOutput.innerHTML = '';
        addConsoleLog('Console cleared', 'info');
    }
}

/**
 * Handle save project button click
 */
async function handleSaveProject() {
    console.log('Save project clicked');

    if (projectManager) {
        const formData = panelLoader.getAllPanelData();
        const result = await projectManager.saveProject(formData);

        if (result.success) {
            showSuccess('Project saved successfully');
        } else {
            showError('Failed to save project');
        }
    }
}

/**
 * Handle load project button click
 */
async function handleLoadProject() {
    console.log('Load project clicked');

    if (projectManager) {
        const result = await projectManager.loadProject();

        if (result.success && result.data) {
            panelLoader.loadPanelData(result.data);
            showSuccess('Project loaded successfully');
        } else {
            showError('Failed to load project');
        }
    }
}

/**
 * Open settings modal
 */
function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Close settings modal
 */
function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Switch between tabs (console/results)
 */
function switchTab(tabId) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        if (content.id === `${tabId}-tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
}

/**
 * Update status bar text
 */
function updateStatus(text) {
    const statusText = document.getElementById('status-text');
    if (statusText) {
        statusText.textContent = text;
    }
}

/**
 * Add log entry to console
 */
function addConsoleLog(message, type = 'info') {
    const consoleOutput = document.getElementById('console-output');
    if (!consoleOutput) return;

    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;

    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    timestamp.textContent = `[${new Date().toLocaleTimeString()}]`;

    const messageSpan = document.createElement('span');
    messageSpan.className = 'message';
    messageSpan.textContent = message;

    logEntry.appendChild(timestamp);
    logEntry.appendChild(messageSpan);
    consoleOutput.appendChild(logEntry);

    // Auto-scroll if enabled
    const autoScroll = document.getElementById('auto-scroll-console');
    if (!autoScroll || autoScroll.checked) {
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
}

/**
 * Show error notification
 */
function showError(message) {
    console.error(message);
    addConsoleLog(`ERROR: ${message}`, 'error');
    // TODO: Add toast notification
}

/**
 * Show success notification
 */
function showSuccess(message) {
    console.log(message);
    addConsoleLog(message, 'success');
    // TODO: Add toast notification
}

/**
 * Load saved settings from persistent storage
 */
function loadSettings() {
    if (settingsManager) {
        const settings = settingsManager.loadSettings();

        // Apply settings to UI
        if (settings.sqlmapPath) {
            const pathInput = document.getElementById('sqlmap-path');
            if (pathInput) pathInput.value = settings.sqlmapPath;
        }

        if (settings.pythonPath) {
            const pythonInput = document.getElementById('python-path');
            if (pythonInput) pythonInput.value = settings.pythonPath;
        }

        if (settings.autoScrollConsole !== undefined) {
            const autoScrollInput = document.getElementById('auto-scroll-console');
            if (autoScrollInput) autoScrollInput.checked = settings.autoScrollConsole;
        }

        if (settings.showTimestamps !== undefined) {
            const timestampsInput = document.getElementById('show-timestamps');
            if (timestampsInput) timestampsInput.checked = settings.showTimestamps;
        }
    }
}

/**
 * Make closeSettings globally available for HTML onclick
 */
window.closeSettings = closeSettings;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFrontend);
} else {
    initializeFrontend();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        panelLoader,
        initializeFrontend,
        addConsoleLog,
        showError,
        showSuccess,
        updateStatus,
        showLoading
    };
}
