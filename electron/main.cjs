const { app, BrowserWindow, WebContentsView, ipcMain, shell } = require("electron");
const path = require("path");

let mainWindow = null;
const viewsMap = new Map(); // tabId -> WebContentsView instance
let activeTabId = null;

function isValidHttpUrl(testUrl) {
  if (!testUrl || typeof testUrl !== "string") return false;
  try {
    const parsed = new URL(testUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 880,
    minWidth: 900,
    minHeight: 600,
    title: "macOS Safari Portfolio",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      webviewTag: false
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    mainWindow.loadURL(devServerUrl);
  }

  // Prevent unauthorized top-level navigation of the main application window
  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    const isDev = !app.isPackaged && navigationUrl.startsWith(devServerUrl);
    const isLocal = app.isPackaged && navigationUrl.startsWith("file://");
    if (!isDev && !isLocal) {
      event.preventDefault();
    }
  });

  // Handle downloads securely
  mainWindow.webContents.session.on("will-download", (event, item) => {
    item.setSavePath(path.join(app.getPath("downloads"), item.getFilename()));
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    viewsMap.clear();
  });
}

// IPC Browser Commands
ipcMain.on("browser:createTab", (_event, { tabId, url }) => {
  if (!mainWindow || !url || !isValidHttpUrl(url)) return;

  try {
    const view = new WebContentsView({
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true
      }
    });

    viewsMap.set(tabId, view);

    // Synchronize navigation events
    view.webContents.on("did-navigate", (_e, navUrl) => {
      if (mainWindow) {
        mainWindow.webContents.send("browser:did-navigate", { tabId, url: navUrl });
      }
    });

    view.webContents.on("did-navigate-in-page", (_e, navUrl) => {
      if (mainWindow) {
        mainWindow.webContents.send("browser:did-navigate", { tabId, url: navUrl });
      }
    });

    view.webContents.on("page-title-updated", (_e, title) => {
      if (mainWindow) {
        mainWindow.webContents.send("browser:page-title-updated", { tabId, title });
      }
    });

    view.webContents.on("page-favicon-updated", (_e, favicons) => {
      if (mainWindow && favicons && favicons.length > 0) {
        mainWindow.webContents.send("browser:page-favicon-updated", { tabId, favicon: favicons[0] });
      }
    });

    view.webContents.on("did-start-loading", () => {
      if (mainWindow) {
        mainWindow.webContents.send("browser:loading-state", { tabId, isLoading: true });
      }
    });

    view.webContents.on("did-stop-loading", () => {
      if (mainWindow) {
        mainWindow.webContents.send("browser:loading-state", { tabId, isLoading: false });
      }
    });

    // Handle new window requests by opening a new tab inside the application
    view.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
      if (mainWindow && isValidHttpUrl(targetUrl)) {
        mainWindow.webContents.send("browser:new-window-tab", { url: targetUrl });
      }
      return { action: "deny" };
    });

    view.webContents.loadURL(url);
  } catch (err) {
    console.error("Failed to create WebContentsView tab:", err);
  }
});

ipcMain.on("browser:navigate", (_event, { tabId, url }) => {
  if (!url || !isValidHttpUrl(url)) return;
  const view = viewsMap.get(tabId);
  if (view) {
    view.webContents.loadURL(url);
  }
});

ipcMain.on("browser:goBack", (_event, { tabId }) => {
  const view = viewsMap.get(tabId);
  if (view && view.webContents.canGoBack()) {
    view.webContents.goBack();
  }
});

ipcMain.on("browser:goForward", (_event, { tabId }) => {
  const view = viewsMap.get(tabId);
  if (view && view.webContents.canGoForward()) {
    view.webContents.goForward();
  }
});

ipcMain.on("browser:reload", (_event, { tabId }) => {
  const view = viewsMap.get(tabId);
  if (view) {
    view.webContents.reload();
  }
});

ipcMain.on("browser:stop", (_event, { tabId }) => {
  const view = viewsMap.get(tabId);
  if (view) {
    view.webContents.stop();
  }
});

ipcMain.on("browser:switchTab", (_event, { tabId }) => {
  if (!mainWindow) return;
  activeTabId = tabId;
  const view = viewsMap.get(tabId);
  if (view) {
    if (!mainWindow.contentView.children.includes(view)) {
      mainWindow.contentView.addChildView(view);
    }
  }
});

ipcMain.on("browser:closeTab", (_event, { tabId }) => {
  if (!mainWindow) return;
  const view = viewsMap.get(tabId);
  if (view) {
    if (mainWindow.contentView.children.includes(view)) {
      mainWindow.contentView.removeChildView(view);
    }
    viewsMap.delete(tabId);
  }
});

ipcMain.on("browser:updateBounds", (_event, { tabId, bounds }) => {
  if (!mainWindow || !bounds) return;
  const view = viewsMap.get(tabId);
  if (view) {
    view.setBounds({
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height)
    });
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
