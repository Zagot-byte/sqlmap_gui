/* ============================================
   Settings Manager
   ============================================ */

const SettingsManager = {
    settings: {
        sqlmapPath: '../sqlmap.py',
        pythonPath: 'python3',
        autoScrollConsole: true,
        showTimestamps: true,
        defaultOutputDir: ''
    },

    // Load settings from localStorage
    loadSettings() {
        const saved = localStorage.getItem('sqlmap-gui-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.applySettings();
    },

    // Save settings to localStorage
    saveSettings() {
        // Get values from settings modal
        this.settings.sqlmapPath = document.getElementById('sqlmap-path')?.value || '../sqlmap.py';
        this.settings.pythonPath = document.getElementById('python-path')?.value || 'python3';
        this.settings.autoScrollConsole = document.getElementById('auto-scroll-console')?.checked || false;
        this.settings.showTimestamps = document.getElementById('show-timestamps')?.checked || false;
        this.settings.defaultOutputDir = document.getElementById('default-output-dir')?.value || '';

        localStorage.setItem('sqlmap-gui-settings', JSON.stringify(this.settings));
        this.applySettings();

        Utils.showNotification('Settings saved successfully', 'success');
    },

    // Apply settings to UI
    applySettings() {
        // Set form values
        const sqlmapPath = document.getElementById('sqlmap-path');
        if (sqlmapPath) sqlmapPath.value = this.settings.sqlmapPath;

        const pythonPath = document.getElementById('python-path');
        if (pythonPath) pythonPath.value = this.settings.pythonPath;

        const autoScroll = document.getElementById('auto-scroll-console');
        if (autoScroll) autoScroll.checked = this.settings.autoScrollConsole;

        const showTimestamps = document.getElementById('show-timestamps');
        if (showTimestamps) showTimestamps.checked = this.settings.showTimestamps;

        const defaultOutput = document.getElementById('default-output-dir');
        if (defaultOutput) defaultOutput.value = this.settings.defaultOutputDir;
    },

    // Get setting value
    get(key) {
        return this.settings[key];
    }
};

// Modal functions
function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        SettingsManager.applySettings();
        modal.classList.add('active');
    }
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function saveSettings() {
    SettingsManager.saveSettings();
    closeSettings();
}

// Loading indicator functions
function showLoading(message = 'Processing...') {
    const overlay = document.getElementById('loading-overlay');
    const text = overlay?.querySelector('.loading-text');
    if (overlay) {
        if (text) text.textContent = message;
        overlay.classList.add('active');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    SettingsManager.loadSettings();

    // Wire up settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }

    // Close modal on overlay click
    const modalOverlay = document.getElementById('settings-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeSettings();
            }
        });
    }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SettingsManager, showLoading, hideLoading, openSettings, closeSettings, saveSettings };
}
