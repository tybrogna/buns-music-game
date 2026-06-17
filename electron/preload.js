//stolen from
// https://medium.com/@ignatovich.dm/how-to-set-up-an-electron-app-with-vite-95fa91795298

// import { contextBridge, ipcRenderer } from 'electron'
const contextBridge = require('electron').contextBridge;
const ipcRenderer = require('electron').ipcRenderer;

contextBridge.exposeInMainWorld('eapi', {
    send: (channel, data) => {
        ipcRenderer.send(channel, data)
    },
    on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args))
    },
    call: (channel, args) => {
        console.log('the preload')
        return ipcRenderer.invoke(channel, args)
    },
});

console.log('preload')