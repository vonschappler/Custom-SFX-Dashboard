var sfxData
var sfxDataSet
var defaultSFXFolder
var sfxFile
var importedSFXFile
var data
var passed
var defaultSettingsContent = {
    defaultFolder: '',
    delay: "",
    limitSFX: false,
    limitSFXCount: "",
    displayNoSFXEntry: false,
    noSFXEntryMsg: "",
    displayOverLimit: false,
    overLimitMsg: "",
    displayNoSFX: false,
    noSFXMsg: '',
    displayNoPoints: false,
    noPointsMsg: ''
}
var reqAddSFXFormCheck = [{
        element: 'input#effect-trigger',
        valid: false
    }, {
        element: 'input#sfx-dropdown',
        valid: false
    }, {
        element: 'input#sfx-select',
        valid: false
    }, {
        element: 'input#effect-cost',
        valid: false
    }
]
var addSFXFormRules = {
    revalidate: true,
    inline: true,
    delay: false,
    on: 'blur'||'change'||'submit',
    fields: {
        sfx_select: {
            identfier: 'sfx_select',
            rules: [{
                type: 'empty',
                prompt: 'Please select a sound effect from the list.'
            }, {
                type: 'sfxUsed[]',
                prompt: 'This file is already being used on another custom sound effect. Type a different file.'
            }]
        },
        sfx_dropdown: {
            identfier: 'sfx_dropdown',
            rules: [{
                type: 'empty',
                prompt: 'Please select a sound effect from the list.'
            }, {
                type: 'sfxUsed[]',
                prompt: 'This file is already being used on another custom sound effect. Type a different file.'
            }]
        },
        effect_trigger: {
            identfier: 'effect_trigger',
            rules: [{
                type: 'empty',
                prompt: 'Please specify a trigger for the selected sound effect.'
            }, {
                type: 'doesntContain[ ]',
                prompt: 'A trigger is defined by a single word. Remove any spaces or use a different word.'
            }, {
                type: 'triggerUsed[]',
                prompt: 'This word is already being used on another custom sound effect. Type a different word.'
            }]
        },
        effect_cost: {
            identfier: 'effect_cost',
            rules: [{
                type: 'empty',
                prompt: 'Please enter the desired maximum sound effects that can be triggered with a simple command usage.'
            }, {
                type: 'integer',
                prompt: 'The value provided is not supported. Please use only interger numbers .'
            }, {
                type: 'greaterThan[0]',
                prompt: 'The value provided has to be greater than or equal to {ruleValue}.'
            }]
        },
        effect_chat_msg: {
            identifier: 'effect_chat_msg',
            depends: 'effect_chat_check',
            rules: [{
                type: 'empty',
                prompt: 'Please enter the desired message to be displayed in chat.'
            }]
        }
    },
    onValid: function () {
        var $that = $(this[0]);
        reqAddSFXFormCheck.forEach(function (r) {
            if ($that.is(r.element)) {
                r.valid = true;
            }
        });
        var formIsValid = reqAddSFXFormCheck.reduce(function (a, b) {
            return a && b.valid;
        }, true);
        if (formIsValid) {
            var logDate = moment().format('YYYYMMDD@HH:mm:ss')
            var logMsg = '[' + logDate + ']: (SUC) - The form "add-sfx-form" was succesfully validated.\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        }
    },
    onInvalid: function () {
        var $that = $(this[0]);
        reqAddSFXFormCheck.forEach(function (r) {
            if ($that.is(r.element)) {
                r.valid = false;
            }
        });
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (ERR) - One or more fields could not be validated on the form "add-sfx-form".\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    },
}

$.fn.form.settings.rules.greaterThan = function (inputValue, validationValue) {
    return inputValue >= validationValue;
}

$.fn.form.settings.rules.triggerUsed = function (inputValue) {
    try {
        const sfxSettings = fs.readFileSync(installFolder + 'rsc/sfx.json', 'utf-8')
        data = JSON.parse(sfxSettings)
        sfxData = data['sfx']
        var triggerList = [ ]
        for (var i=0; i<sfxData.length;i++) {
            triggerList.push(sfxData[i]['trigger'])
        }
        if (triggerList.includes(inputValue)) {
            return ''
        } else {
            return inputValue
        }
    } catch (err) {
        if (err) {
            console.error(err)
        }
    }
}

$.fn.form.settings.rules.sfxUsed = function (inputValue, validationValue) {
    try {
        const sfxSettings = fs.readFileSync(installFolder + 'rsc/sfx.json', 'utf-8')
        data = JSON.parse(sfxSettings)
        sfxData = data['sfx']
        var fileList = []
        for (var i = 0; i < sfxData.length; i++) {
            fileList.push(sfxData[i]['path'])
        }
        if (fileList.includes(inputValue)) {
            return ''
        } else {
            return inputValue
        }
    } catch (err) {
        if (err) {
            console.error(err)
        }
    }
}

function sfxStart() {
    try {
        if (!fs.existsSync(installFolder + 'rsc/settings.json')) {
            var newErr = new Error()
            newErr.name = 'Missing file'
            newErr.message = 'Unable to load "settings.json" file.'
            throw newErr
        } else {
            const settingsFile = fs.readFileSync(installFolder + 'rsc/settings.json')
            var toCompare = JSON.parse(settingsFile)
            if (JSON.stringify(toCompare) == JSON.stringify(defaultSettingsContent) || folder == "") {
                newErr = new Error()
                if (JSON.stringify(toCompare) == JSON.stringify(defaultSettingsContent)) {
                    newErr.message = 'The previously created "settings.json" file was not edited.'
                    newErr.name = "Blank file"
                } else if (folder == ""){
                    newErr.message = 'The default sound effect directory was not defined.'
                    newErr.name = "Missing required information"
                }
                showModal('missingSettings_modal', 'scriptSettings')
                throw newErr
            }
            try {
                fs.readFileSync(installFolder + 'rsc/sfx.json')
                createList('sfx-select', 'add-sfx-form', addSFXFormRules)
            } catch (err) {
                newErr = new Error()
                newErr.name = 'Missing file'
                newErr.message = 'Unable to load "sfx.json" file.'
                showModal('newSFXFile_modal', 'addSFX', createSFXFile)
                throw newErr
            }
        }
    } catch (err){
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (ERR) - ' + err.name + ': ' + err.message + '\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    }
    return importedSFXFile
}

function createSFXFile() {
    var info = ""
    try {
        info = importSFXFile()
    } catch (err) {
        if (err) {
            info = writeBlankSFXFile()
        }
        
    }
    fs.writeFileSync(installFolder + 'rsc/sfx.json', info, 'utf8')
}

function importSFXFile(e) {
    if (typeof(importedSFXFile) === 'undefined' || importedSFXFile == null){
        var toImport = $(document.getElementById('sfx-file-select')).val()
        importedSFXFile = e.target.files[0]
    }
    getSFXFileContents(importedSFXFile)
    if (toImport != "" || toImport != null) {
        document.getElementById('sfx-file-select-btn').innerHTML = "Selected file: " + importedSFXFile['name']
        document.getElementById('sfx-file-select-btn').classList.add('disabled')
        document.getElementById('sfx-confirm').classList.remove('hidden')
        document.getElementById('sfx-cancel').classList.remove('hidden')
        document.getElementById('sfx-submit').classList.add('hidden')
    }
    data = JSON.stringify(data, null, 2)
    return data
}

function writeBlankSFXFile () {
    let emptyFile = {sfx: []}
    data = JSON.stringify(emptyFile, null, 2)
    return data
}

function getSFXFileContents(filename) {
    const fileImported = fs.readFileSync(filename['path'])
    try {
        data = JSON.parse(fileImported)
        sfxDataSet = data['sfx']
        for(var i=0; i<sfxDataSet.length; i++) {
            sfxDataSet[i]['sfxEnabled'] = true
            sfxDataSet[i]['msg'] == ""?sfxDataSet[i]['allowMsg']=false:sfxDataSet[i]['allowMsg']=true
            var searchPath = filename['path']
            var pathOrigin = searchPath.replace(filename['name'], "") + '\\sfx\\'
            sfxDataSet[i]['path'] = folder + "\\" + sfxDataSet[i]['file']
            try {
                fs.copyFileSync(pathOrigin + "\\" + sfxDataSet[i]['file'], sfxDataSet[i]['path'])
                var logDate = moment().format('YYYYMMDD@HH:mm:ss')
                var logMsg = '[' + logDate + ']: (INF) - File "' + sfxDataSet[i]['file'] + '" was copied from ' + pathOrigin + ' to ' + folder + '.\n'
                fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
            } catch (err) {
                var newErr = new Error()
                newErr.name = 'File not found'
                newErr.message = 'Unable to find the file "' + sfxDataSet[i]['file'] + '" on "' + pathOrigin + '". The file may need to be copied manually.'
                logDate = moment().format('YYYYMMDD@HH:mm:ss')
                logMsg = '[' + logDate + ']: (ERR) - Could not copy the file "' + sfxDataSet[i]['file'] + ' " requested by "sfx.json". (' + newErr.name + ': ' + newErr.message + ')\n'
                fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
            }
        }
    } catch (err) {
        var url = filename['path']
        $.getJSON(url, function (content) {
            data = content;
            sfxDataSet = data['sfx']
            for (var i=0; i<sfxDataSet.length; ++i) {
                sfxDataSet[i]['sfxEnabled'] = true
                sfxDataSet[i]['msg'] == ""?sfxDataSet[i]['allowMsg']=false:sfxDataSet[i]['allowMsg']=true
                searchPath = filename['path']
                pathOrigin = searchPath.replace(filename['name'], "") + '\\sfx\\'
                sfxDataSet[i]['path'] = folder + "\\" + sfxDataSet[i]['file']
                try {
                    fs.copyFileSync(pathOrigin + "\\" + sfxDataSet[i]['file'], sfxDataSet[i]['path'])
                    var logDate = moment().format('YYYYMMDD@HH:mm:ss')
                    var logMsg = '[' + logDate + ']: (INF) - File "' + sfxDataSet[i]['file'] + '" was copied from ' + pathOrigin + ' to ' + folder + '.\n'
                    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
                } catch (err) {
                    var newErr = new Error()
                    newErr.name = 'Origin file not found'
                    newErr.message = 'Unable to find the file "' + sfxDataSet[i]['file'] + '" on "' + pathOrigin + '". The file may need to be copied manually.'
                    logDate = moment().format('YYYYMMDD@HH:mm:ss')
                    logMsg = '[' + logDate + ']: (ERR) - Could not copy the file "' + sfxDataSet[i]['file'] + ' " requested by "sfx.json". (' + newErr.name + ': ' + newErr.message + ')\n'
                    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
                }
            }
        });
    }
}

function cancelSFXImport() {
    importedSFXFile = null
    document.getElementById('sfx-file-select').value = null
    document.getElementById('sfx-confirm').classList.add('hidden')
    document.getElementById('sfx-cancel').classList.add('hidden')
    document.getElementById('sfx-submit').classList.remove('hidden')
    document.getElementById('sfx-file-select-btn').innerHTML = 'Import sound effects file...'
    document.getElementById('sfx-file-select-btn').classList.remove('disabled')
    var logDate = moment().format('YYYYMMDD@HH:mm:ss')
    var logMsg = '[' + logDate + ']: (INF) - User canceled the "sfx.json" import process.\n'
    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
}

function previewSound() {
    var sound = document.getElementById('sfx-dropdown').value
    var volume = $('#slider-1').slider('get value')
    var sfxPreview = new Audio (sound)
    sfxPreview.volume = volume/100.0
    try {
        sfxPreview.play()
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (INF) - A preview of "' + sound + '" was played.\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    } catch (err) {
        logDate = moment().format('YYYYMMDD@HH:mm:ss')
        logMsg = '[' + logDate + ']: (ERR) - Unable to preview the "' + sound + '" ('+ err.name + ':' + err.message +').\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    }
}

function fileSelect(e) {
    sfxFile = null
    if (typeof (sfxFile) === 'undefined' || sfxFile == null) {
        sfxFile = $(document.getElementById('file-select')).val()
        sfxFile = e.target.files[0]
        var sfxName = sfxFile['name']
        var sfxPath = sfxFile['path']
        sfxSelectValues.push({ 'name': sfxName, 'value':  sfxPath})
    }
    $('#sfx-select').dropdown({
        placeholder: 'Available files...',
        values: sfxSelectValues,
        clearable: true,
        allowAdditions: true,
        hideAdditions: true,
        onChange: function (value) {
            var prevButton = document.getElementById('preview-sfx')
            if (value !== '') {
                prevButton.classList.remove('disabled')
            } else {
                prevButton.classList.add('disabled')
            }
        }
    })
    $('#sfx-select').dropdown('set selected', sfxPath)
    
}

function saveSFXFile() {
    const fileImported = fs.readFileSync(installFolder + 'rsc/sfx.json')
    data = JSON.parse(fileImported)
    sfxData = data['sfx']
    $('#add-sfx-form').form('setting', 'revalidate', true)
    var validated = $('#add-sfx-form').form('is valid')
    if (validated) {
        var sfxFileField = document.getElementById('sfx-dropdown')
        var sfxPathField = sfxFileField['value']
        var sfxName = sfxPathField.split('\\')
        var sfxTriggerField = document.getElementById('effect-trigger')
        var sfxCostField = document.getElementById('effect-cost')
        var sfxVolumeField = document.getElementById('slider-1')
        var sfxEnableChat = $('.ui.checkbox').checkbox('is checked')?true:false
        var sfxChatMessage = document.getElementById('effect-chat-msg')
        let info = {
            volume: $(sfxVolumeField).slider('get value'),
            msg: sfxChatMessage.value,
            trigger: sfxTriggerField.value,
            sfxCost: sfxCostField.value,
            file: sfxName.slice(-1)[0],
            allowMsg: sfxEnableChat,
            path: sfxPathField,
            sfxEnabled: true
        }
        sfxData.push(info)
        data = JSON.stringify(data, null, 2)
        fs.writeFile(installFolder + 'rsc/sfx.json', data, 'utf8',(err) => {
            if (err) {
                throw (err)
            } else {
                var logDate = moment().format('YYYYMMDD@HH:mm:ss')
                var logMsg = '[' + logDate + ']: (INF) -  The sound effect "' + info['file'] + '" with the trigger "' + info['trigger'] + '" was saved".\n'
                fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
            }
        })
        $('.ui.form').form('reset')
        showModal('saveSFXFile_modal', 'addSFX')
        $('#modal').toast({
            displayTime: 5000,
            showProgress: 'bottom',
            classProgress: 'green',
            class: 'positive message',
            position: 'bottom right',
            title: 'A new sound effect was added:',
            message: 'The sound effect <b>'+ info['file'] +'</b> with the trigger <b>'+ info['trigger'] +'</b> was saved succesfully.'
        });
        updateList('sfx-select', 'add-sfx-form', addSFXFormRules)
    } else {
        $('#add-sfx-form').form('validate form')
    }
}