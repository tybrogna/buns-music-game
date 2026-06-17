import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { readdir } from 'fs/promises'
import { fileURLToPath } from 'url';
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

ipcMain.handle('testhello', async (event, folder) => {
    return {success: true, data:'hello'}
    // try {
    //     let files = await readdir(folder)
    //     files.forEach(f => console.log(f))
    //     return files
    // } catch (err) { console.log(err); return '' }
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