const { remote } = require("electron")
const electron = require("electron")
const path = require('path')
//const version = app.getVersion()
//const { autoUpdater } = require('electron-updater')
const BrowserWindow = electron.remote.BrowserWindow
const fs = require('fs')
const moment = require('moment')
const { createSign } = require("crypto")

let previousVal
let watcher
let value
let folder
let formValidated
let logFile
let sfxSelectValues = []
let installFolder = ""


function createList(selectList, form, rules) {
    try {
        dirChange(folder, 'start', 'refresh-sfx')
        const sfxSettings = fs.readFileSync(installFolder + 'rsc/sfx.json', 'utf-8')
        data = JSON.parse(sfxSettings)
        sfxData = data['sfx']
        if (typeof (folder) !== "undefined" || folder != null) {
            defaultSFXFolder = folder
        } else {
            data = JSON.parse(settingsFile)
            defaultSFXFolder = data['defaultFolder']
        }
        fs.readdir(defaultSFXFolder, function (err, files) {
            if (err) {
                var newErr = new Error()
                newErr.name = 'Unknown error'
                newErr.message = err.message
                throw newErr
            }
            if (!$.isEmptyObject(sfxData[0])) {
                for (var i = 0; i < sfxData.length; i++) {
                    sfxSelectValues.push({ name: sfxData[i]['file'], value: sfxData[i]['path'] })
                }
            } else {
                files.forEach(function (file) {
                    var filelist = []
                    filelist.push(file)
                    sfxSelectValues.push({ 'name': file, 'value': folder + "\\" + file })
                })
            }
            updateList(selectList, form, rules)
            $('#'+selectList).dropdown({
                placeholder: 'Available files...',
                values: sfxSelectValues,
                clearable: true,
                sortSelect: true,
                allowAdditions: true,
                onChange: function (value) {
                    var prevButton = document.getElementById('preview-sfx')
                    if (value !== '') {
                        prevButton.classList.remove('disabled')
                    } else {
                        prevButton.classList.add('disabled')
                    }
                    validateForm("#" + form, rules)
                }
            })
        })

    } catch (err) {
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ': ' + newErr.message + '\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        showModal('missingSettings_modal', 'scriptSettings')

    }
    return sfxSelectValues
}

function updateList(selectList, form, rules) {
    var oldSFXSelectValues = sfxSelectValues
    sfxSelectValues = []
    const sfxSettings = fs.readFileSync(installFolder + 'rsc/sfx.json', (err) => {
        if (err) {
            var newErr = new Error()
            newErr.name = 'Unknown error'
            logDate = moment().format('YYYYMMDD@HH:mm:ss')
            logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ': ' + Err.message + '\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        } else {
            data = JSON.parse(sfxSettings)
        }
        
    })
    sfxData = data['sfx']
    var filelist = []
    filelist = fs.readdirSync(folder)
    for (var i = 0; i < filelist.length; i++) {
        filelist[i] = { name: filelist[i], value: folder + '\\' + filelist[i] }
    }
    sfxSelectValues = filelist.concat(oldSFXSelectValues)
    var filteredValues = getUniqueListBy(sfxSelectValues, 'value')
    $('#' + selectList).dropdown({
        placeholder: 'Available files...',
        values: filteredValues,
        clearable: true,
        allowAdditions: true,
        forceSelection: false,
        onChange: function (value) {
            var prevButton = document.getElementById('preview-sfx')
            if (value !== '') {
                prevButton.classList.remove('disabled')
            } else {
                prevButton.classList.add('disabled')
            }
            validateForm("#"+ form, rules)
        }
    })
    sfxSelectValues = filteredValues
    var logDate = moment().format('YYYYMMDD@HH:mm:ss')
    var logMsg = '[' + logDate + ']: (SUC) - Sound effects file list was updated successfully.\n'
    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    dirChange(folder, 'stop', 'refresh-sfx')
    if (form != 'edt-sfx-form') {
        $('#' + selectList).dropdown('clear')
    } else {
        $('#sfx-select').dropdown('set selected', previousVal)
    }
    return sfxSelectValues
}

function dirChange(dir, mode, btn) {
    var toClick = document.getElementById(btn)
    if (mode == "start") {
        watcher = fs.watch(dir, function (event, filename) {
            if (event === "rename") {
                var logDate = moment().format('YYYYMMDD@HH:mm:ss')
                var logMsg = '[' + logDate + ']: (INF) - Changes were detected on sound effects folder "' + dir + '"\n'
                fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
                toClick.classList.remove('disabled')
            }
        })
    } else if (mode == 'stop') {
        toClick.classList.add('disabled')
    }
}

function getUniqueListBy(arr, key) {
    var unique = [...new Map(arr.map(item => [item[key], item])).values()]
    var newUnique = []
    unique.forEach((element) => {
        if (fs.existsSync(element['value'])) {
            newUnique.push(element)
        }
    })
    return newUnique

}

const logChange = function(mode) {
    if (fs.existsSync("C:/Program Files/dashboard/")) {
        //window.alert(fs.existsSync("C:\\Program Files\\dashboard\\"))
        installFolder = ("C:/Program Files/dashboard/")
        //window.alert()

    } else {
        installFolder = ""
    }
    console.log("InstallFolder inside log change > ", installFolder)
    if (mode == "start") {
        watcher = fs.watch(installFolder + 'tmp/thisSession.log.tmp', function (event, filename) {
            var logData = fs.readFileSync(installFolder + 'tmp/thisSession.log.tmp')
            var logZone = document.getElementById('logZone')
    
            if (logZone) {
                if (event === "change") {
                    logZone.value = logData.toString();
                    $(logZone).scrollTop($(logZone)[0].scrollHeight)
                }
            }
        })
    } else if (mode == 'stop') {
        watcher.close()
    }
}

function closeAllWindows() {
    const winList = BrowserWindow.getAllWindows()
     
    var logDate = moment().format('YYYYMMDD@HH:mm:ss')
    var logMsg = '[' + logDate + ']: (SUC) - The application "[Custom SFX v2.0.0] - Dashboard" was finished succesffuly and all required temporary files created during this session were deleted.'
    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    cleanThisSessionFiles()
    for (var win = 0; win < winList.length; win++) {
        winList[win].close()
    }

}

async function cleanThisSessionFiles() {
    var tempFilesFolder = installFolder + 'tmp/'
    //window.alert(tempFilesFolder)
    fs.readdir(tempFilesFolder, function (err, files) {
        //window.alert(files)
        if (err) {
            var newErr = new Error()
            newErr.name = 'Unknown error'
            var logDate = moment().format('YYYYMMDD@HH:mm:ss')
            var logMsg = '[' + logDate + ']: (ERR) - '+ newErr.name + ': '+ err.message +')\n'
            //window.alert(logMsg)
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        } else {
            fs.copyFileSync(installFolder + 'tmp/thisSession.log.tmp', logFile)
            files.forEach(function (file) {
                //window.alert(file)
                var filePath = tempFilesFolder + file
                fs.unlinkSync(filePath)
            })
        }
    })
    //window.alert("Completed")
    
}

function closeWindow() {
    const win = remote.getCurrentWindow()
    var logDate = moment().format('YYYYMMDD@HH:mm:ss')
    var logMsg = '[' + logDate + ']: (INF) - The window ' + win.id + ' was closed.\n'
    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    win.close()

}

function minimizeWindow() {
    const win = remote.getCurrentWindow()
    win.minimize()
}

function maxmizeWindow() {
    const win = remote.getCurrentWindow()
    var maxIcon = document.getElementById("max-icon")
    if (win.isMaximized()) {
        maxIcon.classList.remove('restore')
        maxIcon.classList.add('maximize')
        win.unmaximize()
    } else {
        maxIcon.classList.add('restore')
        maxIcon.classList.remove('maximize')
        win.maximize()
    }
}

function startPage(a) {
    try {
        var settingsFileRead = fs.readFileSync('rsc/settings.json')
        var settingsDataRead = JSON.parse(settingsFileRead)
        folder = settingsDataRead['defaultFolder']
        switch (a) {
            case 'scriptSettings': {
                $("#content").load('views/scriptSettings.html')
                document.getElementById('selectedMenu').innerHTML = "Getting Started:"
                document.getElementById('helpSelected').innerHTML = "Everything you need to know"
                break
            }
            case 'manual':
                $("#content-docs").load('manual.html')
                document.getElementById('selectedMenu').innerHTML = "Help:"
                document.getElementById('helpSelected').innerHTML = "Documentation of the script"
                break
        }

    } catch (err) {
        newErr = new Error()
        newErr.name = 'First start'
        newErr.message = 'This is the first time you execute this application. Some required files need to be created or imported from "[Custom SFX v1.0.0]" Streamlabs Chatbot Script in order to use "[Custom SFX v2.0.0] - Dashboard". Check details on the provided documentation.'
        switch (a) {
            case 'scriptSettings': {
                $("#content").load('views/scriptSettings.html')
                document.getElementById('selectedMenu').innerHTML = "Getting Started:"
                document.getElementById('helpSelected').innerHTML = "Everything you need to know"
                date = moment().format('YYYYMMDD_HHmmss')
                logDate = moment().format('YYYYMMDD@HH:mm:ss')
                logFile = installFolder + 'logs/' + date + ".log"
                logMsg = '[' + logDate + ']: (SUC) - The application "[Custom SFX v2.0.0] - Dashboard" started succesfully.\n'
                break
            }
            case 'manual':
                $("#content-docs").load('manual.html')
                document.getElementById('selectedMenu').innerHTML = "Help:"
                document.getElementById('helpSelected').innerHTML = "Documentation of the script"
                break
        }
        logDate = moment().format('YYYYMMDD@HH:mm:ss')
        logMsg = '[' + logDate + ']: (WAR) - '+ newErr.name +': ' + newErr.message +'\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    }
}

function loadPage(a) {
    var menuBar = document.getElementById("tool-bar")
    var menuItems = menuBar.getElementsByClassName('item')
    var newUrl = 'views/' + a + '.html';
    switch (a) {
        case ('scriptSettings'): 
            menuItems[0].classList.add('active')
            menuItems[1].classList.remove('active')
            menuItems[2].classList.remove('active')
            menuItems[3].classList.remove('active')
            document.getElementById('selectedMenu').innerHTML = "Script settings:"
            document.getElementById('helpSelected').innerHTML = "Manage general settings for the script"
            break
        case ("addSFX"): 
            menuItems[0].classList.remove('active')
            menuItems[1].classList.add('active')
            menuItems[2].classList.remove('active')
            menuItems[3].classList.remove('active')
            document.getElementById('selectedMenu').innerHTML = "Add custom sound effect:"
            document.getElementById('helpSelected').innerHTML = "Add a new custom sound effects using this simple form"
            break
        case ("sfxList"): 
            menuItems[0].classList.remove('active')
            menuItems[1].classList.remove('active')
            menuItems[2].classList.add('active')
            menuItems[3].classList.remove('active')
            document.getElementById('selectedMenu').innerHTML = "Sound effects manager:"
            document.getElementById('helpSelected').innerHTML = "Manage and control all SFX at once"
            break
        case ("about"):
            menuItems[0].classList.remove('active')
            menuItems[1].classList.remove('active')
            menuItems[2].classList.remove('active')
            menuItems[3].classList.add('active')
            document.getElementById('selectedMenu').innerHTML = "About:"
            document.getElementById('helpSelected').innerHTML = "General information about the script"
            break
    }
    
    $('#content').fadeOut(1000, function () {
        $('#content').hide().load(newUrl, function () {
            var logDate = moment().format('YYYYMMDD@HH:mm:ss')
            var logMsg = '[' + logDate + ']: (INF) - The view was changed to "' + a.toUpperCase() + '".\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
            $('#content').fadeIn(1000);
            document.getElementById('content').scrollTo(0, 0);
        });
    });
}

function showModal(toLoad, destiny, method) {
    var modal = document.getElementById('modal')
    $(modal).load('views/' + toLoad + '.html', function () {
        $("#modal")
            .modal({
                onShow: function () {
                    var logDate = moment().format('YYYYMMDD@HH:mm:ss')
                    var logMsg = '[' + logDate + ']: (INF) - Displaying overlayed modal "' + toLoad.toUpperCase() + '".\n'
                    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
                },
                dimmerSettings: { opacity: 0.5 },
                blurring: true,
                inverted: true,
                closable: false,
                onApprove: function () {
                    if (typeof(method) !== 'undefined')
                        method();
                    $(".ui.modal").modal('hide');
                    $("body").append("<div id=\"modal\" class=\"ui modal\"></div>");
                    loadPage(destiny)
                }
            })
            .modal('setting', 'transition', 'fade', 'closable', false)
            .modal('show');
    })
}

function validateForm(formId, validationRules) {
    var evaluateForm = formId
    $(evaluateForm).form(validationRules);
    var logDate = moment().format('YYYYMMDD@HH:mm:ss')
    var logMsg = '[' + logDate + ']: (INF) - The form "' + evaluateForm.split('#')[1].toUpperCase() + '" evaluation is being processed after load, change and/or submit.\n'
    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
}

function openWindow(a) {
    const toShow = './src/views/'+ a +'.html'
    let newWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
        },
        frame: false
    })
    var logDate = moment().format('YYYYMMDD@HH:mm:ss')
    var logMsg = '[' + logDate + ']: (INF) - The window "' + a.toUpperCase() + '" was opened with the id ' + newWindow.id + '.\n'
    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    newWindow.loadFile(toShow)
    newWindow.show()
    //newWindow.webContents.openDevTools()
}

function startApplication() {
    //window.alert(process.cwd())
    if (fs.existsSync("C:/Program Files/dashboard/")) {
        //window.alert(fs.existsSync("C:\\Program Files\\dashboard\\"))
        installFolder = ("C:/Program Files/dashboard/")
        //window.alert()
        
    } else {
        installFolder = ""
    }
    if (!fs.existsSync(installFolder + 'effects')) {
        console.log('Creating effects folder')
        fs.mkdirSync(installFolder + 'effects')

    }
    if (!fs.existsSync(installFolder + 'rsc')) {
        console.log('Creating rsc folder')
        fs.mkdirSync(installFolder + 'rsc')
    }
    if (!fs.existsSync(installFolder + 'backups')) {
        console.log('Creating backups folder')
        fs.mkdirSync(installFolder + 'backups')
    }
    if (!fs.existsSync(installFolder + 'backups/settings')) {
        console.log('Creating backups/settings folder')
        fs.mkdirSync(installFolder + 'backups/settings')
    }
    if (!fs.existsSync(installFolder + 'backups/sfx')) {
        console.log('Creating backups folder')
        fs.mkdirSync(installFolder + 'backups/sfx')
    }
    if (!fs.existsSync(installFolder + 'logs')) {
        console.log('Creating logs folder')
        fs.mkdirSync(installFolder + 'logs')
    }
    if (!fs.existsSync(installFolder + 'tmp')) {
        console.log('Creating temporary files folder')
        fs.mkdirSync(installFolder + 'tmp')
    }
    try {
        fs.readdir(installFolder + 'logs', function (err, files) {
            if (err) {
                newErr = new Error()
                newErr.name = "Unknown error"
                logDate = moment().format('YYYYMMDD@HH:mm:ss')
                logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ': ' + err.message + '\n'
                fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
                throw newErr
            } else {
                for (var i in files) {
                    var length = fs.readFileSync(installFolder + 'logs/' + files[i]).length
                    if (length === 0) {
                        fs.unlink(installFolder + 'logs/' + files[i], (err) => {
                            if (err) {
                                newErr = new Error()
                                newErr.name = "Unknown error"
                                logDate = moment().format('YYYYMMDD@HH:mm:ss')
                                logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ': ' + err.message + '\n'
                                fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
                                throw newErr
                            }
                        })
                    }
                }
            }
            
            
        })
        var date = moment().format('YYYYMMDD_HHmmss')
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        logFile = installFolder + 'logs/' + date + ".log"
        var logMsg = '[' + logDate + ']: (SUC) - The application "[Custom SFX v2.0.0] - Dashboard" started succesfully.\n'
        fs.writeFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg, 'utf8')
        fs.writeFileSync(logFile, '', 'utf8')

    } catch (err) {
        newErr = new Error()
        newErr.name = "Unknown error"
        logDate = moment().format('YYYYMMDD@HH:mm:ss')
        logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ': ' + err.message + '\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    }
    //autoUpdater.checkForUpdatesAndNotify();

    console.log("InstallFolder inside startApplication > ", installFolder)

    return installFolder
    
}

/* autoUpdater.on('checking-for-update', () => {
    document.getElementById('version').innerHTML += " (checking for updates...)"
})

autoUpdater.on('update-available', (ev, info) => {
    win.webContents.send('update_available')
    console.log("Update????")
    $('body')
        .toast({
            message: 'A new version of this Dashboard is availlabe. Do you want to download and install it now?',
            displayTime: 0,
            class: 'black',
            actions: [{
                text: 'Yes',
                icon: 'check',
                class: 'teal',
                click: function () {
                    ipcRenderer.on('update_available', () => {
                        ipcRenderer.removeAllListeners('update_available');
                        message.innerText = 'A new update is available. Downloading now...';
                        notification.classList.remove('hidden');
                    });
                }
            }, {
                icon: 'close',
                text: "Later",
                class: 'red',
                click: function () {
                    ipcRenderer.removeAllListeners('update_available');
                    $(this).toast('hide')
                }
            }]
        })
        ;
})

autoUpdater.on('update-downloaded', (ev, info) => {
    console.log("Downloaded???")
    win.webContents.send('update_downloaded')
})

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
}); */