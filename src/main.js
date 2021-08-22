// main.js

// Modules to control application life and create native browser window
const {app, BrowserWindow, screen, ipcMain, ipcRenderer} = require('electron')
const path = require('path')
const $ = require('jquery')
const log = require('electron-log')
const { autoUpdater } = require('electron-updater')
let win
const fs = require('fs')
const version = app.getVersion()

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info'
log.info('App starting...')

if(require('electron-squirrel-startup')) {
    app.quit()
}

function sendStatusToWindow(text) {
    log.info(text);
    win.webContents.send('message', text);
}

function createWindow(xSize, ySize) {
    var wXSize = Math.floor(xSize * 0.6)
    var wYSize = Math.floor(ySize * 0.545)
    // Create the browser window.
    win = new BrowserWindow({
        show: false,
        width: wXSize,
        height: wYSize,
        frame: false,
        closable: true,
        minimizable: true,
        resizable: false,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    // and load the index.html of the app.
    //win.loadFile(`src/main.html#v${app.getVersion()}`)
    win.loadFile('src/main.html')
    win.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
        win.show()
    })
    // Open the DevTools.
    //win.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    const primaryDisplay = screen.getPrimaryDisplay()
    const {width, height} = primaryDisplay.workAreaSize
    createWindow(width, height)
    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow(width, height)
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

console.log(ipcMain)

ipcMain.on('app_version', (ev) => {
    ev.sender.send('app_version', { version: app.getVersion() })
})

ipcMain.on('update_available', (ev) => {
    ev.sender.send('update_available')
}
)

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//-------------------------------------------------------------------
// Auto updates
//
// For details about these events, see the Wiki:
// https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
//
// The app doesn't need to listen to any events except `update-downloaded`
//
// Uncomment any of the below events to listen for them.  Also,
// look in the previous section to see them being used.
//-------------------------------------------------------------------
//autoUpdater.on('checking-for-update', () => {
//    sendStatusToWindow('Checking for update...');
//})

//autoUpdater.on('update-available', (ev, info) => {
//    sendStatusToWindow('Update available.');
//})

autoUpdater.on('update-not-available', (ev, info) => {
    sendStatusToWindow('Update not available.');
})

autoUpdater.on('error', (ev, err) => {
    sendStatusToWindow('Error in auto-updater.');
})

autoUpdater.on('download-progress', (ev, progressObj) => {
    sendStatusToWindow('Download progress...');
})

autoUpdater.on('update-available', (ev, info) => {
    sendStatusToWindow('Update available.');
    win.webContents.send('update_available')
    console.log("Update????")
})
// autoUpdater.on('update-not-available', (ev, info) => {
// })
// autoUpdater.on('error', (ev, err) => {
// })
// autoUpdater.on('download-progress', (ev, progressObj) => {
// })
autoUpdater.on('update-downloaded', (ev, info) => {
    sendStatusToWindow('Update downloaded; will install in 5 seconds');
    console.log("Downloaded???")
    win.webContents.send('update_downloaded')
})

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});