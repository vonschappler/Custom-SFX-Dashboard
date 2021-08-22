var logZone = document.getElementById('logZone')

function checkInstall() {
    if (fs.existsSync("C:/Program Files/dashboard/")) {
        //window.alert(fs.existsSync("C:\\Program Files\\dashboard\\"))
        installFolder = ("C:/Program Files/dashboard/")
        //window.alert()

    } else {
        installFolder = ""
    }

    return installFolder
}

function resizeLog() {
    const win = remote.getCurrentWindow()
    var maxIcon = document.getElementById("max-icon")
    if (win.isMaximized()) {
        maxIcon.classList.remove('restore')
        maxIcon.classList.add('maximize')
        $(logZone).attr('rows', 26);
        win.unmaximize()
    } else {
        maxIcon.classList.add('restore')
        maxIcon.classList.remove('maximize')
        $(logZone).attr('rows', 58);
        win.maximize()
    }
}

function loadLog() {
    console.log("InstallFolder inside loadLog > ", installFolder)
    logChange('start')
    try {
        var logData = fs.readFileSync(installFolder + 'tmp/thisSession.log.tmp')
        logZone.value = logData.toString()
        $(logZone).scrollTop($(logZone)[0].scrollHeight)
    } catch (err) {
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (ERR) - Unable to open the log file this session log. (System Message: ' + err + ').\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    }
}

function reloadLog() {
    var selBtnIco = document.getElementById('selectBtnIcon')
    selBtnIco.classList.add('outline')
    var selBtnLbl = document.getElementById('selectBtnLabel')
    selBtnLbl.innerHTML = "Open a different log file..."
    var logDate = moment().format('YYYYMMDD@HH:mm:ss')
    var logMsg = '[' + logDate + ']: (INF) - Displaying now this session log.\n'
    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    loadLog()
}

function clearLogFolder() {
    var selBtnIco = document.getElementById('selectBtnIcon')
    selBtnIco.classList.add('outline')
    var selBtnLbl = document.getElementById('selectBtnLabel')
    selBtnLbl.innerHTML = "Open a different log file..."
    var logFiles = fs.readdirSync(installFolder + 'logs')
    try {
        logFiles.forEach((file) => {
            fs.unlink(installFolder + 'logs/' + file, (err)=> {
                if (err) {
                    console.error(err)
                } else {
                    var logDate = moment().format('YYYYMMDD@HH:mm:ss')
                    var logMsg = '[' + logDate + ']: (INF) - File ' + file + ' was removed from logs directory.\n'
                    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
                }
            })

        })
        
    } catch (err) {
        logDate = moment().format('YYYYMMDD@HH:mm:ss')
        logMsg = '[' + logDate + ']: (ERR) - Unable to delete one or more log file(s). (System Message: ' + err + ')\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    }
    createLogList()
}

function createLogList() {
    var fileDropdown = document.getElementById('fileList')
    var logFiles = fs.readdirSync(installFolder + 'logs')
    var dropdownHeader = { name: 'Past log files', type: 'header' }
    if (logFiles.length == 0) {
        var dropdownValues = []
        dropdownValues.push({ name: 'No log files found', value: null })
        dropdownValues.unshift(dropdownHeader)
    } else {
        dropdownValues = []
        logFiles.reverse().forEach(file => {
            var fileLength = fs.readFileSync(installFolder + 'logs/' + file).length
            if (fileLength != 0) {
                
                dropdownValues.push({ name: file, value: file, icon: 'file' })
                
            } else if (fileLength == 0) {
                dropdownValues.push({ name: 'No log files found', value: null })
            }
        })
        dropdownValues.unshift(dropdownHeader)
        if (dropdownValues.length > 2) {
            
            
            dropdownValues.splice(1, 1)
        }
    }
    
    $(fileDropdown).dropdown({
        values: dropdownValues,
        action: 'select',
        onChange: function() {
            $(logZone).scrollTop(0);
            var fileToOpen = $(this).dropdown('get value')
            if (fileToOpen != 'null') {
                var selBtnIco = document.getElementById('selectBtnIcon')
                selBtnIco.classList.remove('outline')
                var selBtnLbl = document.getElementById('selectBtnLabel')
                selBtnLbl.innerHTML = fileToOpen
                logChange('stop')
                try {
                    var logData = fs.readFileSync(installFolder + 'logs/' + fileToOpen)
                    logZone.value = logData.toString()
                    var logDate = moment().format('YYYYMMDD@HH:mm:ss')
                    var logMsg = '[' + logDate + ']: (INF) - Displaying now "' + fileToOpen + ' ".\n'
                    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
                } catch (err) {
                    logDate = moment().format('YYYYMMDD@HH:mm:ss')
                    logMsg = '[' + logDate + ']: (ERR) - Unable to open the log file "' + fileToOpen + '". (System Message: ' + err + ').\n'
                    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
                }
            }
        }
    })
}