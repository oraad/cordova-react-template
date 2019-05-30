/**
 * @license
 * Copyright (c) Omar Raad. All rights reserved.
 *
 * Licensed under the MIT License. 
 * See the LICENSE file in the project root for more information.
 */

const { spawn } = require('child_process')

let webpack = null

const start =  () => {

    webpack = spawn('npm', ['start'], {
        env: { ...process.env, BROWSER: 'none' },
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
