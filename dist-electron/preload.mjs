//#region electron/preload.js
var contextBridge = require("electron").contextBridge;
var ipcRenderer = require("electron").ipcRenderer;
contextBridge.exposeInMainWorld("nodejs", {
	send: (channel, data) => {
		ipcRenderer.send(channel, data);
	},
	on: (channel, func) => {
		ipcRenderer.on(channel, (event, ...args) => func(...args));
	},
	call: (channel, args) => {
		return ipcRenderer.invoke(channel, args);
	}
});
//#endregion
