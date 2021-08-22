var edtData
var rowData
var rowId

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

var defaultSFXContent = { sfx: [] }

function startList(fileName) {
    try {
        if (!fs.existsSync(installFolder + 'rsc/settings.json')) {
        var newErr = new Error()       
        newErr.name = "Missing file"
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
                } else if (folder == "") {
                    newErr.message = 'The default sound effect directory was not defined.'
                    newErr.name = "Missing required information"
                }
                showModal('missingSettings_modal', 'scriptSettings')
                throw newErr
            } else {

                if (!fs.existsSync(installFolder + 'rsc/sfx.json')) {
                    newErr = new Error()
                    newErr.name = "Missing file"
                    newErr.message = 'Unable to load "sfx.json" file.'
                    showModal('missingSFX_modal', 'addSFX')
                    throw newErr
                } else {
                    const sfxFile = fs.readFileSync(installFolder + 'rsc/sfx.json')
                    toCompare = JSON.parse(sfxFile)
                    if (JSON.stringify(toCompare) == JSON.stringify(defaultSFXContent) || typeof (sfxFile) == 'undefined') {
                        newErr = new Error()
                        if (JSON.stringify(toCompare) == JSON.stringify(defaultSFXContent)) {
                            newErr.message = 'There are not custom sound effects added to "sfx.json".'
                            newErr.name = "Blank file"
                        }
                        showModal('missingSFX_modal', 'addSFX')
                        throw newErr
                    } else {
                        var destFile = installFolder + 'tmp/' + fileName.split(installFolder + 'rsc/')[1] + '.tmp'
                        fs.copyFileSync(fileName, destFile)
                    }
                }
            }
        }
    } catch (err) {
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (ERR) - ' + err.name + ': ' + err.message + '\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    }
}

function createForm() {
    try {
        createList('sfx-select', 'edt-sfx-form', edtSFXFormRules)
        $('#sfx-select').dropdown({
            placeholder: 'Available files...',
            values: sfxSelectValues,
            clearable: true,
            allowAdditions: true,
            autoFocus: false,
            onChange: function (value) {
                var prevButton = document.getElementById('preview-sfx')
                if (value !== '') {
                    prevButton.classList.remove('disabled')
                } else {
                    prevButton.classList.add('disabled')
                }
            }
        })
    } catch (err) {
        if (err) {
            newErr = new Error()
            newErr.name = 'Unknown error'
            var logDate = moment().format('YYYYMMDD@HH:mm:ss')
            var logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ': ' + err.message + '\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        }
    }
}

function tableDraw() {
    $('#sfxList').DataTable({
        ajax: {
            url: installFolder + 'tmp/sfx.json.tmp',
            dataSrc: "sfx",
            async: true
        },
        lengthChange: false,
        autoWidth: false,
        scrollCollapse: true,
        paging: false,
        processing: false,
        columns: [
            { "data": "trigger" },
            { "data": "file" },
            { "data": "volume"},
            { "data": "sfxCost" },
            { "data": "msg" },
            { "data": "allowMsg" },
            { "data": "sfxEnabled" },
            { "data": null }, 
            { "data": null },
            { "data": null },
            { "data": "path" }
        ],
        order: [
            [0, "asc"],
            [1, "asc"],
            [2, "asc"],
        ], 
        columnDefs: [{
            targets: 1,
            width: '1%'
        }, {
            targets: 2,
            className: "ui right aligned"
        }, {
            targets: 10,
            visible: false,
            width: '0%'
        }, {
            targets: [5, 6],
            className: "ui center aligned",
            sortable: false,
            render: function (data, type, row, meta) {
                switch (data) {
                    case true:
                        return "<i class=\"green check icon\"></i>"
                    case false:
                        return "<i class=\"red close icon\"></i>"
                }
            }
        }, {
            targets: 7,
            className: "ui center aligned",
            sortable: false,
            render: function (data, type, row, meta) {
                if (data['sfxEnabled']) {
                    var buttons = "<button class=\"ui teal compact icon button _disable\" onClick=\"statusSFX()\"><i class=\"bell slash icon\"></i></button>"
                } else {
                    buttons = "<button class=\"ui teal compact icon button _disable\" onClick=\"statusSFX()\"><i class=\"bell icon\"></i></button>"
                }
                return buttons
            }
        }, {
            targets: 8,
            className: "ui center aligned",
            sortable: false,
            render: function (data, type, row, meta) {
                var buttons =
                    "<button class=\"ui red compact icon button _delete\" onClick=\"deleteSFX()\"><i class=\"delete icon\"></i></button>"
                return buttons
            }
        }, {
            targets: 9,
            className: "ui center aligned",
            sortable: false,
            render: function (data, type, row, meta) {
                var buttons =
                    "<div class=\"ui teal compact icon button _edit\" onClick=\"editSFX()\"><i class=\"edit icon\"></i></div>"
                return buttons
            }
        }]
    });
}

function statusSFX() {
    rowData = null
    var data = null
    var sfxList = null
    var editTable = null
    data = fs.readFileSync(installFolder + 'tmp/sfx.json.tmp', (err) => {
        if (err) {
            var newErr = new Error()
            newErr.name = 'Unknown error'
            var logDate = moment().format('YYYYMMDD@HH:mmss')
            var logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ": " + err.message + '\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        }
    })
    data = JSON.parse(data)
    sfxList = data['sfx']
    editTable = $('#sfxList').DataTable()
    editTable
        .off('click')
        .on('click', "._disable", function(e) {
            rowData = editTable.row($(this).parents('tr')).data();
            rowId = editTable.row($(this).parents('tr')).index()
            if (rowData.sfxEnabled == true) {
                rowData['sfxEnabled'] = false
                sfxList[rowId]['sfxEnabled'] = false
                status = 'disabled'
            } else {
                rowData['sfxEnabled'] = true
                sfxList[rowId]['sfxEnabled'] = true
                status = 'enabled'
            }
            let info = {
                volume: rowData.volume,
                msg: rowData.msg,
                trigger: rowData.trigger,
                sfxCost: rowData.sfxCost,
                file: rowData.file,
                allowMsg: rowData.allowMsg,
                path: rowData.path,
                sfxEnabled: rowData.sfxEnabled
            }
            sfxList[rowId] = info
            data = JSON.stringify(data, null, 2)
            fs.writeFileSync(installFolder + 'tmp/sfx.json.tmp', data, 'utf8', (err) => {
                var newErr = new Error()
                newErr.name = 'Unknown error'
                logDate = moment().format('YYYYMMDD@HH:mmss')
                logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ": " + err.message + '\n'
                fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
            })
            editTable.clear();
            editTable.rows.add(sfxList).draw();
            var logDate = moment().format('YYYYMMDD@HH:mm:ss')
            var logMsg = '[' + logDate + ']: (WAR) - The sound effect "' + rowData.trigger.toUpperCase() + '" was set to "' + status.toUpperCase() + '".\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
            var msgToRender = 'The sound effect "' + rowData.trigger + '" is now ' + status + '.<br>Commit this change if you want to keep this change!'
            $('body').toast({
                displayTime: 5000,
                showProgress: 'bottom',
                classProgress: 'green',
                class: 'positive message',
                position: 'bottom right',
                title: 'Status change:',
                message: msgToRender
            })
        })
}

function deleteSFX() {
    rowData = null
    var data = null
    var sfxList = null
    var editTable = null
    data = fs.readFileSync(installFolder + 'tmp/sfx.json.tmp', (err) => {
        if (err) {
            var newErr = new Error()
            newErr.name = 'Unknown error'
            var logDate = moment().format('YYYYMMDD@HH:mmss')
            var logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ": " + err.message + '\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        }
    })
    data = JSON.parse(data)
    sfxList = data['sfx']
    editTable = $("#sfxList").DataTable()
    editTable.off('click')
    editTable.on('click', '._delete', function () {
        rowData = editTable.row($(this).parents('tr')).data();
        rowId = editTable.row($(this).parents('tr')).index()
        sfxList.splice(rowId,1)
        data = JSON.stringify(data, null, 2)
        fs.writeFileSync(installFolder + 'tmp/sfx.json.tmp', data, 'utf8', (err) => {
            var newErr = new Error()
            newErr.name = 'Unknown error'
            logDate = moment().format('YYYYMMDD@HH:mmss')
            logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ": " + err.message + '\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        })
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (INF) - The sound effect "' + rowData.trigger.toUpperCase() + '" was deleted.\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        var msgToRender = 'The sound effect "' + rowData.trigger + '" was deleted.<br>Commit this change if you want to keep this change!'
        $('body').toast({
            displayTime: 5000,
            showProgress: 'bottom',
            classProgress: 'red',
            class: 'negative message',
            position: 'bottom right',
            title: 'Status change:',
            message: msgToRender
        })
        editTable.clear();
        editTable.rows.add(sfxList).draw();
    })
}

function editSFX() {
    var data = null
    var sfxList = null
    var editTable = null
    data = fs.readFileSync(installFolder + 'tmp/sfx.json.tmp', (err) => {
        if (err) {
            var newErr = new Error()
            newErr.name = 'Unknown error'
            var logDate = moment().format('YYYYMMDD@HH:mmss')
            var logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ": " + err.message + '\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        }
    })
    data = JSON.parse(data)
    sfxList = data['sfx']
    editTable = $("#sfxList").DataTable()
    editTable.off('click')
    editTable.on('click', '._edit', function () {
        rowData = editTable.row($(this).parents('tr')).data();
        rowId = editTable.row($(this).parents('tr')).index();
        edtData = rowData
        showEditModal(edtData)
        sfxList.splice(rowId, 1)
        data = JSON.stringify(data, null, 2)
        fs.writeFileSync(installFolder + 'tmp/sfx.json.tmp', data, 'utf8', (err) => {
            if (err) {
                var newErr = new Error()
                newErr.name = 'Unknown error'
                var logDate = moment().format('YYYYMMDD@HH:mmss')
                var logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ": " + err.message + '\n'
                fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
            }
        })
    })
}

function cancelEdit() {
    var data = null
    var sfxList = null
    var editTable = null
    data = fs.readFileSync(installFolder + 'tmp/sfx.json.tmp', (err) => {
        if (err) {
            var newErr = new Error()
            newErr.name = 'Unknown error'
            var logDate = moment().format('YYYYMMDD@HH:mmss')
            var logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ": " + err.message + '\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        }
    })
    data = JSON.parse(data)
    editTable = $("#sfxList").DataTable()
    sfxList = data['sfx']
    sfxList.push(edtData)
    data = JSON.stringify(data, null, 2)
    fs.writeFileSync(installFolder + 'tmp/sfx.json.tmp', data, 'utf8', (err) => {
        if (err) {
            var newErr = new Error()
            newErr.name = 'Unknown error'
            var logDate = moment().format('YYYYMMDD@HH:mmss')
            var logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ": " + err.message + '\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        }
    })
    editTable.clear();
    editTable.rows.add(sfxList).draw();
}

function showEditModal(data) {
    $("#modal").load('views/editSFX_modal.html', function () {
        $('#modal').modal({
            onShow: function () {
                window.scrollTo(0, 0);
                document.getElementById("title").innerHTML = data.trigger
                previousVal = data.path
                $('#sfx-select').dropdown('set selected', data.path)
                document.getElementById('edt-effect-trigger').value = data.trigger
                $('.slider._slider').slider('set value', data.volume)
                document.getElementById('edt-effect-cost').value = data.sfxCost
                data.allowMsg===true?$('.ui.checkbox').checkbox('set checked'):$('.checkbox').checkbox('set unchecked')
                document.getElementById('edt-effect-chat-msg').value = data.msg
                var msgInput = document.getElementById('disabled')
                $('.ui.checkbox').checkbox('is checked') ? msgInput.classList.remove('disabled') : msgInput.classList.add('disabled')
                $('.slider._slider').slider({
                    min: 0,
                    max: 100,
                    start: data.volume,
                    step: 1,
                    onMove: function () {
                        var sliderPos = $(this).slider('get value')
                        document.getElementById('edt-slider-input-1').value = sliderPos + "%"
                    }
                })
                    /* .slider('get value', function () {
                        console.log(this.value)
                        $(this).slider({
                            start: this.value
                        }) }) */
                $('.ui.checkbox').checkbox({
                    onChange: function () {
                        var textInput = document.getElementById('disabled')
                        $('.ui.checkbox').checkbox('is checked') ? textInput.classList.remove('disabled') : textInput.classList.add('disabled')
                    }
                })
            },
            dimmerSettings: { opacity: 0.1 },
            blurring: true,
            inverted: true,
            closable: false,
            autofocus: false,
            approve: '.positive, .approve, .ok',
            deny: '.negative, .deny, .cancel',
            onDeny: function () {
                $('body').toast({
                    displayTime: 5000,
                    showProgress: 'bottom',
                    classProgress: 'red',
                    class: 'negative message',
                    position: 'bottom right',
                    title: 'Information:',
                    message: 'No changes were made on the selected sound effect.'
                });
            },
            onHide: function () {
                data = fs.readFileSync(installFolder + 'tmp/sfx.json.tmp', (err) => {
                    if (err) {
                        var newErr = new Error()
                        newErr.name = 'Unknown error'
                        var logDate = moment().format('YYYYMMDD@HH:mmss')
                        var logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ": " + err.message + '\n'
                        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
                    }
                })
                
                data = JSON.parse(data)
                sfxList = data['sfx']
                var editTable = $('#sfxList').DataTable()
                editTable.clear();
                editTable.rows.add(sfxList).draw();
            }
        })
            .modal('setting', 'transition', 'fade', 'closable', false)
            .modal('show')
    })
}

function backupSFXFile() {
    var date = moment().format('YYYYMMDD_HHmmss')
    var backupFolder = installFolder + 'backups/sfx/'
    var backupName = date + "_sfx.json.bk"
    var backupFile = backupFolder + backupName
    try {
        fs.copyFile(installFolder + 'rsc/sfx.json', backupFile, function () {
            $('body').toast({
                displayTime: 5000,
                showProgress: 'bottom',
                classProgress: 'green',
                class: 'positive message',
                position: 'bottom right',
                title: 'Backup created:',
                message: 'A backup file from your sound effects settings was created with the name <b>' + backupName + '</b>.'
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
        err.name = 'Unable to create backup'
        logDate = moment().format('YYYYMMDD@HH:mm:ss')
        logMsg = '[' + logDate + ']: (ERR) - ' + err.name + ': ' + err.message + '\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    }
}

function restoreSFXFile() {
    startList(installFolder + 'rsc/sfx.json')
    var data = fs.readFileSync(installFolder + 'rsc/sfx.json')
    data = JSON.parse(data)
    var sfxList = data['sfx']
    var editTable = $("#sfxList").DataTable()
    editTable.clear();
    editTable.rows.add(sfxList).draw();
    var logDate = moment().format('YYYYMMDD@HH:mm:ss')
    var logMsg = '[' + logDate + ']: (SUC) - Changes were reverted successfuly.\n'
    fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
}

function createBackupList() {
    var dropdownValues = []
    var fileDropdown = document.getElementById('fileList')
    var backupFiles = fs.readdirSync(installFolder + 'backups/sfx')
    var dropdownHeader = { name: 'Past backup files', type: 'header' }
    dropdownValues = [
        { name: 'Last used sound effect file', type: 'header' },
        {name: 'sfx.json', value: installFolder + 'rsc/sfx.json', icon: 'file'}
    ]
    dropdownValues.push(dropdownHeader)
    if (backupFiles.length == 0) {
        
        dropdownValues.push({ name: 'No backup files found', value: null })
    } else {
        backupFiles.reverse().forEach(file => {
            dropdownValues.push({ name: file, value: file, icon: 'file' })
        })
    }
    $(fileDropdown).dropdown({
        values: dropdownValues,
        action: 'select',
        onChange: function () {
            var backupFolder = installFolder + 'backups/sfx/'
            var backupFile = $(this).dropdown('get value')
            if (backupFile != 'null') {
                fs.copyFile(backupFolder + backupFile, installFolder + 'rsc/sfx.json', function () {
                    if (backupFile == "rsc/sfx.json") {
                        backupFile = backupFile.split('../')[1]
                    }
                    $('body').toast({
                        displayTime: 5000,
                        showProgress: 'bottom',
                        classProgress: 'green',
                        class: 'positive message',
                        position: 'bottom right',
                        title: 'Settings restored from backup:',
                        message: 'Your sound effects were restored from previous data on <b>' + backupFile + '</b> file.'
                    });
                    restoreSFXFile()
                })
                var logDate = moment().format('YYYYMMDD@HH:mm:ss')
                var logMsg = '[' + logDate + ']: (SUC) - The settings file "' + backupFile + '" was loaded successfully.\n'
                fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
            }
        }
    })
}

function commitChanges() {
    fs.copyFile(installFolder + 'tmp/sfx.json.tmp', installFolder + 'rsc/sfx.json', (err) => {
        if (err) {
            var newErr = new Error()
            newErr.name = 'Unable to write file'
            var logDate = moment().format('YYYYMMDD@HH:mm:ss')
            var logMsg = '[' + logDate + ']: (ERR) - ' + newErr.name + ': ' + err.message + '\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
            $('body').toast({
                displayTime: 5000,
                showProgress: 'bottom',
                classProgress: 'red',
                class: 'negative message',
                position: 'bottom right',
                title: 'Unable to commit changes:',
                message: 'Please try again. If you keep getting this error, please contact support.'
            });
        } else {
            logDate = moment().format('YYYYMMDD@HH:mm:ss')
            logMsg = '[' + logDate + ']: (SUC) - Changes were commited to "sfx.json" file.\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
            $('body').toast({
                displayTime: 5000,
                showProgress: 'bottom',
                classProgress: 'green',
                class: 'positive message',
                position: 'bottom right',
                title: 'Changes commited:',
                message: 'In order to those changes to take effect, press <i class="undo alternate icon"></i> button on StreamLabs Chatbot Scripts UI.'
            });
        }
    })
}