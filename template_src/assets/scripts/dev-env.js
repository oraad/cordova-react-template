
/**
 * @license
 * Copyright (c) Omar Raad. All rights reserved.
 *
 * Licensed under the MIT License. 
 * See the LICENSE file in the project root for more information.
 */

const symlink = require('./symlink')
const devserver = require('./dev-server')
const tunnel = require('./tunnel')

const promisify = () => {
    let promise, resolve, reject
    promise = new Promise((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
    })

    return { promise, resolve, reject }
}

let webpack_stop

const start = async (platforms = [], isCordova = false, runServer = true) => {

    console.log(`Setting up Symbolic links...`)

    symlink.create(platforms, isCordova, runServer)

    if (!runServer) return

    console.log(`Starting Dev Server...`)
    try {
        await devserver.start()
    } catch (error) {
        console.error(`WebSocket failed: ${error}`)
        throw error
    }

    let localIP, networkIP, tunnelIP

    console.log(`Starting Webpack Development Server...`)
    try {
        const w = await startWebpack(devserver)
        webpack_stop = w.stop
        localIP = w.data.local
        networkIP = w.data.network
    } catch (error) {
        console.error(`Webpack failed: ${error}`)
        throw error
    }

    devserver.updateIP(localIP, networkIP)

    const _port = /:(\d+)/.exec(localIP)
    const port = _port && _port[1] || undefined

    console.log(`Setting up Tunnel...`)
    devserver.broadcastTerminal(`Setting up Tunnel...\n`)
    try {
        tunnelIP = await tunnel.create(port)
        devserver.broadcastTerminal(`Tunnel ready at ${tunnelIP}\n`)
        devserver.updateIP(localIP, networkIP, tunnelIP)
    } catch (error) {
        console.error(`Tunnel failed: ${error}`)
        devserver.broadcastTerminal(`Tunnel setup failed.\n`)
        throw error
    } finally {
        console.log(`Local: ${localIP || ''}\nNetwork: ${networkIP || ''}\nTunnel: ${tunnelIP || ''}\n`)
    }

}

const startWebpack = async (devserver) => {
    
    const webpack = await require('./run-webpack')

    let local = null, network = null
    const { promise, resolve } = promisify()

    webpack.onOutput((data) => {

        const _local = /Local:\s+(http.+\/)/.exec(data)
        if (_local) local = _local[1]

        const _network = /On Your Network:\s+(http.+\/)/.exec(data)
        if (_network) network = _network[1]

        if (devserver) {

            devserver.broadcastTerminal(data)
        }

        if (local && network) {

            resolve({ stop: webpack.stop, data: { local, network } })
        }
    })

    webpack.onError((error) => {
        if (devserver) {
            devserver.broaddcast(`${error}\n`)
        }
    })

    webpack.onClose((code) => {
        console.log(`Webpack exited with code ${code}`)
    })

    webpack._onError((error) => {
        console.error(`Webpack error ${error}`)
        throw error
    })

    return await promise
}

const stop = (platforms = [], runServer = true) => {
    if (runServer) {
        console.log(`Closing Tunnel...`)
        tunnel.close()
        if (webpack_stop) {
            console.log(`Stopping Webpack Development Server...`)
            webpack_stop()
        }
        console.log(`Stopping Dev Server...`)
        devserver.close()
    }

    console.log(`Cleaning up Symbolic Links...`)
    symlink.cleanup(platforms, runServer)
}

module.exports = {
    start: start,
    stop: stop
}


