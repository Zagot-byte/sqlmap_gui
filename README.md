🧨 SQLMap GUI

A modern, real-time web interface for sqlmap — built for pentesters, bug bounty hunters & security researchers.

<p align="center"> <img src="https://img.shields.io/badge/status-active-brightgreen"> <img src="https://img.shields.io/badge/python-3.11-blue"> <img src="https://img.shields.io/badge/sqlmap-supported-orange"> <img src="https://img.shields.io/badge/docker-supported-yellow"> </p>
🚀 Overview

SQLMap GUI brings a clean, fast, and fully interactive graphical interface to sqlmap, the world’s most popular SQL injection tool.

It replaces complex CLI commands with a structured web UI:

Real-time terminal logs (via SSE)

Panels for Basic, Advanced, Enumeration, Output, Sessions

Full sqlmap option mapping

Multi-scan support

Save & load configurations

Live status indicators

Zero-prompt batch mode for automation

If typing long sqlmap commands slows you down — this GUI is made for you.

✨ Features
🖥️ Modern GUI

Organized tabs (Basic / Advanced / Enumeration / Output / Sessions)

Clean UX for all sqlmap options

Input validation & live sliders

Configurable headers, delays, timeouts, UA strings, proxies, Tor, etc.

⚡ Real-Time Streaming

SSE-based instant stdout & stderr streaming

Auto reconnect

Timestamped terminal logs

Parallel scan support

Stop individual scans or stop all

🔍 Database Enumeration

Toggle enumeration flags easily:

Banner, Current User, Current DB

DB list, Table list, Column list

Dump & Dump-All

WHERE conditions

Row limit & pagination

DB / Table / Column selectors

🧬 Advanced Pentest Options

Techniques (BEUSTQ)

Tamper script selector (auto-fetched)

Risk & Level sliders

Forced DBMS

Proxy & Tor routing

Random User-Agent

Custom timeout/delay values

🧩 Session Manager

Save entire configuration into named sessions

Load previous sessions

Delete with one click

🛠️ Installation
Requirements

Python 3.10+

sqlmap source included in project

Flask + Gunicorn

Linux / macOS / Windows

⛵ Run Locally (Development)
1. Clone
git clone https://github.com/<yourname>/sqlmap-gui
cd sqlmap-gui

2. Install dependencies
pip install -r requirements.txt

3. Run server
python app.py

4. Open GUI

Visit:

http://localhost:5000

🐳 Docker (Production)
Build:
docker build -t sqlmap-gui .

Run:
docker run -p 5000:5000 sqlmap-gui


Your GUI is now available at:

http://localhost:5000

🧩 Project Structure
sqlmap-gui/
│
├── app.py                 # Flask backend with SSE streaming
├── templates/
│   └── index.html         # Main UI
├── static/
│   ├── css/style.css
│   └── js/script.js
│
├── sqlmap/                # Bundled sqlmap source (required)
│   └── sqlmap.py
│
├── requirements.txt
├── Dockerfile
└── README.md