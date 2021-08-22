function helpMenu() {
    var menu = document.getElementById('help-menu')
    menu.classList.add('inverted')
    var helpMenuValues = [
        { name: 'Open Log Viewer', value: 'log', icon: 'terminal' },
        { name: 'Open Documentation Viewer', value: 'documentation', icon: 'file alternate' },
        { name: 'Check for updates', value: 'update', icon: 'sync alternate' }
    ]
    $(menu).dropdown({
        values: helpMenuValues,
        hideDividers: true,
        action: 'select',
        onChange: function () {
            var toOpen = $(this).dropdown('get value')
            if (toOpen != "update") {
                const toShow = './src/views/' + toOpen + '.html'
                let newWindow = new BrowserWindow({
                    width: 800,
                    height: 600,
                    webPreferences: {
                        enableRemoteModule: true,
                        nodeIntegration: true,
                        contextIsolation: false,
                        devTools: true,
                    },
                    resizable: false,
                    frame: false
                })
                var logDate = moment().format('YYYYMMDD@HH:mm:ss')
                var logMsg = '[' + logDate + ']: (INF) - The window "' + toOpen.toUpperCase() + '" was opened with the id ' + newWindow.id + '.\n'
                fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
                newWindow.loadFile(toShow)
                newWindow.show()
            //newWindow.webContents.openDevTools()
            } else {
                // fazer função de updates :D
                console.log("checking for update")
            }
            
        }
    })
}