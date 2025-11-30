# 🧨 SQLMap GUI

A modern, real-time web interface for sqlmap — built for pentesters, bug bounty hunters, and security researchers.

[![Status: Active](https://img.shields.io/badge/status-active-brightgreen)]()  
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue)]()  
[![sqlmap Supported](https://img.shields.io/badge/sqlmap-supported-orange)]()  
[![Docker Supported](https://img.shields.io/badge/docker-supported-yellow)]()

---

## 🚀 Overview

SQLMap GUI brings a clean, fast, and fully interactive graphical interface to sqlmap, the world’s most popular SQL injection tool.  
It replaces complex CLI commands with a structured web UI:

- Real-time terminal logs (via SSE)
- Panels for Basic, Advanced, Enumeration, Output, Sessions
- Full sqlmap option mapping
- Multi-scan support
- Save & load configurations
- Live status indicators
- Zero-prompt batch mode for automation

If typing long sqlmap commands slows you down — this GUI is made for you.

---

## ✨ Features

### 🖥️ Modern GUI

- Organized tabs (Basic / Advanced / Enumeration / Output / Sessions)  
- Clean UX for all sqlmap options  
- Input validation and live sliders  
- Configurable headers, delays, timeouts, UA strings, proxies, Tor, etc.

### ⚡ Real-Time Streaming

- SSE-based instant stdout and stderr streaming  
- Auto reconnect  
- Timestamped terminal logs  
- Parallel scan support  
- Stop individual scans or stop all

### 🔍 Database Enumeration

- Toggle enumeration flags easily:
  - Banner, Current User, Current DB
  - DB list, Table list, Column list
  - Dump and Dump-All
- WHERE conditions  
- Row limit and pagination  
- DB / Table / Column selectors

### 🧬 Advanced Pentest Options

- Techniques (BEUSTQ)  
- Tamper script selector (auto-fetched)  
- Risk and Level sliders  
- Forced DBMS  
- Proxy and Tor routing  
- Random User-Agent  
- Custom timeout/delay values

### 🧩 Session Manager

- Save entire configuration into named sessions  
- Load previous sessions  
- Delete with one click

---

## 🛠️ Installation Requirements

- Python 3.10+  
- sqlmap source included in project  
- Flask + Gunicorn  
- Linux / macOS / Windows

---

## ⛵ Run Locally (Development)

Clone the repository:

