/* ============================================
   Options Mapper - Map UI inputs to CLI arguments
   ============================================ */

const OptionsMapper = {
    // Build complete SQLMap CLI arguments from UI
    buildArguments() {
        const args = [];

        // --- TARGET OPTIONS ---
        const url = document.getElementById('target-url')?.value;
        if (url) args.push('-u', url);

        const usePost = document.getElementById('use-post')?.checked;
        const postData = document.getElementById('post-data')?.value;
        if (usePost && postData) args.push('--data', postData);

        const useCookie = document.getElementById('use-cookie')?.checked;
        const cookieData = document.getElementById('cookie-data')?.value;
        if (useCookie && cookieData) args.push('--cookie', cookieData);

        // Request file (Burp Suite format)
        const requestFile = document.getElementById('request-file')?.files[0];
        if (requestFile) args.push('-r', requestFile.path);

        // --- DETECTION OPTIONS ---
        const level = document.getElementById('level')?.value;
        if (level) args.push('--level', level);

        const risk = document.getElementById('risk')?.value;
        if (risk) args.push('--risk', risk);

        // --- ENUMERATION OPTIONS ---
        if (document.getElementById('get-dbs')?.checked) args.push('--dbs');
        if (document.getElementById('get-tables')?.checked) args.push('--tables');
        if (document.getElementById('get-columns')?.checked) args.push('--columns');
        if (document.getElementById('dump-table')?.checked) args.push('--dump');
        if (document.getElementById('dump-all')?.checked) args.push('--dump-all');

        const currentDb = document.getElementById('current-db')?.value;
        if (currentDb) args.push('-D', currentDb);

        const currentTable = document.getElementById('current-table')?.value;
        if (currentTable) args.push('-T', currentTable);

        const currentColumns = document.getElementById('current-columns')?.value;
        if (currentColumns) args.push('-C', currentColumns);

        // --- TECHNIQUES OPTIONS ---
        const technique = document.getElementById('technique')?.value;
        if (technique && technique !== 'ALL') args.push('--technique', technique);

        // --- GENERAL OPTIONS ---
        if (document.getElementById('batch')?.checked) args.push('--batch');
        if (document.getElementById('force-ssl')?.checked) args.push('--force-ssl');

        const threads = document.getElementById('threads')?.value;
        if (threads && threads !== '1') args.push('--threads', threads);

        const verbose = document.getElementById('verbose')?.value;
        if (verbose && verbose !== '1') args.push('-v', verbose);

        // --- OPTIMIZATION OPTIONS ---
        if (document.getElementById('keep-alive')?.checked) args.push('--keep-alive');
        if (document.getElementById('null-connection')?.checked) args.push('--null-connection');
        if (document.getElementById('predict-output')?.checked) args.push('--predict-output');

        // --- INJECTION OPTIONS ---
        const testParameter = document.getElementById('test-parameter')?.value;
        if (testParameter) args.push('-p', testParameter);

        const skipParam = document.getElementById('skip')?.value;
        if (skipParam) args.push('--skip', skipParam);

        const dbms = document.getElementById('dbms')?.value;
        if (dbms && dbms !== 'auto') args.push('--dbms', dbms);

        const os = document.getElementById('os')?.value;
        if (os && os !== 'auto') args.push('--os', os);

        // --- REQUEST OPTIONS ---
        const userAgent = document.getElementById('user-agent')?.value;
        if (userAgent) args.push('--user-agent', userAgent);

        const referer = document.getElementById('referer')?.value;
        if (referer) args.push('--referer', referer);

        const headers = document.getElementById('headers')?.value;
        if (headers) {
            headers.split('\n').forEach(header => {
                if (header.trim()) args.push('--header', header.trim());
            });
        }

        const proxy = document.getElementById('proxy')?.value;
        if (proxy) args.push('--proxy', proxy);

        if (document.getElementById('random-agent')?.checked) args.push('--random-agent');

        // --- TAMPER SCRIPTS ---
        const tamperScripts = document.getElementById('tamper')?.value;
        if (tamperScripts) args.push('--tamper', tamperScripts);

        // --- FINGERPRINT OPTIONS ---
        if (document.getElementById('fingerprint-extensive')?.checked) args.push('-f');
        if (document.getElementById('fingerprint-banner')?.checked) args.push('--banner');
        if (document.getElementById('current-user')?.checked) args.push('--current-user');
        if (document.getElementById('hostname')?.checked) args.push('--hostname');
        if (document.getElementById('is-dba')?.checked) args.push('--is-dba');

        // --- BRUTE FORCE ---
        if (document.getElementById('common-tables')?.checked) args.push('--common-tables');
        if (document.getElementById('common-columns')?.checked) args.push('--common-columns');

        // --- FILE SYSTEM ACCESS ---
        const fileRead = document.getElementById('file-read')?.value;
        if (fileRead) args.push('--file-read', fileRead);

        const fileWrite = document.getElementById('file-write')?.value;
        if (fileWrite) args.push('--file-write', fileWrite);

        const fileDest = document.getElementById('file-dest')?.value;
        if (fileDest) args.push('--file-dest', fileDest);

        // --- OS ACCESS ---
        if (document.getElementById('os-cmd-chk')?.checked) args.push('--os-cmd');
        if (document.getElementById('os-shell-chk')?.checked) args.push('--os-shell');
        if (document.getElementById('os-pwn-chk')?.checked) args.push('--os-pwn');
        if (document.getElementById('os-smbrelay')?.checked) args.push('--os-smbrelay');

        // --- REGISTRY ACCESS ---
        if (document.getElementById('reg-read')?.checked) args.push('--reg-read');
        if (document.getElementById('reg-add')?.checked) args.push('--reg-add');
        if (document.getElementById('reg-del')?.checked) args.push('--reg-del');

        const regKey = document.getElementById('reg-key')?.value;
        if (regKey) args.push('--reg-key', regKey);

        const regValue = document.getElementById('reg-value')?.value;
        if (regValue) args.push('--reg-value', regValue);

        // --- MISCELLANEOUS ---
        if (document.getElementById('flush-session')?.checked) args.push('--flush-session');
        if (document.getElementById('fresh-queries')?.checked) args.push('--fresh-queries');
        if (document.getElementById('crawl')?.checked) {
            args.push('--crawl');
            const crawlDepth = document.getElementById('crawl-depth')?.value;
            if (crawlDepth) args.push('--crawl-depth', crawlDepth);
        }
        if (document.getElementById('forms')?.checked) args.push('--forms');
        if (document.getElementById('tor')?.checked) args.push('--tor');
        if (document.getElementById('check-tor')?.checked) args.push('--check-tor');

        const outputDir = document.getElementById('output-dir')?.value;
        if (outputDir) args.push('--output-dir', outputDir);

        const delay = document.getElementById('delay')?.value;
        if (delay) args.push('--delay', delay);

        const timeout = document.getElementById('timeout')?.value;
        if (timeout) args.push('--timeout', timeout);

        return args;
    },

    // Get all current option values as an object
    getAllOptions() {
        const options = {};

        // Get all input values
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (!input.id) return;

            if (input.type === 'checkbox') {
                options[input.id] = input.checked;
            } else if (input.type === 'file') {
                options[input.id] = input.files[0] ? input.files[0].path : null;
            } else {
                options[input.id] = input.value;
            }
        });

        return options;
    },

    // Set all option values from an object
    setAllOptions(options) {
        if (!options) return;

        Object.keys(options).forEach(key => {
            const input = document.getElementById(key);
            if (!input) return;

            if (input.type === 'checkbox') {
                input.checked = options[key];
            } else if (input.type !== 'file') {
                input.value = options[key] || '';
            }
        });
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptionsMapper;
}
