/* ============================================
   Results Viewer - Display parsed results
   ============================================ */

const ResultsViewer = {
    vulnerabilities: [],
    databases: [],
    tables: [],

    // Add vulnerability to results
    addVulnerability(vuln) {
        if (!vuln || !vuln.found) return;

        this.vulnerabilities.push(vuln);
        this.renderVulnerabilities();
        UIController.showResults(true);
        UIController.switchTab('results');
    },

    // Add databases to results
    addDatabases(databases) {
        if (!databases || databases.length === 0) return;

        this.databases = databases;
        this.renderDatabases();
        UIController.showResults(true);
    },

    // Add tables to results
    addTables(tables) {
        if (!tables || tables.length === 0) return;

        this.tables = tables;
        this.renderTables();
        UIController.showResults(true);
    },

    // Render vulnerabilities
    renderVulnerabilities() {
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) return;

        // Remove placeholder
        const placeholder = resultsContainer.querySelector('.results-placeholder');
        if (placeholder) placeholder.remove();

        // Create or find vulnerabilities card
        let vulnCard = resultsContainer.querySelector('#vuln-card');
        if (!vulnCard) {
            vulnCard = createElement('div', 'results-card');
            vulnCard.id = 'vuln-card';
            resultsContainer.appendChild(vulnCard);
        }

        // Clear and rebuild
        vulnCard.innerHTML = '';

        const title = createElement('h3');
        title.innerHTML = '<span class="card-icon">🔥</span> SQL Injection Vulnerabilities';
        vulnCard.appendChild(title);

        this.vulnerabilities.forEach(vuln => {
            const vulnDiv = createElement('div', 'vulnerability-item');
            vulnDiv.innerHTML = `
        <span class="vulnerability-badge high">VULNERABLE</span>
        <strong>Parameter:</strong> ${escapeHtml(vuln.parameter || 'Unknown')}<br>
        <strong>Type:</strong> ${escapeHtml(vuln.type || 'Unknown')}<br>
        ${vuln.payload ? `<strong>Payload:</strong> <code>${escapeHtml(vuln.payload)}</code>` : ''}
      `;
            vulnCard.appendChild(vulnDiv);
        });
    },

    // Render databases
    renderDatabases() {
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) return;

        // Remove placeholder
        const placeholder = resultsContainer.querySelector('.results-placeholder');
        if (placeholder) placeholder.remove();

        // Create or find databases card
        let dbCard = resultsContainer.querySelector('#db-card');
        if (!dbCard) {
            dbCard = createElement('div', 'results-card');
            dbCard.id = 'db-card';
            resultsContainer.appendChild(dbCard);
        }

        // Clear and rebuild
        dbCard.innerHTML = '';

        const title = createElement('h3');
        title.innerHTML = '<span class="card-icon">💾</span> Databases Found';
        dbCard.appendChild(title);

        const dbTree = createElement('div', 'db-tree');
        this.databases.forEach(db => {
            const node = createElement('div', 'db-tree-node');
            node.innerHTML = `<span class="db-tree-icon">📁</span>${escapeHtml(db)}`;
            dbTree.appendChild(node);
        });
        dbCard.appendChild(dbTree);
    },

    // Render tables
    renderTables() {
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) return;

        // Create or find tables card
        let tablesCard = resultsContainer.querySelector('#tables-card');
        if (!tablesCard) {
            tablesCard = createElement('div', 'results-card');
            tablesCard.id = 'tables-card';
            resultsContainer.appendChild(tablesCard);
        }

        // Clear and rebuild
        tablesCard.innerHTML = '';

        const title = createElement('h3');
        title.innerHTML = '<span class="card-icon">📋</span> Tables Found';
        tablesCard.appendChild(title);

        const tablesList = createElement('ul', 'tables-list');
        this.tables.forEach(table => {
            const item = createElement('li', 'table-item');
            const nameSpan = createElement('span', 'table-name', table);
            item.appendChild(nameSpan);
            tablesList.appendChild(item);
        });
        tablesCard.appendChild(tablesList);
    },

    // Clear all results
    clear() {
        this.vulnerabilities = [];
        this.databases = [];
        this.tables = [];

        const resultsContainer = document.getElementById('results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
        <div class="results-placeholder">
          <span class="placeholder-icon">📊</span>
          <p>No results yet. Start a scan to see vulnerability findings.</p>
        </div>
      `;
        }
    },

    displayResults(results) {
        const container = document.getElementById('results-container');
        if (!container) return;

        // Store results globally for export
        window.scanResults = results;

        container.innerHTML = '';

        // Add export buttons
        const exportBar = createElement('div', 'export-bar', `
            <h3>Export Results</h3>
            <div class="export-buttons">
                <button class="btn btn-secondary btn-small export-btn" onclick="ExportManager.exportToJSON(ExportManager.collectResults())">
                    Export JSON
                </button>
                <button class="btn btn-secondary btn-small export-btn" onclick="ExportManager.exportToCSV(ExportManager.collectResults())">
                    Export CSV
                </button>
                <button class="btn btn-secondary btn-small export-btn" onclick="ExportManager.exportToHTML(ExportManager.collectResults())">
                    Export HTML Report
                </button>
            </div>
        `);
        container.appendChild(exportBar);
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResultsViewer;
}
