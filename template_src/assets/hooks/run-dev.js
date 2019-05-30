/**
 * @license
 * Copyright (c) Omar Raad. All rights reserved.
 *
 * Licensed under the MIT License. 
 * See the LICENSE file in the project root for more information.
 */

module.exports = (context) => {

    const { devmode, devserver } = context.opts.options
    if (!devmode) return

    const devEnv = require('../scripts/dev-env')

    const promisify = () => {

        let promise, resolve, reject
        promise = new Promise((_resolve, _reject) => {
            resolve = _resolve
            reject = _reject
        })

        return { promise, resolve, reject }
    }

    const { promise, resolve } = promisify()

    const run = async (runDevServer) => {

        try {
            await devEnv.start(context.opts.platforms, true, runDevServer || false)
            resolve()
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    run(devserver)

    let didCleanup = false

    const cleanup = (sig) =>

        (code) => {

            if (didCleanup) return
            didCleanup = true
            
            devEnv.stop(context.opts.platforms, devserver || false)

            sig !== 'exit' && process.exit(0)
        }

    ['exit', 'SIGTERM', 'SIGINT'].forEach((sig) => {
        process.on(sig, cleanup(sig))
    })

    return promise
}