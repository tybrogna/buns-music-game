import { BrowserWindow, app, ipcMain } from "electron";
import { readFile, readdir } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
//#region electron/main.js
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var mainWindow;
function createWindow() {
	console.log(path.join(__dirname, "./preload.js"));
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "./preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
			enableRemoteModule: false
		}
	});
	if (process.env.VITE_DEV_SERVER_URL) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
	else mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
}
ipcMain.handle("path.join", async (event, ...args) => {
	console.log(args);
	return path.join(args);
});
ipcMain.handle("test", async (event, folder) => {
	return {
		success: true,
		data: "hello"
	};
});
ipcMain.handle("filesInFolder", async (event, folder) => {
	try {
		let files = await readdir(folder);
		files.forEach((f) => console.log(f));
		return files;
	} catch (err) {
		console.log(err);
		return "";
	}
});
ipcMain.handle("readFile", async (event, file) => {
	try {
		let data = await readFile(file);
		return await JSON.parse(data);
	} catch (err) {
		console.log(err);
		return "";
	}
});
app.whenReady().then(() => {}).then(createWindow);
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
//#endregion
export {};
