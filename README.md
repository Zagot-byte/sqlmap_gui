# 🧨 SQLMap GUI

A modern, real-time web interface for **sqlmap** — built for pentesters, bug bounty hunters & security researchers.

![Status: Active](https://img.shields.io/badge/status-active-brightgreen)
![Python 3.11](https://img.shields.io/badge/python-3.11-blue)
![sqlmap Supported](https://img.shields.io/badge/sqlmap-supported-orange)
![Docker Supported](https://img.shields.io/badge/docker-supported-yellow)

---

## 🚀 Overview

**SQLMap GUI** brings a clean, fast, and fully interactive graphical interface to **sqlmap**, the world’s most popular SQL injection tool.

It replaces long CLI commands with a structured, intuitive web UI:

- Real-time terminal logs (SSE)
- Rich Basic / Advanced / Enumeration panels
- Multi-scan support
- Session saving & loading
- Stop/Stop-All functionality
- Zero-prompt batch mode for automation
- WebSockets-style live updates (via SSE)

---

## ✨ Features

### 🖥️ Clean Modern Interface
- Organized tabs (Basic / Advanced / Enumeration / Output / Sessions)
- Live status indicators
- Animated terminals
- Real-time scan tracking

### ⚡ Real-Time Streaming (SSE)
- Instant stdout/stderr output
- Timestamped terminal lines
- Auto-reconnect
- Parallel scanning

### 🔍 Database Enumeration
- Toggle common enumeration flags
- Table/Column/DB selection
- Dump & Dump-All

### 🧬 Advanced Options
- Techniques (BEUSTQ)
- Risk/Level sliders
- Tamper scripts
- Forced DBMS
- Proxy & Tor
- Timeouts, delays, threads

### 🗂️ Session Manager
- Save, load & delete configurations

---

## 🛠️ Requirements
- Python **3.10+**
- sqlmap (auto-downloaded in Docker)
- Flask
- Linux/macOS/Windows

---

## ⛵ Running Locally

```bash
git clone https://github.com/<your-user>/sqlmap_gui
cd sqlmap_gui
pip install -r requirements.txt
python app.py
```

Open:

```
http://localhost:5000
```

---

## 🐳 Docker

### Build:
```bash
docker build -t sqlmap_gui .
```

### Run:
```bash
docker run --rm -p 5000:5000 sqlmap_gui
```

GUI:

```
http://localhost:5000
```

---

## 📁 Structure

```
sqlmap_gui/
├── app.py
├── templates/index.html
├── static/css/style.css
├── static/js/script.js
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## 📜 Legal Disclaimer
Use sqlmap and this GUI **only on systems you own or have permission to test**.

---

## ⭐ Support
Star the repo if you enjoy it!
