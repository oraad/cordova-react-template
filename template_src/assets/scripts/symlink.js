/**
 * @license
 * Copyright (c) Omar Raad. All rights reserved.
 *
 * Licensed under the MIT License. 
 * See the LICENSE file in the project root for more information.
 */

const fs = require('fs')
const path = require('path')
const cordova_lib = require('cordova-lib')

const projectRoot = cordova_lib.cordova.findProjectRoot()
const getPlatformApi = cordova_lib.cordova_platforms.getPlatformApi

const wwwPath = path.join(projectRoot, 'www')
const clientPath = path.join(projectRoot, 'assets', 'client')
const publicPath = path.join(projectRoot, 'public')

const cordovaAssets = [
    'cordova.js',
    'cordova_plugins.js',
    'cordova-js-src',
    'plugins'
]

const createSymlink = (platforms = [], isCordova, runServer) => {

    // Create a Symolic link for dev client into www
    if (isCordova && fs.existsSync(clientPath)) {
        fs.readdirSync(clientPath).forEach(entry => {

            const targetPath = path.join(clientPath, entry)
            const dstPath = path.join(wwwPath, entry)
            fs.symlinkSync(targetPath, dstPath)
        })
    }

    if (runServer) {
        platforms = platforms.length > 0 ? platforms : listPlatforms(projectRoot)
        platforms.forEach(createSymlinkByPlatform)
    }
}

const createSymlinkByPlatform = (platform) => {

    const cordovaAssetsPath = getPlatformApi(platform).getPlatformInfo().locations.www

    // Create Symbolic link for platform into App 
    fs.mkdirSync(path.join(publicPath, 'cordova', platform), { recursive: true })
    cordovaAssets.forEach((asset) => {
        const assetPath = path.join(cordovaAssetsPath, asset)
        const dstPath = path.join(publicPath, 'cordova', platform, asset)
        if (fs.existsSync(assetPath) && !fs.existsSync(dstPath)) {
            fs.symlinkSync(assetPath, dstPath)
        }
    })
}

const cleanupSymlink = (platforms = [], runServer) => {

    // Cleanup www
    fs.readdirSync(wwwPath, { withFileTypes: true })
        .forEach(dirent => {

            if (dirent.isSymbolicLink()) {

                fs.unlinkSync(path.join(wwwPath, dirent.name))
            }
        })

    // Cleanup platforms
    platforms = platforms.length > 0 ? platforms : listPlatforms(projectRoot)
    platforms.forEach(cleanupSymlinkByPlatform(runServer))

    if (runServer) {
        const dstPath = path.join(publicPath, 'cordova')
        if (fs.existsSync(dstPath)) {
            fs.rmdirSync(path.join(dstPath))
        }
    }
}

const cleanupSymlinkByPlatform = (runServer) => (platform) => {

    const cordovaAssetsPath = getPlatformApi(platform).getPlatformInfo().locations.www

    // Cleanup Platform
    fs.readdirSync(cordovaAssetsPath, { withFileTypes: true })
        .forEach(dirent => {
            if (dirent.isSymbolicLink()) {
                fs.unlinkSync(path.join(cordovaAssetsPath, dirent.name))
            }
        })

    if (!runServer) return

    // Cleanup Public directroy
    const dstPath = path.join(publicPath, 'cordova', platform)
    if (fs.existsSync(dstPath)) {
        rmdirRecursiveSync(dstPath)
    }
}

const listPlatforms = (project_dir) => {

    const platforms_dir = path.join(project_dir, 'platforms')
    if (!fs.existsSync(platforms_dir)) {
        return []
    }

    // get subdirs (that are actually dirs, and not files)
    return fs.readdirSync(platforms_dir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map(dirent => dirent.name)
}

const rmdirRecursiveSync = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true })
        .forEach(dirent => {
            const direntPath = path.join(dir, dirent.name)
            if (dirent.isDirectory()) {
                rmdirRecursiveSync(direntPath)
            } else {
                fs.unlinkSync(direntPath)
            }
        })
    fs.rmdirSync(dir)
}

module.exports = {
    create: createSymlink,
    cleanup: cleanupSymlink
}