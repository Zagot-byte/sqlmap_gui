const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('sqlmapAPI', {
    // Start SQLMap scan
    startScan: (options) => ipcRenderer.invoke('start-sqlmap', options),

    // Stop SQLMap scan
    stopScan: () => ipcRenderer.invoke('stop-sqlmap'),

    // Listen for SQLMap output
    onOutput: (callback) => ipcRenderer.on('sqlmap-output', (event, data) => callback(data)),

    // Listen for SQLMap errors
    onError: (callback) => ipcRenderer.on('sqlmap-error', (event, data) => callback(data)),

    // Listen for scan completion
    onComplete: (callback) => ipcRenderer.on('sqlmap-complete', (event, code) => callback(code)),

    // Project management
    saveProject: (project Data) => ipcRenderer.invoke('save-project', projectData),
        loadProject: (name) => ipcRenderer.invoke('load-project', name),
            listProjects: () => ipcRenderer.invoke('list-projects'),

                // Remove listeners
                removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback)
});
