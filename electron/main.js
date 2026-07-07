import { app, BrowserWindow, ipcMain } from 'electron';
import { readFile, readdir, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url';
import path from 'path';
//stolen from
// https://medium.com/@ignatovich.dm/how-to-set-up-an-electron-app-with-vite-95fa91795298
//check here too might be useful
// https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let mainWindow

function createWindow () {
    console.log(path.join(__dirname, './preload.js'))
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, './preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false,
        }
    })
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }
}

ipcMain.handle('path.join', async(event, ...args) => {
    console.log(args)
    return path.join(args)
})

ipcMain.handle('test', async (event, folder) => {
    return {success: true, data:'hello'}
})

ipcMain.handle('filesInFolder', async (event, folder) => {
    try {
        let files = await readdir(folder)
        return files
    } catch (err) { console.log(err); return '' }
})

ipcMain.handle('readFile', async (event, file) => {
    try {
        let data = await readFile(file)
        return await JSON.parse(data)
    } catch (err) { console.log(err); return '' }
})

ipcMain.handle('writeFile', async (event, args) => {
    try {
        await writeFile(args[0], JSON.stringify(args[1]))
    } catch (err) {
        console.log(err)
    }
})

app.whenReady().then(() => {
    //additional logic here
}).then(createWindow)

app.on('window-all-closed', () => {
    // eslint-disable-next-line no-undef
    if (process.platform !== 'darwin') {
        app.quit()
    }
})