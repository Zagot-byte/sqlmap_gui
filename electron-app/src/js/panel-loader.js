/**
 * Panel Loader Module
 * Dynamically loads and manages option panels for the SQLMap GUI
 */

class PanelLoader {
    constructor() {
        this.panels = new Map();
        this.currentPanel = 'target';
        this.panelContainer = null;
    }

    /**
     * Initialize the panel loader
     */
    init() {
        this.panelContainer = document.getElementById('panel-container');

        // Register all panels
        this.registerPanels();

        // Set up navigation
        this.setupNavigation();

        // Show initial panel
        this.showPanel('target');
    }

    /**
     * Register all available panels
     */
    registerPanels() {
        const panelIds = [
            'target',
            'request',
            'optimization',
            'injection',
            'detection',
            'techniques',
            'fingerprint',
            'enumeration',
            'brute-force',
            'udf',
            'filesystem',
            'os-access',
            'registry',
            'general',
            'misc'
        ];

        panelIds.forEach(id => {
            const panelElement = document.getElementById(`${id}-panel`);
            if (panelElement) {
                this.panels.set(id, {
                    id: id,
                    element: panelElement,
                    loaded: true
                });
            }
        });

        console.log(`Registered ${this.panels.size} panels`);
    }

    /**
     * Set up navigation button listeners
     */
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-item');

        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const panelId = button.dataset.panel;
                this.showPanel(panelId);

                // Update active state
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    /**
     * Show a specific panel and hide others
     * @param {string} panelId - The ID of the panel to show
     */
    showPanel(panelId) {
        // Normalize panel ID (handle variations like "brute force" vs "brute-force")
        const normalizedId = panelId.toLowerCase().replace(/\s+/g, '');

        // Find matching panel
        let targetPanel = null;
        for (const [id, panel] of this.panels.entries()) {
            const normalizedPanelId = id.replace(/-/g, '');
            if (normalizedPanelId === normalizedId) {
                targetPanel = panel;
                break;
            }
        }

        if (!targetPanel) {
            console.warn(`Panel not found: ${panelId}`);
            return;
        }

        // Hide all panels
        this.panels.forEach(panel => {
            panel.element.classList.remove('active');
        });

        // Show target panel
        targetPanel.element.classList.add('active');
        this.currentPanel = targetPanel.id;

        console.log(`Switched to panel: ${targetPanel.id}`);
    }

    /**
     * Get current active panel ID
     * @returns {string} Current panel ID
     */
    getCurrentPanel() {
        return this.currentPanel;
    }

    /**
     * Get all form data from current panel
     * @returns {Object} Form data from current panel
     */
    getCurrentPanelData() {
        const panel = this.panels.get(this.currentPanel);
        if (!panel) return {};

        const formData = {};
        const inputs = panel.element.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.id] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    formData[input.name] = input.value;
                }
            } else if (input.type === 'file') {
                formData[input.id] = input.files[0]?.path || '';
            } else {
                formData[input.id] = input.value;
            }
        });

        return formData;
    }

    /**
     * Get form data from all panels
     * @returns {Object} Complete form data
     */
    getAllPanelData() {
        const allData = {};

        this.panels.forEach(panel => {
            const inputs = panel.element.querySelectorAll('input, select, textarea');

            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    allData[input.id] = input.checked;
                } else if (input.type === 'radio') {
                    if (input.checked) {
                        allData[input.name] = input.value;
                    }
                } else if (input.type === 'file') {
                    allData[input.id] = input.files[0]?.path || '';
                } else {
                    allData[input.id] = input.value;
                }
            });
        });

        return allData;
    }

    /**
     * Load form data into panels
     * @param {Object} data - Form data to load
     */
    loadPanelData(data) {
        Object.keys(data).forEach(key => {
            const input = document.getElementById(key);
            if (!input) return;

            if (input.type === 'checkbox') {
                input.checked = data[key];
            } else if (input.type === 'radio') {
                if (input.value === data[key]) {
                    input.checked = true;
                }
            } else {
                input.value = data[key];
            }
        });

        console.log('Panel data loaded');
    }

    /**
     * Reset all panels to default values
     */
    resetAllPanels() {
        this.panels.forEach(panel => {
            const inputs = panel.element.querySelectorAll('input, select, textarea');

            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    // Keep batch mode checked by default
                    input.checked = input.id === 'batch';
                } else if (input.type === 'radio') {
                    input.checked = false;
                } else if (input.type === 'range') {
                    input.value = input.min || 1;
                    // Update range display
                    const valueDisplay = document.getElementById(`${input.id}-value`);
                    if (valueDisplay) {
                        valueDisplay.textContent = input.value;
                    }
                } else {
                    input.value = '';
                }
            });
        });

        console.log('All panels reset');
    }

    /**
     * Validate current panel inputs
     * @returns {Object} Validation result {valid: boolean, errors: Array}
     */
    validateCurrentPanel() {
        const errors = [];
        const panel = this.panels.get(this.currentPanel);

        if (!panel) {
            return { valid: false, errors: ['Panel not found'] };
        }

        // Target panel specific validation
        if (this.currentPanel === 'target') {
            const targetUrl = document.getElementById('target-url');
            const requestFile = document.getElementById('request-file');

            if (!targetUrl.value && !requestFile.files.length) {
                errors.push('Please provide either a target URL or request file');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate all panels
     * @returns {Object} Validation result {valid: boolean, errors: Array}
     */
    validateAllPanels() {
        const errors = [];

        // Check target panel
        const targetUrl = document.getElementById('target-url');
        const requestFile = document.getElementById('request-file');

        if (!targetUrl?.value && !requestFile?.files?.length) {
            errors.push('Target: Please provide either a target URL or request file');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Get panel statistics
     * @returns {Object} Statistics about panels
     */
    getStats() {
        let totalInputs = 0;
        let filledInputs = 0;
        let checkedBoxes = 0;
        let totalCheckboxes = 0;

        this.panels.forEach(panel => {
            const inputs = panel.element.querySelectorAll('input:not([type="checkbox"]), select, textarea');
            const checkboxes = panel.element.querySelectorAll('input[type="checkbox"]');

            totalInputs += inputs.length;
            totalCheckboxes += checkboxes.length;

            inputs.forEach(input => {
                if (input.value) filledInputs++;
            });

            checkboxes.forEach(checkbox => {
                if (checkbox.checked) checkedBoxes++;
            });
        });

        return {
            totalPanels: this.panels.size,
            totalInputs,
            filledInputs,
            totalCheckboxes,
            checkedBoxes,
            currentPanel: this.currentPanel
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PanelLoader;
}
