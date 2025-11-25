/* ============================================
   Output Parser - Parse SQLMap output
   ============================================ */

const OutputParser = {
    // Parse log level from output line
    parseLogLevel(line) {
        if (line.includes('[CRITICAL]')) return 'critical';
        if (line.includes('[ERROR]')) return 'error';
        if (line.includes('[WARNING]')) return 'warning';
        if (line.includes('[INFO]')) return 'info';
        if (line.includes('[DEBUG]')) return 'debug';
        return 'info';
    },

    // Check if line contains vulnerability finding
    isVulnerability(line) {
        const vulnKeywords = [
            'vulnerable',
            'injectable',
            'SQL injection',
            'parameter',
            'appears to be',
            'is vulnerable'
        ];
        return vulnKeywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()));
    },

    // Check if line contains database names
    isDatabaseInfo(line) {
        return line.includes('available databases') ||
            line.includes('[*]') && (line.includes('database') || line.includes('schema'));
    },

    // Check if line contains table names
    isTableInfo(line) {
        return line.includes('tables') && (line.includes('[*]') || line.includes('Table:'));
    },

    // Parse database names from output
    parseDatabases(output) {
        const databases = [];
        const lines = output.split('\n');
        let inDatabasesSection = false;

        for (const line of lines) {
            if (line.includes('available databases')) {
                inDatabasesSection = true;
                continue;
            }

            if (inDatabasesSection && line.trim().startsWith('[*]')) {
                const dbMatch = line.match(/\[\*\]\s+(.+)/);
                if (dbMatch) {
                    databases.push(dbMatch[1].trim());
                }
            }

            // Stop when we hit a new section
            if (inDatabasesSection && line.includes('[INFO]') && !line.includes('[*]')) {
                break;
            }
        }

        return databases;
    },

    // Parse tables from output
    parseTables(output) {
        const tables = [];
        const lines = output.split('\n');

        for (const line of lines) {
            if (line.trim().startsWith('[*]') && !line.includes('database')) {
                const tableMatch = line.match(/\[\*\]\s+(.+)/);
                if (tableMatch) {
                    tables.push(tableMatch[1].trim());
                }
            }
        }

        return tables;
    },

    parseOutput(rawOutput) {
        const result = {
            level: this.detectLogLevel(rawOutput),
            message: rawOutput,
            timestamp: new Date().toISOString(),
            vulnerabilities: [],
            databases: [],
            tables: [],
            dbms: null,
            parameters: [],
            technique: null
        };

        // Detect vulnerabilities with more patterns
        const vulnPatterns = [
            /vulnerable/i,
            /injection point/i,
            /exploitable/i,
            /parameter: ([\w]+) is vulnerable/i,
            /Type: ([\w\s-]+)/i,
            /Title: (.+)/i,
            /Payload: (.+)/i
        ];

        vulnPatterns.forEach(pattern => {
            if (pattern.test(rawOutput)) {
                const match = rawOutput.match(pattern);
                result.vulnerabilities.push({
                    type: match[1] || 'SQL Injection',
                    parameter: this.extractParameter(rawOutput),
                    payload: this.extractPayload(rawOutput),
                    severity: this.determineSeverity(rawOutput)
                });
            }
        });

        // Extract DBMS information
        const dbmsMatch = rawOutput.match(/(?:back-end DBMS|web application technology|web server):\s*([^\n]+)/i);
        if (dbmsMatch) {
            result.dbms = dbmsMatch[1].trim();
        }

        // Extract database names (improved pattern)
        const dbMatches = rawOutput.match(/(?:database|schema)[\s:]*['"]?(\w+)['"]?/gi);
        if (dbMatches) {
            dbMatches.forEach(match => {
                const dbName = match.match(/['"]?(\w+)['"]?$/)[1];
                if (dbName && !result.databases.includes(dbName)) {
                    result.databases.push(dbName);
                }
            });
        }

        // Extract table names
        const tableMatches = rawOutput.match(/(?:Table|table)[\s:]*['"]?(\w+)['"]?/gi);
        if (tableMatches) {
            tableMatches.forEach(match => {
                const tableName = match.match(/['"]?(\w+)['"]?$/)[1];
                if (tableName && !result.tables.includes(tableName)) {
                    result.tables.push(tableName);
                }
            });
        }

        // Extract vulnerable parameters
        const paramMatch = rawOutput.match(/(?:parameter|parameter '|testing) ([\w]+)/i);
        if (paramMatch) {
            result.parameters.push(paramMatch[1]);
        }

        // Detect injection technique used
        const techniquePatterns = {
            'Boolean-based blind': /boolean-based blind/i,
            'Error-based': /error-based/i,
            'UNION query': /union query/i,
            'Stacked queries': /stacked queries/i,
            'Time-based blind': /time-based blind/i
        };

        Object.entries(techniquePatterns).forEach(([name, pattern]) => {
            if (pattern.test(rawOutput)) {
                result.technique = name;
            }
        });

        return result;
    },

    extractParameter(output) {
        const match = output.match(/parameter[:\s]+['"]?(\w+)['"]?/i);
        return match ? match[1] : 'unknown';
    },

    extractPayload(output) {
        const match = output.match(/payload[:\s]+(.+?)(?:\n|$)/i);
        return match ? match[1].trim() : '';
    },

    determineSeverity(output) {
        if (/critical/i.test(output)) return 'critical';
        if (/high/i.test(output)) return 'high';
        if (/time-based|boolean/i.test(output)) return 'medium';
        return 'low';
    },

    // Parse vulnerability details
    parseVulnerability(output) {
        const vulnerability = {
            found: false,
            parameter: null,
            type: null,
            payload: null
        };

        const lines = output.split('\n');

        for (const line of lines) {
            // Check for parameter
            if (line.includes('Parameter:')) {
                const paramMatch = line.match(/Parameter:\s+(.+)/i);
                if (paramMatch) vulnerability.parameter = paramMatch[1].trim();
            }

            // Check for type
            if (line.includes('Type:')) {
                const typeMatch = line.match(/Type:\s+(.+)/i);
                if (typeMatch) vulnerability.type = typeMatch[1].trim();
            }

            // Check for payload
            if (line.includes('Payload:')) {
                const payloadMatch = line.match(/Payload:\s+(.+)/i);
                if (payloadMatch) vulnerability.payload = payloadMatch[1].trim();
            }

            // Mark as found if we detect vulnerability keywords
            if (this.isVulnerability(line)) {
                vulnerability.found = true;
            }
        }

        return vulnerability;
    },

    // Format output line for console display
    formatOutputLine(line) {
        const level = this.parseLogLevel(line);
        const timestamp = formatTimestamp();

        const entry = createElement('div', `log-entry log-${level}`);

        const timeEl = createElement('span', 'timestamp', `[${timestamp}]`);
        const levelEl = createElement('span', 'level', level.toUpperCase());
        const messageEl = createElement('span', 'message');
        messageEl.textContent = line;

        entry.appendChild(timeEl);
        entry.appendChild(levelEl);
        entry.appendChild(messageEl);

        // Special styling for vulnerabilities
        if (this.isVulnerability(line)) {
            entry.classList.add('vulnerability');
        }

        if (this.isDatabaseInfo(line)) {
            entry.classList.add('database');
        }

        return entry;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OutputParser;
}
