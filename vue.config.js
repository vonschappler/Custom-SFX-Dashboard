module.exports = {
    css: {
        loaderOptions: {
            sass: {
                additionalData: '@import "@/styles/base.scss";'
            }
        }
    },
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                publish: ['github']
            }
        }
    }
}