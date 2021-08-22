var passed
var data = ""
var loadedSettingsFile
var importedSettingsFile
var reqSettingsFormCheck = [{
        element: 'input#folder-display',
        valid: false
    }, {
        element: 'input#delay-display',
        valid: false
    }
]
var settingsFormRules = {
    revalidate: true,
    inline: true,
    on: 'blur'||'change'||'submit', 
    delay: false,
    fields: {
        folder_display: {
            identifier: 'folder_display',
            rules: [{
                type: 'empty',
                prompt: 'Please select the default location for your sound effects files.'
            }, {
                type: 'existDir',
                prompt: 'Unable to find the entered directory path on your system. Be sure to enter a path to an existent directory.'
            }] 
        },
        delay_display: {
            identifier: 'delay_display',
            rules: [{
                type: 'empty',
                prompt: 'Please enter the desired delay between sound effects.'
            }, {
                type: 'greaterThan[0]',
                prompt: 'The value provided has to be greater than or equal to {ruleValue}.'
            }]
        },
        limit_display: {
            identifier: 'limit_display',
            depends: 'limit_check',
            rules: [{
                type: 'empty',
                prompt: 'Please enter the desired maximum sound effects that can be triggered with a simple command usage.'
            }, {
                type: 'integer',
                prompt: 'The value provided is not supported. Please use only interger numbers .'
            }, {
                type: 'greaterThan[2]',
                prompt: 'The value provided has to be greater than or equal to {ruleValue}.'
            }]
        },
        no_sfx_entry_display: {
            identifier: 'no_sfx_entry_display',
            depends: 'no_sfx_entry_check',
            rules: [{
                type: 'empty',
                prompt: 'Please enter the desired message to be displayed in chat.'
            }, {
                type: 'containsExactly[{user}]',
                prompt: 'The message to be sent MUST contain the terms {user} on it.'
            }]
        },
        over_limit_display: {
            identifier: 'over_limit_display',
            depends: 'over_limit_check',
            rules: [{
                type: 'empty',
                prompt: 'Please enter the desired message to be displayed in chat.'
            }, {
                type: 'containsExactly[{user}]',
                prompt: 'The message to be sent MUST contain the terms {user}, {count} and {limit} on it.'
            }, {
                type: 'containsExactly[{count}]',
                prompt: 'The message to be sent MUST contain the terms {user}, {count} and {limit} on it.'
            }, {
                type: 'containsExactly[{limit}]',
                prompt: 'The message to be sent MUST contain the terms {user}, {count} and {limit} on it.'
            }]
        },
        no_sfx_display: {
            identifier: 'no_sfx_display',
            depends: 'no_sfx_check',
            rules: [{
                type: 'empty',
                prompt: 'Please enter the desired message to be displayed in chat.'
            }, {
                type: 'containsExactly[{user}]',
                prompt: 'The message to be sent MUST contain the terms {user} and {sfx} on it.'
            }, {
                type: 'containsExactly[{sfx}]',
                prompt: 'The message to be sent MUST contain the terms {user} and {sfx} on it.'
            }]
        },
        no_points_display: {
            identifier: 'no_points_display',
            depends: 'no_points_check',
            rules: [{
                type: 'empty',
                prompt: "Please enter the desired message to be displayed in chat."
            }, {
                type: 'containsExactly[{user}]',
                prompt: 'The message to be sent MUST contain the terms {user}, {sfx}, {currency} and {cost} on it.'
            }, {
                type: 'containsExactly[{sfx}]',
                prompt: 'The message to be sent MUST contain the terms {user}, {sfx}, {currency} and {cost} on it.'
            }, {
                type: 'containsExactly[{cost}]',
                prompt: 'The message to be sent MUST contain the terms {user}, {sfx}, {currency} and {cost} on it.'
            },
            {
                type: 'containsExactly[{currency}]',
                prompt: 'The message to be sent MUST contain the terms {user}, {sfx}, {currency} and {cost} on it.'
            }]
        }
    },
    onValid: function() {
        var $that = $(this[0]);
        reqSettingsFormCheck.forEach(function (r) {
            if ($that.is(r.element)) {
                r.valid = true;
            }
        });
        var formIsValid = reqSettingsFormCheck.reduce(function (a, b) {
            return a && b.valid;
        }, true);
        if (formIsValid) {
            var logDate = moment().format('YYYYMMDD@HH:mm:ss')
            var logMsg = '[' + logDate + ']: (SUC) - The form "settings-form" was succesfully validated.\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        }
    },
    onInvalid: function() {
        var $that = $(this[0]);
        reqSettingsFormCheck.forEach(function (r) {
            if ($that.is(r.element)) {
                r.valid = false;
            }
        });
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (ERR) - One or more fields could not be validated on the form "settings-form".\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        
    }
}

$.fn.form.settings.rules.greaterThan = function (inputValue, validationValue) {
    return inputValue >= validationValue;
}

$.fn.form.settings.rules.existDir = function (inputValue, validationValue) {
    if (fs.existsSync(inputValue)) {
        return inputValue
    }
}

function fillSettingsForm() {
    try {
        const settingsFile = fs.readFileSync(installFolder + 'rsc/settings.json', 'utf8')
        data = JSON.parse(settingsFile)
        var folderDisplay = document.getElementById('folder-display')
        var delayDisplay = document.getElementById('delay-display')
        var limitCheckDisplay = document.getElementById('limit-check')
        var limitDisplay = document.getElementById('limit-display')
        var noSFXEntryCheckDisplay = document.getElementById('no-sfx-entry-check')
        var noSFXEntryDisplay = document.getElementById('no-sfx-entry-display')
        var overLimitCheckDisplay = document.getElementById('over-limit-check')
        var overLimitDisplay = document.getElementById('over-limit-display')
        var noSFXCheckDisplay = document.getElementById('no-sfx-check')
        var noSFXDisplay = document.getElementById('no-sfx-display')
        var noPointsCheckDisplay = document.getElementById('no-points-check')
        var noPointsDisplay = document.getElementById('no-points-display')
        var folderValue = data['defaultFolder']
        folder = folderValue
        folderDisplay.setAttribute('value', folderValue)
        var delayValue = data['delay']
        delayDisplay.setAttribute('value', delayValue)
        var limitDisplayValue = data['limitSFXCount']
        limitDisplay.setAttribute('value', limitDisplayValue)
        var noSFXEntryDisplayValue = data['noSFXEntryMsg']
        noSFXEntryDisplay.setAttribute('value', noSFXEntryDisplayValue)
        var overLimitDisplayValue = data['overLimitMsg']
        overLimitDisplay.setAttribute('value', overLimitDisplayValue)
        var noSFXDisplayValue = data['noSFXMsg']
        noSFXDisplay.setAttribute('value', noSFXDisplayValue)
        var noPointsDisplayValue = data['noPointsMsg']
        noPointsDisplay.setAttribute('value', noPointsDisplayValue)
        var limitCheckValue = data['limitSFX']
        var noSFXEntryCheckValue = data['displayNoSFXEntry']
        var overLimitCheckValue = data['displayOverLimit']
        var noSFXCheckValue = data['displayNoSFX']
        var noPointsCheckValue = data['displayNoPoints']
        var checkboxesDisplay = [limitCheckDisplay, noSFXEntryCheckDisplay, overLimitCheckDisplay, noSFXCheckDisplay, noPointsCheckDisplay]
        var checkboxesValue = [limitCheckValue, noSFXEntryCheckValue, overLimitCheckValue, noSFXCheckValue, noPointsCheckValue]
        for(var i=0; i<checkboxesDisplay.length; i++) {
            if (checkboxesValue[i] == true) {
                checkboxesDisplay[i].setAttribute('checked', 'true')
                document.getElementById('disabled' + i).classList.remove('disabled')
            } else {
                checkboxesDisplay[i].removeAttribute('checked')
                document.getElementById('disabled' + i).classList.add('disabled')
            }
        }
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (SUC) - The file "settings.json" was loaded successfully and is ready for edition.\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    } catch (err) {
        var newErr = new Error()
        newErr.name = 'Unable to load file'
        newErr.message = 'The required file "settings.json" is missing on your system. Opening the window to create or import the required file.'
        logDate = moment().format('YYYYMMDD@HH:mm:ss')
        logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ': ' + newErr.message +'\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        showModal('newSettingsFile_modal', 'scriptSettings', createSettingsFile)
    }
    if (typeof (folder) === "undefined") {
        var value = ""
    } else {
        value = folder
    }
}

function createSettingsFile() {
    var info = ''
    try {
        info = importSettingsFile()
    } catch (err){
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (INF) - A blank template of "settings.json" file will be created.\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        info =  writeBlankSettingsFile()
    }
    fs.writeFile(installFolder + 'rsc/settings.json', info, 'utf8', (err) => {
        if (err) {
            var newErr = new Error()
            newErr.name = "Unknown error"
            logDate = moment().format('YYYYMMDD@HH:mm:ss')
            logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ': ' + err.message +'\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        }
    })
}

function cancelSettingsImport() {
    importedSettingsFile = null
    data = ""
    document.getElementById('settings-select').value = null
    document.getElementById('settings-confirm').classList.add('hidden')
    document.getElementById('settings-cancel').classList.add('hidden')
    document.getElementById('settings-submit').classList.remove('hidden')
    document.getElementById('settings-select-btn').innerHTML = 'Import previous "settings.json" file...'
    document.getElementById('settings-select-btn').classList.remove('disabled')
    var logDate = moment().format('YYYYMMDD@HH:mm:ss')
    var logMsg = '[' + logDate + ']: (INF) - User canceled the "settings.json" import process.\n'
    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    
}

function getSettingsFileContents(filename) {
    const fileImported = fs.readFileSync(filename['path'])
    passed = null
    try {
        var content = JSON.parse(fileImported)
        passed = ckcImpSettingsKey(content)
        if (passed == true) {
            data = content
        } else {
            data = null
        }
    } catch (err) {
        var url = filename['path']
        $.ajax({
            url: url,
            dataType: 'json',
            async: false,
            success: function (fileContent) {
                passed = ckcImpSettingsKey(fileContent)
                if (passed == true) {
                    data = ""
                    data = fileContent

                } else {
                    data = null
                }
            }
        })
    }
    if (passed == true ) {
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (INF) - The selected file "' + filename['path'] + '" was processed for import.\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    } else {
        var newErr = new Error()
        newErr.name = "Invalid data format"
        newErr.message = 'The data inside the file "' + filename['path'] + '" does not match the required format to proceed.'
        logDate = moment().format('YYYYMMDD@HH:mm:ss')
        logMsg = '[' + logDate + ']: (ERR) - '+ newErr.name + ': '+ newErr.message +'\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    }
}

function ckcImpSettingsKey(jsonData) {
    var keyList = Object.keys(jsonData)
    var pass = []
    var requiredKeys = ['delay', 'sfxLimit', 'sfxMaxCount', 'displayError', 'errorChat', 'displayNoPoints', 'noPointsChat']
    requiredKeys.forEach(function(element) {
        pass.push(keyList.includes(element)?true:false)
    })
    if (pass.includes(false)) {
        passed = false
    } else {
        passed = true
    }
    return passed
}

function importSettingsFile(e) {
    if (typeof (importedSettingsFile) === 'undefined' || importedSettingsFile == null){
        var toImport = $(document.getElementById('settings-select')).val()
        importedSettingsFile = e.target.files[0]
    }
    getSettingsFileContents(importedSettingsFile)
    if (toImport != "" || toImport != null) {
        document.getElementById('settings-select-btn').innerHTML = "Selected file: " + importedSettingsFile['name']
        document.getElementById('settings-select-btn').classList.add('disabled')
        document.getElementById('settings-confirm').classList.remove('hidden')
        document.getElementById('settings-cancel').classList.remove('hidden')
        document.getElementById('settings-submit').classList.add('hidden')
    }
    if (data != null && data != '') {
        let toWrite = {
            defaultFolder: '',
            delay: data['delay']/1000,
            limitSFX: data['sfxLimit'],
            limitSFXCount: data['sfxMaxCount'],
            displayNoSFXEntry: false,
            noSFXEntryMsg: "",
            displayOverLimit: false,
            overLimitMsg: "",
            displayNoSFX: data['displayError'],
            noSFXMsg: data['errorChat'],
            displayNoPoints: data['displayNoPoints'],
            noPointsMsg: data['noPointsChat']
        }
        folder = toWrite['defaultFolder']
        data = JSON.stringify(toWrite, null, 2);
        
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (INF) - New "settings.json" file will be created using the file "' + importedSettingsFile['path'] + ' as template.\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    } else {
        
        $('#modal').toast({
            displayTime: 5000,
            showProgress: 'bottom',
            classProgress: 'red',
            class: 'negative message',
            position: 'bottom right',
            title: 'Invalid data format:',
            message: 'The data inside the file <b>' + importedSettingsFile['name'] + '</b> does not match the required format to proceed. Please select a different file.'
        });
    }
    return data
}

function writeBlankSettingsFile() {
    let emptyFile = {
        defaultFolder: '',
        delay: 0,
        limitSFX: false,
        limitSFXCount: 0,
        displayNoSFXEntry: false,
        noSFXEntryMsg: "",
        displayOverLimit: false,
        overLimitMsg: "",
        displayNoSFX: false,
        noSFXMsg: '',
        displayNoPoints: false,
        noPointsMsg: ''
    };
    data = JSON.stringify(emptyFile, null, 2);
    var logDate = moment().format('YYYYMMDD@HH:mm:ss')
    var logMsg = '[' + logDate + ']: (SUC) - New "settings.json" blank template file was created.\n'
    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    return data
}

function backupSettingsFile() {
    var date = moment().format('YYYYMMDD_HHmmss')
    var backupFolder = installFolder + 'backups/settings/'
    var backupName = date + "_settings.json.bk"
    var backupFile = backupFolder + backupName
    try {
        fs.copyFile(installFolder + 'rsc/settings.json', backupFile, function () {
            $('body').toast({
                displayTime: 5000,
                showProgress: 'bottom',
                classProgress: 'green',
                class: 'positive message',
                position: 'bottom right',
                title: 'Backup created:',
                message: 'A backup file from your settings was created with the name <b>' + backupName + '</b> on the folder <b>'+ backupFolder +'</b>.'
            });
        })
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (SUC) - The backup file "' + backupName + '" was created sucessfully.\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    } catch (err) {
        $('body').toast({
            displayTime: 5000,
            showProgress: 'bottom',
            classProgress: 'red',
            class: 'negative message',
            position: 'bottom right',
            title: 'Failed to create backup:',
            message: 'The backup process failed.'
        });
        logDate = moment().format('YYYYMMDD@HH:mm:ss')
        logMsg = '[' + logDate + ']: (ERR) - Unable to create the backup file "' + backupName + ' " (' + err.name + ': ' + err.message +').\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    }
}

function saveSettingsFile() {
    $('#settings-form').form('setting', 'revalidate', true)
    var validated = $('#settings-form').form('is valid')
    if (validated) {
        var folderDisplay = document.getElementById('folder-display')
        var delayDisplay = document.getElementById('delay-display')
        var limitDisplay = document.getElementById('limit-display')
        var noEntryDisplay = document.getElementById('no-sfx-entry-display')
        var overLimitDisplay = document.getElementById('over-limit-display')
        var noSFXDisplay = document.getElementById('no-sfx-display')
        var noPointsDisplay = document.getElementById('no-points-display')
        var newDefaultFolder = $(folderDisplay).val()
        folder = newDefaultFolder
        var newDelay = $(delayDisplay).val()
        var newLimitCheckDisplay = $('.ui.checkbox').checkbox('is checked')[0]
        var newLimitDisplay = $(limitDisplay).val()
        var newNoSFXEntryCheckDisplay = $('.ui.checkbox').checkbox('is checked')[1]
        var newNoSFXEntryDisplay = $(noEntryDisplay).val()
        var newOverLimitCheckDisplay = $('.ui.checkbox').checkbox('is checked')[2]
        var newOverLimitDisplay = $(overLimitDisplay).val()
        var newSFXCheckDisplay = $('.ui.checkbox').checkbox('is checked')[3]
        var newNoSFXDisplay = $(noSFXDisplay).val()
        var newNoPointsCheckDisplay = $('.ui.checkbox').checkbox('is checked')[4]
        var newNoPointsDisplay = $(noPointsDisplay).val()
        data = {
            defaultFolder: newDefaultFolder,
            delay: newDelay,
            limitSFX: newLimitCheckDisplay,
            limitSFXCount: newLimitDisplay,
            displayNoSFXEntry: newNoSFXEntryCheckDisplay,
            noSFXEntryMsg: newNoSFXEntryDisplay,
            displayOverLimit: newOverLimitCheckDisplay,
            overLimitMsg: newOverLimitDisplay,
            displayNoSFX: newSFXCheckDisplay,
            noSFXMsg: newNoSFXDisplay,
            displayNoPoints: newNoPointsCheckDisplay,
            noPointsMsg: newNoPointsDisplay
        };
        data = JSON.stringify(data, null, 2);
        fs.writeFile(installFolder + 'rsc/settings.json', data, 'utf8', (err) => {
            if (err) {
                $('body').toast({
                    displayTime: 5000,
                    showProgress: 'bottom',
                    classProgress: 'red',
                    class: 'negative message',
                    position: 'bottom right',
                    title: 'Unable to save settings:',
                    message: 'The desired settings were not saved.'
                });
                var logDate = moment().format('YYYYMMDD@HH:mm:ss')
                var logMsg = '[' + logDate + ']: (ERR) - Unable to save "settings.json". (' + err.name + ': ' + err.message +')\n'
                fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
                showModal('saveSettingsFile_modal', 'scriptSettings')
            } else {
                $('body').toast({
                    displayTime: 5000,
                    showProgress: 'bottom',
                    classProgress: 'green',
                    class: 'positive message',
                    position: 'bottom right',
                    title: 'Settings saved:',
                    message: 'The new settings were saved successfully.'
                });
                logDate = moment().format('YYYYMMDD@HH:mm:ss')
                logMsg = '[' + logDate + ']: (SUC) - The changes made to the settings file were saved.\n'
                fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
                showModal('saveSettingsFile_modal', 'scriptSettings')
            }
        });
    } else {
        validated = $('#settings-form').form('validate form')
    }   
}

function createBackupList() {
    var fileDropdown = document.getElementById('fileList')
    var backupFiles = fs.readdirSync(installFolder + 'backups/settings')
    var dropdownHeader = { name: 'Past backup files', type: 'header' }
    if (backupFiles.length == 0) {
        var dropdownValues = []
        dropdownValues.push({ name: 'No backup files found', value: null })
        dropdownValues.unshift(dropdownHeader)
    } else {
        dropdownValues = []
        backupFiles.reverse().forEach(file => {
            dropdownValues.push({ name: file, value: file, icon: 'file' })
        })
        dropdownValues.unshift(dropdownHeader)
    }
    $(fileDropdown).dropdown({
        values: dropdownValues,
        action: 'select',
        onChange: function () {
            var backupFolder = installFolder + 'backups/settings/'
            var backupFile = $(this).dropdown('get value')
            if (backupFile != 'null') {
                fs.copyFile(backupFolder + backupFile, installFolder + 'rsc/settings.json', function () {
                    $('body').toast({
                        displayTime: 5000,
                        showProgress: 'bottom',
                        classProgress: 'green',
                        class: 'positive message',
                        position: 'bottom right',
                        title: 'Settings restored from backup:',
                        message: 'Your settings were restored from previous data on <b>' + backupFile + '</b> file. Now reloading view <b>Script Settings</b> with the new information.'
                    });
                    loadPage('scriptSettings')
                })
                var logDate = moment().format('YYYYMMDD@HH:mm:ss')
                var logMsg = '[' + logDate + ']: (SUC) - The settings file "' + backupFile + '" was loaded successfully.\n'
                fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
            }
        }
    })
}