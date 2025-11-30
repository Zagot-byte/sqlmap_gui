// ===== Global State =====
const state = {
    activeScans: new Map(), // scanId -> { es, terminated }
    currentTab: 'basic',
    tampers: [],
    dbmsList: []
};

// ===== DOM elements placeholder (filled after DOM ready) =====
let elements = {};

// ===== Initialization AFTER DOM Loaded =====
document.addEventListener("DOMContentLoaded", () => {
    elements = {
        // Tabs
        tabBtns: document.querySelectorAll(".tab-btn"),
        tabContents: document.querySelectorAll(".tab-content"),

        // Status
        statusDot: document.getElementById("statusDot"),
        statusText: document.getElementById("statusText"),
        stopAllScans: document.getElementById("stopAllScans"),

        // Basic Tab
        url: document.getElementById("url"),
        postData: document.getElementById("postData"),
        batch: document.getElementById("batch"),
        threads: document.getElementById("threads"),
        threadsValue: document.getElementById("threadsValue"),
        verbosity: document.getElementById("verbosity"),
        startBasicScan: document.getElementById("startBasicScan"),

        // Advanced Tab
        technique: document.getElementById("technique"),
        dbms: document.getElementById("dbms"),
        level: document.getElementById("level"),
        levelValue: document.getElementById("levelValue"),
        risk: document.getElementById("risk"),
        riskValue: document.getElementById("riskValue"),
        tamper: document.getElementById("tamper"),
        proxy: document.getElementById("proxy"),
        tor: document.getElementById("tor"),
        delay: document.getElementById("delay"),
        timeout: document.getElementById("timeout"),
        userAgent: document.getElementById("userAgent"),
        randomAgent: document.getElementById("randomAgent"),

        // Enumeration Tab
        getBanner: document.getElementById("getBanner"),
        getCurrentUser: document.getElementById("getCurrentUser"),
        getCurrentDb: document.getElementById("getCurrentDb"),
        getDbs: document.getElementById("getDbs"),
        getTables: document.getElementById("getTables"),
        getColumns: document.getElementById("getColumns"),
        dump: document.getElementById("dump"),
        dumpAll: document.getElementById("dumpAll"),
        dbName: document.getElementById("dbName"),
        tableName: document.getElementById("tableName"),
        columnName: document.getElementById("columnName"),
        excludeSysDbs: document.getElementById("excludeSysDbs"),
        dumpWhere: document.getElementById("dumpWhere"),
        limitStart: document.getElementById("limitStart"),
        limitStop: document.getElementById("limitStop"),

        // Output
        terminalContainer: document.getElementById("terminalContainer"),

        // Sessions
        sessionName: document.getElementById("sessionName"),
        saveSession: document.getElementById("saveSession"),
        sessionList: document.getElementById("sessionList")
    };

    initTabs();
    initSliders();
    initEventListeners();
    loadTamperScripts();
    loadDBMSList();
    loadSessions();
});

// ===== Tabs =====
function initTabs() {
    elements.tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabName = btn.dataset.tab;
            elements.tabBtns.forEach(b => b.classList.toggle("active", b === btn));
            elements.tabContents.forEach(c => c.classList.toggle("active", c.id === tabName));
            state.currentTab = tabName;
        });
    });
}

// ===== Sliders =====
function initSliders() {
    if (elements.threads) {
        elements.threads.addEventListener("input", (e) => {
            elements.threadsValue.textContent = e.target.value;
        });
    }
    if (elements.level) {
        elements.level.addEventListener("input", (e) => {
            elements.levelValue.textContent = e.target.value;
        });
    }
    if (elements.risk) {
        elements.risk.addEventListener("input", (e) => {
            elements.riskValue.textContent = e.target.value;
        });
    }
}

// ===== Events =====
function initEventListeners() {
    if (elements.startBasicScan) elements.startBasicScan.addEventListener("click", startScan);
    if (elements.stopAllScans) elements.stopAllScans.addEventListener("click", stopAllScans);
    if (elements.saveSession) elements.saveSession.addEventListener("click", saveSession);
}

// ===== API Helper =====
async function apiCall(endpoint, method = "GET", body = null) {
    const options = { method, headers: { "Content-Type": "application/json" } };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(endpoint, options);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
    }
    return res.status === 204 ? null : await res.json();
}

// ===== Load tampers & dbms =====
async function loadTamperScripts() {
    try {
        const data = await apiCall("/api/tampers");
        if (data.tampers && elements.tamper) {
            elements.tamper.innerHTML = data.tampers.map(t => `<option value="${t}">${t}</option>`).join("");
        }
    } catch (e) {
        console.warn("Failed to load tampers:", e);
    }
}

async function loadDBMSList() {
    try {
        const data = await apiCall("/api/dbms");
        if (data.dbms && elements.dbms) {
            elements.dbms.innerHTML = `<option value="">Auto-detect</option>` + data.dbms.map(d => `<option value="${d}">${d}</option>`).join("");
        }
    } catch (e) {
        console.warn("Failed to load dbms list:", e);
    }
}

// ===== Collect form data =====
function collectFormData() {
    return {
        url: elements.url.value.trim(),
        data: elements.postData.value.trim() || null,
        batch: elements.batch.checked,
        threads: parseInt(elements.threads.value || 5),
        verbose: parseInt(elements.verbosity.value || 1),

        technique: elements.technique.value,
        dbms: elements.dbms.value || null,
        level: parseInt(elements.level.value || 1),
        risk: parseInt(elements.risk.value || 1),
        tamper: Array.from(elements.tamper?.selectedOptions || []).map(o => o.value).join(",") || null,
        proxy: elements.proxy.value.trim() || null,
        tor: elements.tor.checked,
        delay: parseFloat(elements.delay.value || 0),
        timeout: parseInt(elements.timeout.value || 30),
        user_agent: elements.userAgent.value.trim() || null,
        random_agent: elements.randomAgent.checked,

        get_banner: elements.getBanner.checked,
        current_user: elements.getCurrentUser.checked,
        current_db: elements.getCurrentDb.checked,
        dbs: elements.getDbs.checked,
        tables: elements.getTables.checked,
        columns: elements.getColumns.checked,
        dump: elements.dump.checked,
        dump_all: elements.dumpAll.checked,
        db: elements.dbName.value.trim() || null,
        tbl: elements.tableName.value.trim() || null,
        col: elements.columnName.value.trim() || null,
        exclude_sysdbs: elements.excludeSysDbs.checked,
        where: elements.dumpWhere.value.trim() || null,
        start: elements.limitStart.value ? parseInt(elements.limitStart.value) : null,
        stop: elements.limitStop.value ? parseInt(elements.limitStop.value) : null
    };
}

// ===== Start scan =====
async function startScan() {
    let data;
    try {
        data = collectFormData();
        if (!data.url) throw new Error("Target URL is required");
    } catch (e) {
        return showError(e.message);
    }

    elements.startBasicScan.disabled = true;
    elements.startBasicScan.textContent = "⏳ Starting...";

    try {
        const res = await apiCall("/scan", "POST", data);
        const scanId = res.scan_id;
        createTerminal(scanId, data.url);
        connectSSE(scanId);
        switchTab("output");
        updateStatus("scanning", "Scanning...");
    } catch (e) {
        showError("Failed to start scan: " + e.message);
    } finally {
        elements.startBasicScan.disabled = false;
        elements.startBasicScan.textContent = "🚀 Start Scan";
    }
}

// ===== SSE (EventSource) connection =====
function connectSSE(scanId) {
    const es = new EventSource(`/ws/scan/${scanId}`);

    es.onopen = () => {
        console.log(`SSE open for ${scanId}`);
        state.activeScans.set(scanId, { es, terminated: false });
        elements.stopAllScans.style.display = "block";
    };

    es.onmessage = (evt) => {
        const raw = evt.data;
        try {
            const msg = JSON.parse(raw);
            handleSSEMessage(scanId, msg);
        } catch (e) {
            appendToTerminal(scanId, raw);
        }
    };

    es.onerror = (err) => {
        console.warn("SSE error", err);
        appendToTerminal(scanId, "SSE connection error", "error");
        const entry = state.activeScans.get(scanId);
        if (!entry || entry.terminated) {
            es.close();
        }
    };
}

// ===== Handle messages from SSE =====
function handleSSEMessage(scanId, message) {
    const { type, data } = message;
    switch (type) {
        case "stdout":
            appendToTerminal(scanId, data);
            break;
        case "stderr":
            appendToTerminal(scanId, data, "error");
            break;
        case "info":
            appendToTerminal(scanId, data, "info");
            break;
        case "warning":
            appendToTerminal(scanId, data, "warning");
            break;
        case "error":
            appendToTerminal(scanId, `ERROR: ${data}`, "error");
            showError(data);
            break;
        case "complete":
            appendToTerminal(scanId, "✓ Scan completed", "info");
            terminateScan(scanId);
            updateStatus("ready", "Ready");
            break;
        default:
            appendToTerminal(scanId, `[${type}] ${data}`);
    }
}

// ===== Terminal UI =====
function createTerminal(scanId, url) {
    const placeholder = elements.terminalContainer.querySelector(".terminal-placeholder");
    if (placeholder) placeholder.remove();

    const terminal = document.createElement("div");
    terminal.className = "terminal";
    terminal.id = `terminal-${scanId}`;

    terminal.innerHTML = `
        <div class="terminal-header">
            <div class="terminal-title">Scan #${scanId.slice(0,8)} - ${url}</div>
            <div class="terminal-actions">
                <button class="terminal-action" onclick="clearTerminal('${scanId}')">Clear</button>
                <button class="terminal-action" onclick="stopScan('${scanId}')">Stop</button>
            </div>
        </div>
        <div class="terminal-body" id="terminal-body-${scanId}"></div>
    `;

    elements.terminalContainer.appendChild(terminal);
}

function appendToTerminal(scanId, text, type = "normal") {
    const body = document.getElementById(`terminal-body-${scanId}`);
    if (!body) return;

    const line = document.createElement("div");
    line.className = `terminal-line ${type}`;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
}

function clearTerminal(scanId) {
    const body = document.getElementById(`terminal-body-${scanId}`);
    if (body) body.innerHTML = "";
}

// ===== Stop/terminate logic =====
async function stopScan(scanId) {
    const entry = state.activeScans.get(scanId);
    if (!entry) return;

    appendToTerminal(scanId, "Requesting server to stop scan...", "warning");

    try {
        const res = await apiCall(`/scan/${scanId}/stop`, "POST");
        appendToTerminal(scanId, `Server response: ${JSON.stringify(res)}`, "info");
    } catch (e) {
        appendToTerminal(scanId, `Stop request failed: ${e.message}`, "error");
    }

    // close local SSE connection
    try {
        entry.terminated = true;
        entry.es?.close();
    } catch (e) {
        console.warn("Failed to close EventSource:", e);
    }

    state.activeScans.delete(scanId);
    if (state.activeScans.size === 0) {
        elements.stopAllScans.style.display = "none";
        updateStatus("ready", "Ready");
    }
}

function terminateScan(scanId) {
    const entry = state.activeScans.get(scanId);
    if (entry) {
        entry.terminated = true;
        try { entry.es?.close(); } catch (e) {}
    }
    state.activeScans.delete(scanId);
}

// ===== Stop all scans =====
function stopAllScans() {
    for (const id of Array.from(state.activeScans.keys())) {
        stopScan(id);
    }
}

// ===== Status & Alerts =====
function updateStatus(status, text) {
    if (elements.statusText) elements.statusText.textContent = text;
    if (elements.statusDot) elements.statusDot.className = `status-dot ${status}`;
}

function showError(message) {
    const alert = document.createElement("div");
    alert.className = "alert alert-danger";
    alert.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;padding:12px 18px;border-radius:6px;background:#f44336;color:white;";
    alert.textContent = `⚠ ${message}`;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 5000);
}

function showSuccess(message) {
    const alert = document.createElement("div");
    alert.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;padding:12px 18px;border-radius:6px;background:#00c853;color:white;";
    alert.textContent = `✓ ${message}`;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// ===== Sessions management =====
async function saveSession() {
    const name = elements.sessionName.value.trim();
    if (!name) return showError("Please enter a session name");

    const config = collectFormData();
    try {
        await apiCall("/session/save", "POST", { name, timestamp: new Date().toISOString(), config });
        elements.sessionName.value = "";
        showSuccess("Session saved");
        loadSessions();
    } catch (e) {
        showError("Failed to save session: " + e.message);
    }
}

async function loadSessions() {
    try {
        const data = await apiCall("/session/list");
        const sessions = data.sessions || [];
        elements.sessionList.innerHTML = sessions.length ? sessions.map(s => `
            <div class="session-card">
                <div class="session-name">${s.name}</div>
                <div class="session-meta">${new Date(s.timestamp).toLocaleString()}</div>
                <div class="session-actions-btns">
                    <button class="btn btn-secondary" onclick="loadSession('${s.id}')">Load</button>
                    <button class="btn btn-danger" onclick="deleteSession('${s.id}')">Delete</button>
                </div>
            </div>
        `).join("") : `<div class="empty-state">No saved sessions</div>`;
    } catch (e) {
        elements.sessionList.innerHTML = `<div class="empty-state">Failed to load sessions</div>`;
    }
}

async function loadSession(id) {
    try {
        const data = await apiCall(`/session/${id}`);
        const config = data.config || {};
        elements.url.value = config.url || "";
        elements.postData.value = config.data || "";
        elements.batch.checked = config.batch !== false;
        elements.threads.value = config.threads || 5;
        elements.threadsValue.textContent = config.threads || 5;
        elements.verbosity.value = config.verbose || 1;
        switchTab("basic");
        showSuccess("Session loaded");
    } catch (e) {
        showError("Failed to load session");
    }
}

async function deleteSession(id) {
    if (!confirm("Delete this session?")) return;
    try {
        await apiCall(`/session/${id}`, "DELETE");
        loadSessions();
    } catch (e) {
        showError("Failed to delete session");
    }
}
