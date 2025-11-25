/* ============================================
   Export Manager - Export results to various formats
   ============================================ */

const ExportManager = {
    // Export to JSON
    exportToJSON(data) {
        const jsonData = JSON.stringify(data, null, 2);
        this.downloadFile(jsonData, 'sqlmap-results.json', 'application/json');
    },

    // Export to CSV
    exportToCSV(data) {
        let csv = '';

        // Vulnerabilities CSV
        if (data.vulnerabilities && data.vulnerabilities.length > 0) {
            csv += 'Type,Parameter,Payload,Severity,Timestamp\n';
            data.vulnerabilities.forEach(vuln => {
                csv += `"${vuln.type}","${vuln.parameter}","${vuln.payload}","${vuln.severity}","${vuln.timestamp}"\n`;
            });
        }

        // Databases CSV
        if (data.databases && data.databases.length > 0) {
            csv += '\nDatabases\n';
            data.databases.forEach(db => {
                csv += `"${db}"\n`;
            });
        }

        // Tables CSV
        if (data.tables && data.tables.length > 0) {
            csv += '\nTables\n';
            data.tables.forEach(table => {
                csv += `"${table}"\n`;
            });
        }

        this.downloadFile(csv, 'sqlmap-results.csv', 'text/csv');
    },

    // Export to HTML Report
    exportToHTML(data) {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>SQLMap Scan Results</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 40px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #003356, #00406C);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .section {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .vulnerability {
            border-left: 4px solid #f44336;
            padding: 15px;
            margin: 10px 0;
            background: #fff3f3;
        }
        .severity-high { border-left-color: #f44336; }
        .severity-medium { border-left-color: #ff9800; }
        .severity-low { border-left-color: #4caf50; }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #00406C;
            color: white;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>SQLMap Scan Results</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    ${this.generateVulnerabilitiesHTML(data.vulnerabilities)}
    ${this.generateDatabasesHTML(data.databases)}
    ${this.generateTablesHTML(data.tables)}
    ${this.generateDBMSInfoHTML(data.dbmsInfo)}
</body>
</html>
        `;

        this.downloadFile(html, 'sqlmap-report.html', 'text/html');
    },

    generateVulnerabilitiesHTML(vulnerabilities) {
        if (!vulnerabilities || vulnerabilities.length === 0) {
            return '<div class="section"><h2>No Vulnerabilities Found</h2></div>';
        }

        let html = '<div class="section"><h2>Vulnerabilities</h2>';
        vulnerabilities.forEach(vuln => {
            html += `
                <div class="vulnerability severity-${vuln.severity}">
                    <h3>${vuln.type}</h3>
                    <p><strong>Parameter:</strong> ${vuln.parameter}</p>
                    <p><strong>Payload:</strong> <code>${vuln.payload}</code></p>
                    <p><strong>Severity:</strong> ${vuln.severity.toUpperCase()}</p>
                </div>
            `;
        });
        html += '</div>';
        return html;
    },

    generateDatabasesHTML(databases) {
        if (!databases || databases.length === 0) return '';

        let html = '<div class="section"><h2>Databases</h2><table><tr><th>Database Name</th></tr>';
        databases.forEach(db => {
            html += `<tr><td>${db}</td></tr>`;
        });
        html += '</table></div>';
        return html;
    },

    generateTablesHTML(tables) {
        if (!tables || tables.length === 0) return '';

        let html = '<div class="section"><h2>Tables</h2><table><tr><th>Table Name</th></tr>';
        tables.forEach(table => {
            html += `<tr><td>${table}</td></tr>`;
        });
        html += '</table></div>';
        return html;
    },

    generateDBMSInfoHTML(dbmsInfo) {
        if (!dbmsInfo) return '';

        return `
            <div class="section">
                <h2>DBMS Information</h2>
                <p><strong>Type:</strong> ${dbmsInfo.type || 'Unknown'}</p>
                <p><strong>Version:</strong> ${dbmsInfo.version || 'Unknown'}</p>
                <p><strong>Banner:</strong> ${dbmsInfo.banner || 'N/A'}</p>
            </div>
        `;
    },

    // Helper to download file
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        Utils.showNotification(`Exported to ${filename}`, 'success');
    },

    // Collect all current results
    collectResults() {
        return {
            timestamp: new Date().toISOString(),
            vulnerabilities: window.scanResults?.vulnerabilities || [],
            databases: window.scanResults?.databases || [],
            tables: window.scanResults?.tables || [],
            dbmsInfo: window.scanResults?.dbmsInfo || null,
            consoleOutput: document.getElementById('console-output')?.innerText || ''
        };
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportManager;
}
