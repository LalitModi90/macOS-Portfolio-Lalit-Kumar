const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,

  // Tab & Browser Navigation Commands
  createTab: (tabId, url) => ipcRenderer.send("browser:createTab", { tabId, url }),
  navigate: (tabId, url) => ipcRenderer.send("browser:navigate", { tabId, url }),
  goBack: (tabId) => ipcRenderer.send("browser:goBack", { tabId }),
  goForward: (tabId) => ipcRenderer.send("browser:goForward", { tabId }),
  reload: (tabId) => ipcRenderer.send("browser:reload", { tabId }),
  stop: (tabId) => ipcRenderer.send("browser:stop", { tabId }),
  switchTab: (tabId) => ipcRenderer.send("browser:switchTab", { tabId }),
  closeTab: (tabId) => ipcRenderer.send("browser:closeTab", { tabId }),
  updateBounds: (tabId, bounds) => ipcRenderer.send("browser:updateBounds", { tabId, bounds }),

  // Event Listeners (Main -> Renderer)
  onNavigate: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on("browser:did-navigate", listener);
    return () => ipcRenderer.removeListener("browser:did-navigate", listener);
  },
  onTitleUpdate: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on("browser:page-title-updated", listener);
    return () => ipcRenderer.removeListener("browser:page-title-updated", listener);
  },
  onFaviconUpdate: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on("browser:page-favicon-updated", listener);
    return () => ipcRenderer.removeListener("browser:page-favicon-updated", listener);
  },
  onLoadingState: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on("browser:loading-state", listener);
    return () => ipcRenderer.removeListener("browser:loading-state", listener);
  },
  onNewWindowTab: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on("browser:new-window-tab", listener);
    return () => ipcRenderer.removeListener("browser:new-window-tab", listener);
  }
});
