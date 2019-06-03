/**
 * @license
 * Copyright (c) Omar Raad. All rights reserved.
 *
 * Licensed under the MIT License. 
 * See the LICENSE file in the project root for more information.
 */

module.exports = (context) => {

    const { devmode } = context.opts.options
    if ((context.hook === 'before_run') && devmode) return

    const fs = require('fs')
    const path = require('path')
    const { spawn } = require('child_process')

    const promisify = () => {
        let promise, resolve, reject
        promise = new Promise((_resolve, _reject) => {
            resolve = _resolve
            reject = _reject
        })

        return { promise, resolve, reject }
    }

    const projectRoot = context.opts.projectRoot
    const wwwPath = path.join(projectRoot, 'www')
    const buildPath = path.join(projectRoot, 'build')

    const appBuild = () => {

        const { promise, resolve } = promisify()
        const app = spawn('npm', ['run', 'cra:build'], {
            env: { ...process.env },
            shell: true
        })

        app.stdout.on('data', (data) => {
            console.log(data.toString())
        })

        app.stderr.on('data', (data) => {
            console.log(data.toString())
        })

        app.on('exit', code => {
            if (code === 0) {
                resolve()
            } else {
                console.log(`App build existed with ${code}`)
            }
        })

        app.on('error', (error) => {
            console.error(error)
            throw error
        })

        return promise
    }

    const createSymlink = () => {
        fs.readdirSync(buildPath)
            .forEach(entry => {
                const targetPath = path.join(buildPath, entry)
                const dstPath = path.join(wwwPath, entry)
                fs.symlinkSync(targetPath, dstPath)
            })
    }

    const cleanupSymlink = () => {
        fs.readdirSync(wwwPath, { withFileTypes: true })
            .forEach(dirent => {
                if (dirent.isSymbolicLink()) {
                    fs.unlinkSync(path.join(wwwPath, dirent.name))
                }
            })
    }

    const build = async () => {
        await appBuild()
        createSymlink()
    }



    let didCleanup = false

    const cleanup = (sig) =>

        (code) => {

            if (didCleanup) return
            didCleanup = true

            cleanupSymlink()

            sig !== 'exit' && process.exit(0)
        }

    ['exit', 'SIGTERM', 'SIGINT'].forEach((sig) => {
        process.on(sig, cleanup(sig))
    })

    return build()

}