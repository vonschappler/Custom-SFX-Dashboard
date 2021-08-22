function enlargeImage(el) {
    if (fs.existsSync("C:/Program Files/dashboard/")) {
        //window.alert(fs.existsSync("C:\\Program Files\\dashboard\\"))
        installFolder = ("C:/Program Files/dashboard/")
        //window.alert()

    } else {
        installFolder = ""
    }
    var src = $(el).data('src');
    var imgsrc = '../img/docs/' + src + '.png'
    var desc = $(el).data('desc');
    $('#expandedImg').attr('src', imgsrc)
    document.getElementById('description').innerHTML = desc
    console.log("installFolder inside enlargeImage > ", installFolder)
    $("#modal").modal({
        onShow: function () {
            var logDate = moment().format('YYYYMMDD@HH:mm:ss')
            var logMsg = '[' + logDate + ']: (INF) - Displaying overlayed modal with image"' + src + '".\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        },
        onHide: function () {
            var logDate = moment().format('YYYYMMDD@HH:mm:ss')
            var logMsg = '[' + logDate + ']: (INF) - "' + src + '" modal was closed.\n'
            fs.appendFileSync(installFolder + 'tmp/thisSession.log.tmp', logMsg)
        },
        dimmerSettings: { opacity: 0.5 },
        blurring: true,
        inverted: true,
        closable: false,
    })
        .modal('setting', 'transition', 'fade', 'closable', false)
        .modal('show');
}