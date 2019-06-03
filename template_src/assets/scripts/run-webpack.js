/**
 * @license
 * Copyright (c) Omar Raad. All rights reserved.
 *
 * Licensed under the MIT License. 
 * See the LICENSE file in the project root for more information.
 */

const { spawn } = require('child_process')
const getPort = require('./get-port')

const PORT = 3000
let webpack = null

const start = async () => {

    const port = await getPort('0.0.0.0', PORT)

    webpack = spawn('npm', ['run', 'cra:start'], {
        env: { ...process.env, BROWSER: 'none', PORT: port },
        shell: true
    })

    return {
        onOutput: onOutput,
        onError: onError,
        onClose: onClose,
        _onError: _onError,
        stop: stop
    }
}

const onOutput = callback => {
    webpack.stdout.on('data', (data) => {
        const dataStr = data.toString()
        const lines = dataStr.split(/\r*\n/)

        lines.forEach(line => {
            if (/^>/.test(line)) return

            callback(`${line}\n`)
        })
    })
}

const onError = callback => {
    webpack.stderr.on('data', (data) => {
        callback(data)
    })
}

const onClose = callback => {
    webpack.on('close', code => {
        callback(code)
    })
}
const _onError = callback => {
    webpack.on('error', (error) => {
        callback(error)
    })
}


const stop = () => {
    webpack.stdin.end()
    webpack.kill()
}

module.exports = start()
