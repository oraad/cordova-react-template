/**
 * @license
 * Copyright (c) Omar Raad. All rights reserved.
 *
 * Licensed under the MIT License. 
 * See the LICENSE file in the project root for more information.
 */

module.exports = (context) => {

    const { devmode } = context.opts.options
    if (!devmode) return


    const fs = require('fs')
    const path = require('path')
    const ConfigParser = require('cordova-common').ConfigParser
    const PlatformJson = require('cordova-common').PlatformJson
    const PluginInfoProvider = require('cordova-common').PluginInfoProvider
    const getPlatformApi = require('cordova-lib').cordova_platforms.getPlatformApi

    const projectRoot = context.opts.projectRoot
    const provider = new PluginInfoProvider()

    const filename = 'app-info.js'

    const template = (appInfo, platformInfo, plugins) =>
    `
    const appInfo = ${JSON.stringify(appInfo)}

    const platformInfo = ${JSON.stringify(platformInfo)}
    
    const plugins = ${JSON.stringify(plugins)}
    `

    const cfg = new ConfigParser(path.join(projectRoot, 'config.xml'))

    const appInfo = {
        id: cfg.packageName(),
        name: cfg.name(),
        shortname: cfg.shortName(),
        version: cfg.version(),
        cordova: context.opts.cordova.version
    }

    context.opts.platforms.forEach(platform => {

        const platformJson = PlatformJson.load(path.join(projectRoot, 'platforms', platform), platform)
        const pluginsInfo = Object.keys(platformJson.root.installed_plugins)
        .concat(Object.keys(platformJson.root.dependent_plugins))
        .map(plugin => {
           const {name, version, id} = provider.get(path.join(projectRoot, 'plugins', plugin))
           return {name, version, id}
        })

        const platformInfo = {}

        if (platform === 'android') {
            platformInfo.packageName = cfg.android_packageName() || cfg.packageName()
            platformInfo.version = cfg.android_versionCode() || cfg.version()
        } else if (platform === 'ios') {
            platformInfo.packageName = cfg.ios_CFBundleIdentifier() || cfg.packageName()
            platformInfo.version = cfg.ios_CFBundleVersion() || cfg.version()
        }

        const wwwPath = getPlatformApi(platform).getPlatformInfo().locations.www

        fs.writeFileSync(path.join(wwwPath, filename), template(appInfo, platformInfo, pluginsInfo))
    })
    

    let didCleanup = false

    const cleanup = (sig) =>

        (code) => {

            if (didCleanup) return
            didCleanup = true

            context.opts.platforms.forEach(platform => {
                const wwwPath = getPlatformApi(platform).getPlatformInfo().locations.www

                if (fs.existsSync(path.join(wwwPath, filename))) {
                    fs.unlinkSync(path.join(wwwPath, filename))
                }
            })
            
            

            sig !== 'exit' && process.exit(0)
        }

    ['exit', 'SIGTERM', 'SIGINT'].forEach((sig) => {
        process.on(sig, cleanup(sig))
    })

} 