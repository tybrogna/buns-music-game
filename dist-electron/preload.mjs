//#region electron/preload.js
var contextBridge = require("electron").contextBridge;
var ipcRenderer = require("electron").ipcRenderer;
contextBridge.exposeInMainWorld("eapi", {
	send: (channel, data) => {
		ipcRenderer.send(channel, data);
	},
	on: (channel, func) => {
		ipcRenderer.on(channel, (event, ...args) => func(...args));
	},
	call: (channel, args) => {
		console.log("the preload");
		return ipcRenderer.invoke(channel, args);
	}
});
console.log("preload");
//#endregion
