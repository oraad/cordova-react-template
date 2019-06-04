/**
 * @license
 * Copyright (c) Omar Raad. All rights reserved.
 *
 * Licensed under the MIT License. 
 * See the LICENSE file in the project root for more information.
 */

const http = require('http')
const express = require('express')
const WebSocket = require('ws')
const path = require('path')
const getPort = require('./get-port')
const url = require('url')
//opn should be updated to open
const open = require('opn')

const app = express()
const server = http.createServer(app)
const wssTerm = new WebSocket.Server({ noServer: true })
const wssAddress = new WebSocket.Server({ noServer: true })

const PORT = 3331

const webPath = path.join(__dirname, '..', 'console')

app.get('/', (req, res) => res.sendFile(path.join(webPath, 'index.html')))
app.use('/css', express.static(path.join(webPath, 'css')))
app.use('/js', express.static(path.join(webPath, 'js')))

wssTerm.on('connection', (ws, req) => {

    ws.isAlive = true

    ws.send('Socket connected\r\n')

    Object.keys(addressState).forEach(key => {
        if (addressState[key]) {
            ws.send(`${key.slice(0, 1).toUpperCase()}${key.slice(1)}: ${addressState[key]}\r\n`)
        }
    })

    ws.on('pong', () => {
        ws.isAlive = true;
    })

})

const broadcastTerminal = (data) => {
    data = data.replace(/\r*\n/, '\r\n')
    wssTerm.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data)
        }
    })
}

let addressState = {
    local: null,
    network: null,
    tunnel: null
}

// app.get('/address', (req, res) => {
//     res.send(addressState)
// })

wssAddress.on('connection', (ws, req) => {

    ws.isAlive = true

    ws.send(JSON.stringify(addressState))

    ws.on('pong', () => {
        ws.isAlive = true;
    })

})

const update = (local, network, tunnel) => {
    addressState = { local, network, tunnel }
    wssAddress.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(addressState))
        }
    })
}

const close = () => {

    wssAddress.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.close()
        }
    })

    wssTerm.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.close()
        }
    })

    server.close()
}

setInterval(() => {

    wssTerm.clients.forEach((ws) => {

        if (!ws.isAlive) return ws.terminate()

        ws.isAlive = false;
        ws.ping(null, false, true);
    })

    wssAddress.clients.forEach((ws) => {

        if (!ws.isAlive) return ws.terminate()

        ws.isAlive = false;
        ws.ping(null, false, true);
    })

}, 10000)

server.on('upgrade', (request, socket, head) => {

    const pathname = url.parse(request.url).pathname

    if (pathname === '/term') {
        wssTerm.handleUpgrade(request, socket, head, ws => {
            wssTerm.emit('connection', ws, request)
        })
    } else if (pathname === '/address') {
        wssAddress.handleUpgrade(request, socket, head, ws => {
            wssAddress.emit('connection', ws, request)
        })
    } else {
        socket.destroy()
    }
})

const startServer = () =>
    new Promise(async (resolve, reject) => {

        const port = await getPort('0.0.0.0', PORT)

        server.listen(port, (error) => {
            if (error) {
                console.error(error)
                reject(error)
                return
            }
            open(url.format({
                protocol: 'http',
                hostname: 'localhost',
                port: port,
                pathname: '/'
            })).then(() => {
                resolve()
            })
        })
    })

module.exports = {
    start: startServer,
    broadcastTerminal: broadcastTerminal,
    updateIP: update,
    close: close
}