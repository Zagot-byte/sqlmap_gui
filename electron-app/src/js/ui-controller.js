/* ============================================
   UI Controller - Manage UI state and interactions
   ============================================ */

const UIController = {
    activePanel: 'target',
    activeTab: 'console',
    isScanning: false,

    // Initialize UI
    init() {
        this.setupSidebarNavigation();
        this.setupTabSwitching();
        this.setupCheckboxToggles();
        this.showPanel(' target');
    },

    // Setup sidebar navigation
    setupSidebarNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const panelName = item.dataset.panel;
                this.switchPanel(panelName);

                // Update active nav item
                navItems.forEach(navItem => navItem.classList.remove('active'));
                item.classList.add('active');
            });
        });
    },

    // Switch between panels
    switchPanel(panelName) {
        // Hide all panels
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => panel.classList.remove('active'));

        // Show selected panel
        const targetPanel = document.getElementById(`${panelName}-panel`);
        if (targetPanel) {
            targetPanel.classList.add('active');
            this.activePanel = panelName;
        }
    },

    // Setup tab switching (console vs results)
    setupTabSwitching() {
        const tabBtns = document.querySelectorAll('.tab-btn');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);

                // Update active tab button
                tabBtns.forEach(tabBtn => tabBtn.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    },

    // Switch between tabs
    switchTab(tabName) {
        // Hide all tabs
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => tab.classList.remove('active'));

        // Show selected tab
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
            this.activeTab = tabName;
        }
    },

    // Setup checkbox toggle dependencies
    setupCheckboxToggles() {
        // POST data toggle
        const usePostCheckbox = document.getElementById('use-post');
        const postDataInput = document.getElementById('post-data');
        if (usePostCheckbox && postDataInput) {
            usePostCheckbox.addEventListener('change', () => {
                postDataInput.disabled = !usePostCheckbox.checked;
            });
        }

        // Cookie toggle
        const useCookieCheckbox = document.getElementById('use-cookie');
        const cookieDataInput = document.getElementById('cookie-data');
        if (useCookieCheckbox && cookieDataInput) {
            useCookieCheckbox.addEventListener('change', () => {
                cookieDataInput.disabled = !useCookieCheckbox.checked;
            });
        }
    },

    // Set scanning state
    setScanningState(isScanning) {
        this.isScanning = isScanning;
        const startBtn = document.getElementById('start-scan-btn');
        const stopBtn = document.getElementById('stop-scan-btn');

        if (startBtn && stopBtn) {
            startBtn.disabled = isScanning;
            stopBtn.disabled = !isScanning;
        }

        // Update status bar
        this.updateStatus(isScanning ? 'Scanning...' : 'Ready');
    },

    // Update status text
    updateStatus(text) {
        const statusText = document.getElementById('status-text');
        if (statusText) {
            statusText.textContent = text;
        }
    },

    // Update scan time
    updateScanTime(elapsed) {
        const scanTime = document.getElementById('scan-time');
        if (scanTime) {
            scanTime.textContent = formatElapsedTime(elapsed);
        }
    },

    // Clear console
    clearConsole() {
        const consoleOutput = document.getElementById('console-output');
        if (consoleOutput) {
            consoleOutput.innerHTML = '';
        }
    },

    // Show results placeholder or content
    showResults(hasResults) {
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) return;

        if (hasResults) {
            resultsContainer.querySelector('.results-placeholder')?.remove();
        }
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
