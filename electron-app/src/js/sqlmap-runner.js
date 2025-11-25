/* ============================================
   SQLMap Runner - Manage SQLMap subprocess
   ============================================ */

const SQLMapRunner = {
    isRunning: false,
    startTime: null,
    timerInterval: null,
    accumulatedOutput: '',

    // Start a scan
    async startScan() {
        if (this.isRunning) {
            showNotification('A scan is already running!', 'warning');
            return;
        }

        // Validate target URL
        const targetUrl = document.getElementById('target-url')?.value;
        if (!targetUrl) {
            showNotification('Please enter a target URL!', 'error');
            return;
        }

        try {
            // Clear previous results
            ResultsViewer.clear();
            UIController.clearConsole();
            this.accumulatedOutput = '';

            // Build options
            const options = {
                url: targetUrl,
                batch: true, // Always use batch mode for GUI
                ...OptionsMapper.getAllOptions()
            };

            // Start scan
            const result = await window.sqlmapAPI.startScan(options);

            if (result.success) {
                this.isRunning = true;
                this.startTime = Date.now();
                UIController.setScanningState(true);
                this.startTimer();

                showNotification('Scan started successfully!', 'success');
                this.logToConsole('[INFO] Scan started...');
            } else {
                showNotification(`Failed to start scan: ${result.message}`, 'error');
            }
        } catch (error) {
            showNotification(`Error starting scan: ${error.message}`, 'error');
        }
    },

    // Stop the scan
    async stopScan() {
        if (!this.isRunning) return;

        try {
            const result = await window.sqlmapAPI.stopScan();

            if (result.success) {
                this.isRunning = false;
                UIController.setScanningState(false);
                this.stopTimer();

                showNotification('Scan stopped.', 'info');
                this.logToConsole('[INFO] Scan stopped by user.');
            }
        } catch (error) {
            showNotification(`Error stopping scan: ${error.message}`, 'error');
        }
    },

    // Handle SQLMap output
    handleOutput(data) {
        this.accumulatedOutput += data;

        // Split into lines
        const lines = data.split('\n');

        lines.forEach(line => {
            if (!line.trim()) return;

            // Log to console
            this.logToConsole(line);

            // Parse for results
            this.parseOutput(line);
        });
    },

    // Handle SQLMap errors
    handleError(data) {
        this.logToConsole(data, 'error');
    },

    // Handle scan completion
    handleComplete(exitCode) {
        this.isRunning = false;
        UIController.setScanningState(false);
        this.stopTimer();

        const message = exitCode === 0
            ? '[INFO] Scan completed successfully.'
            : `[WARNING] Scan exited with code ${exitCode}.`;

        this.logToConsole(message);
        showNotification('Scan completed!', exitCode === 0 ? 'success' : 'warning');

        // Parse accumulated output for final results
        this.parseFinalResults();
    },

    // Log message to console
    logToConsole(message, level = 'info') {
        const consoleOutput = document.getElementById('console-output');
        if (!consoleOutput) return;

        const entry = OutputParser.formatOutputLine(message);
        consoleOutput.appendChild(entry);

        // Auto-scroll to bottom
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    },

    // Parse output for results
    parseOutput(line) {
        // Check for vulnerabilities
        if (OutputParser.isVulnerability(line)) {
            const vuln = OutputParser.parseVulnerability(this.accumulatedOutput);
            ResultsViewer.addVulnerability(vuln);
        }
    },

    // Parse final accumulated output for all results
    parseFinalResults() {
        // Parse databases
        const databases = OutputParser.parseDatabases(this.accumulatedOutput);
        if (databases.length > 0) {
            ResultsViewer.addDatabases(databases);
        }

        // Parse tables
        const tables = OutputParser.parseTables(this.accumulatedOutput);
        if (tables.length > 0) {
            ResultsViewer.addTables(tables);
        }
    },

    // Start timer
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            UIController.updateScanTime(elapsed);
        }, 1000);
    },

    // Stop timer
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SQLMapRunner;
}
