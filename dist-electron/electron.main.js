import path, { join } from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow, globalShortcut } from "electron";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let win;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "false";
function createWindow() {
  win = new BrowserWindow({
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "rgba(0, 0, 0, 0)",
      height: 35,
      symbolColor: "#8B949E"
    },
    // 窗口图标
    icon: join(__dirname, "resource/logo.ico"),
    width: 1024,
    height: 768,
    webPreferences: {
      devTools: true
      // contextIsolation: false,
      // nodeIntegration: true,
      // preload: path.join(__dirname, 'preload.js')
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: "rights" });
  } else {
    win.loadFile(join(__dirname, "dist/index.html"));
  }
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
app.on("ready", () => {
  globalShortcut.register("Alt+k", () => {
    win.webContents.openDevTools();
    console.log(win.webContents.openDevTools);
    win.webContents.on("devtools-opened", () => {
      console.log("DevTools 已打开事件触发");
    });
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
    app.quit();
});
