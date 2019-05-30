/**
 * @license
 * Copyright (c) Omar Raad. All rights reserved.
 *
 * Licensed under the MIT License. 
 * See the LICENSE file in the project root for more information.
 */

const devEnv = require('./dev-env')

devEnv.start()

let didCleanup = false

const cleanup = (sig) =>

    (code) => {

        if (didCleanup) return
        didCleanup = true

        devEnv.stop()

        sig !== 'exit' && process.exit(0)
    }

['exit', 'SIGTERM', 'SIGINT'].forEach((sig) => {
    process.on(sig, cleanup(sig))
})