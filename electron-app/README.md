# SQLMap GUI

A modern, desktop GUI for [SQLMap](https://github.com/sqlmapproject/sqlmap) - the powerful SQL injection testing tool. Built with Electron for cross-platform compatibility.

![SQLMap GUI](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-GPL--2.0-green.svg)
![Platform](https://img.shields.io/badge/platform-Linux-lightgrey.svg)

## ✨ Features

- 🎨 **Modern UI** - Clean, intuitive interface with blue ocean theme
- 🛠️ **15 Option Panels** - Complete SQLMap functionality organized by category
- 📊 **Real-time Output** - Live console output and results parsing
- 💾 **Project Management** - Save and load scan configurations
- 📤 **Export Results** - Export to JSON, CSV, or HTML formats
- ⚙️ **Persistent Settings** - Customize SQLMap path, Python path, and UI preferences
- 🔍 **Advanced Options** - Full access to SQLMap's detection, enumeration, and exploitation features

### Option Panels

1. **Target** - URL, POST data, cookies, request files
2. **Request** - HTTP headers, proxy, Tor, timeouts
3. **Optimization** - Threads, verbosity, batch mode
4. **Injection** - Parameter selection, prefix/suffix
5. **Detection** - Level & risk sliders
6. **Techniques** - SQL injection techniques (BEUSTQ)
7. **Fingerprint** - DBMS fingerprinting
8. **Enumeration** - Database/table/column enumeration
9. **Brute Force** - Common tables/columns
10. **UDF** - User-defined function injection
11. **File System** - File read/write operations
12. **OS Access** - OS command execution
13. **Registry** - Windows registry access (Windows only)
14. **General** - Output directory, tamper scripts, safety options
15. **Miscellaneous** - Advanced options (crawl, forms, etc.)

## 📋 Requirements

- **Node.js** 14.x or higher
- **npm** 6.x or higher
- **Python** 3.x
- **Git** (for setup)
- **Internet connection** (for initial setup only)

## 🚀 Quick Start

### Installation

1. **Clone or download** this repository

2. **Make scripts executable**:
   ```bash
   chmod +x setup.sh run.sh
   ```

3. **Run setup** (downloads SQLMap and installs dependencies):
   ```bash
   ./setup.sh
   ```

### Running the Application

```bash
./run.sh
```

Or alternatively:
```bash
npm start
```

## 🔧 Manual Setup

If you prefer manual setup:

```bash
# 1. Download SQLMap
cd ..
git clone https://github.com/sqlmapproject/sqlmap.git sqlmap-dev
ln -s sqlmap-dev/sqlmap.py sqlmap.py

# 2. Create projects directory
mkdir -p projects

# 3. Install Node dependencies
cd electron-app  # or whatever you renamed this folder to
npm install

# 4. Run the app
npm start
```

## 📚 Usage

1. **Start the application** using `./run.sh` or `npm start`

2. **Configure your target**:
   - Enter target URL in the Target panel
   - Or upload a Burp Suite request file
   - Or configure POST data and cookies

3. **Set detection options**:
   - Adjust Level (1-5) for test intensity
   - Adjust Risk (1-3) for invasiveness

4. **Choose what to enumerate**:
   - Check boxes for databases, tables, columns, or dump

5. **Click "Start Scan"** to begin testing

6. **View results** in the Console or Results tab

7. **Save your configuration** using the "Save" button for later reuse

## ⚙️ Settings

Click the **Settings** button to configure:

- **SQLMap Path** - Path to sqlmap.py (default: `../sqlmap.py`)
- **Python Path** - Python executable (default: `python3`)
- **UI Preferences** - Auto-scroll console, timestamps
- **Default Output Directory** - Where to save scan results

## 📁 Project Structure

```
electron-app/
├── setup.sh              # Setup script (downloads SQLMap)
├── run.sh                # Run script
├── package.json          # Node.js dependencies
├── main.js               # Electron main process
├── preload.js            # Electron preload (IPC bridge)
├── src/
│   ├── index.html        # Main UI
│   ├── css/              # Stylesheets (10 files)
│   └── js/               # JavaScript modules (13 files)
└── assets/
    └── icons/            # Application icons
```

### Key JavaScript Modules

- `panel-loader.js` - Manages 15 option panels
- `frontend-init.js` - Main initialization
- `options-mapper.js` - Maps UI inputs to SQLMap CLI arguments
- `sqlmap-runner.js` - Manages SQLMap subprocess
- `output-parser.js` - Parses SQLMap output
- `results-viewer.js` - Displays parsed results
- `project-manager.js` - Save/load projects
- `export-manager.js` - Export results to JSON/CSV/HTML
- `settings-manager.js` - Persistent settings

## 🛠️ Development

### Run in Development Mode

```bash
npm start
```

### Build Distributable Package

```bash
# Build .deb package
npm run build:deb

# Build AppImage
npm run build:appimage

# Build both
npm run build:linux
```

Output will be in `dist/` directory.

## 🐛 Troubleshooting

### "SQLMap not found" error

Run the setup script again:
```bash
./setup.sh
```

### "Module not found" errors

Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Application won't start

Check that you have all requirements:
```bash
node --version   # Should be 14.x or higher
npm --version    # Should be 6.x or higher
python3 --version
```

### SQLMap execution errors

Verify SQLMap path in Settings:
- Click Settings button
- Check "SQLMap Path" points to `../sqlmap.py` or `../sqlmap-dev/sqlmap.py`
- Check "Python Path" is set to `python3` or your Python 3 executable

## 📄 License

This project is licensed under the GPL-2.0 License - same as SQLMap.

**Note**: This is a GUI wrapper for SQLMap. All SQLMap functionality and licensing belongs to the [SQLMap Project](https://github.com/sqlmapproject/sqlmap).

## 🙏 Credits

- **SQLMap** - [sqlmapproject/sqlmap](https://github.com/sqlmapproject/sqlmap)
- **Electron** - Cross-platform desktop framework
- **GUI Development** - SQLMap GUI Team

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the main [SQLMap documentation](https://github.com/sqlmapproject/sqlmap/wiki)
3. Open an issue on GitHub (if applicable)

## ⚠️ Disclaimer

This tool is for **educational and authorized testing purposes only**. Always obtain proper authorization before testing any systems. Unauthorized access to computer systems is illegal.

---

**Enjoy using SQLMap GUI!** 🚀
