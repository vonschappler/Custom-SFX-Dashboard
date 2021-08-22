var sfxData
var data

var reqEdtSFXFormCheck = [{
        element: 'input#edt-effect-trigger',
        valid: false
    }, {
        element: 'input#edt-sfx-dropdown',
        valid: false
    }, {
        element: 'input#sfx-select',
        valid: false
    }, {
        element: 'input#edt-effect-cost',
        valid: false
    }
]
var edtSFXFormRules = {
    revalidate: true,
    inline: true,
    delay: false,
    on: 'blur' || 'change' || 'submit',
    fields: {
        edt_sfx_select: {
            identfier: 'edt_sfx_select',
            rules: [{
                type: 'empty',
                prompt: 'Please select a sound effect from the list.'
            }, {
                type: 'sfxUsed[]',
                prompt: 'This file is already being used on another custom sound effect. Type a different file.'
            }]
        },
        edt_sfx_dropdown: {
            identfier: 'edt_sfx_dropdown',
            rules: [{
                type: 'empty',
                prompt: 'Please select a sound effect from the list.'
            }, {
                type: 'sfxUsed[]',
                prompt: 'This file is already being used on another custom sound effect. Type a different file.'
            }]
        },
        edt_effect_trigger: {
            identfier: 'edt_effect_trigger',
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
        edt_effect_cost: {
            identfier: 'edt_effect_cost',
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
        edt_effect_chat_msg: {
            identifier: 'edt_effect_chat_msg',
            depends: 'edt_effect_chat_check',
            rules: [{
                type: 'empty',
                prompt: 'Please enter the desired message to be displayed in chat.'
            }]
        }
    },
    onValid: function () {
        var $that = $(this[0]);
        reqEdtSFXFormCheck.forEach(function (r) {
            if ($that.is(r.element)) {
                r.valid = true;
            }
        });
        var formIsValid = reqEdtSFXFormCheck.reduce(function (a, b) {
            return a && b.valid;
        }, true);
        if (formIsValid) {
            document.getElementById("edt-save-sfx").classList.add('positive')
            var logDate = moment().format('YYYYMMDD@HH:mm:ss')
            var logMsg = '[' + logDate + ']: (SUC) - The form "edt-sfx-form" was succesfully validated.\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        }
    },
    onInvalid: function () {
        var $that = $(this[0]);
        reqEdtSFXFormCheck.forEach(function (r) {
            if ($that.is(r.element)) {
                r.valid = false;
            }
        });
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (ERR) - One or more fields could not be validated on the form "edt-sfx-form".\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    },
}

$.fn.form.settings.rules.greaterThan = function (inputValue, validationValue) {
    return inputValue >= validationValue;
}

$.fn.form.settings.rules.triggerUsed = function (inputValue) {
    try {
        const sfxSettings = fs.readFileSync(installFolder.split("/rsc/")[0] + 'tmp/sfx.json.tmp', 'utf-8')
        data = JSON.parse(sfxSettings)
        sfxData = data['sfx']
        var triggerList = []
        for (var i = 0; i < sfxData.length; i++) {
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
        const sfxSettings = fs.readFileSync(installFolder.split("/rsc/")[0] + 'tmp/sfx.json.tmp', 'utf-8')
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

function fileSelect(e) {
    sfxFile = null
    if (typeof (sfxFile) === 'undefined' || sfxFile == null) {
        sfxFile = $(document.getElementById('edt-file-select')).val()
        sfxFile = e.target.files[0]
        var sfxName = sfxFile['name']
        var sfxPath = sfxFile['path']
        sfxSelectValues.push({ 'name': sfxName, 'value': sfxPath })
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

function previewSound() {
    var sound = document.getElementById('edt-sfx-dropdown').value
    var volume = $('#edt-slider-1').slider('get value')
    var sfxPreview = new Audio(sound)
    sfxPreview.volume = volume / 100.0
    try {
        sfxPreview.play()
        var logDate = moment().format('YYYYMMDD@HH:mm:ss')
        var logMsg = '[' + logDate + ']: (INF) - A preview of "' + sound + '" was played.\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    } catch (err) {
        logDate = moment().format('YYYYMMDD@HH:mm:ss')
        logMsg = '[' + logDate + ']: (ERR) - Unable to preview the "' + sound + '" (' + err.name + ':' + err.message + ').\n'
        fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
    }
}

function saveEditSFX() {
    const fileImported = fs.readFileSync(installFolder.split("/rsc/")[0] + 'tmp/sfx.json.tmp')
    data = JSON.parse(fileImported)
    sfxData = data['sfx']
    $('#edt-sfx-form').form('setting', 'revalidate', true)
    var validated = $('#edt-sfx-form').form('is valid')
    if (validated) {
        var sfxFileField = document.getElementById('edt-sfx-dropdown')
        var sfxPathField = sfxFileField['value']
        var sfxName = sfxPathField.split('\\')
        var sfxTriggerField = document.getElementById('edt-effect-trigger')
        var sfxCostField = document.getElementById('edt-effect-cost')
        var sfxVolumeField = document.getElementById('edt-slider-1')
        var sfxEnableChat = $('.ui.checkbox').checkbox('is checked')?true:false
        var sfxChatMessage = document.getElementById('edt-effect-chat-msg')
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
        fs.writeFileSync(installFolder.split("/rsc/")[0] + 'tmp/sfx.json.tmp', data, 'utf8', (err) => {
            if (err) {
                throw (err)
            } else {
                var logDate = moment().format('YYYYMMDD@HH:mm:ss')
                var logMsg = '[' + logDate + ']: (INF) -  The changes to sound effect "' + info['file'] + '" with the trigger "' + info['trigger'] + '" were saved".\n'
                fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
            }
        })
        $("#modal").modal('hide')
        $('body').toast({
            displayTime: 5000,
            showProgress: 'bottom',
            classProgress: 'green',
            class: 'positive message',
            position: 'bottom right',
            title: 'Success:',
            message: 'Sound effect options changed. You need to commit those changes so they can have effect.'
        });
        updateList('sfx-select', 'edt-sfx-form', edtSFXFormRules)
    } else {
        $('#edt-sfx-form').form('validate form')
    }
}