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
//opn should be updated to open
const open = require('opn')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server, path: '/term' })

const port = 3331

const webPath = path.join(__dirname, '..', 'console')

app.get('/', (req, res) => res.sendFile(path.join(webPath, 'index.html')))
app.use('/css', express.static(path.join(webPath, 'css')))
app.use('/js', express.static(path.join(webPath, 'js')))

wss.on('connection', (ws, req) => {
    
    ws.isAlive = true

    ws.send('Socket connected\r\n')

    Object.keys(addressState).forEach(key => {
        if (addressState[key]) {
            ws.send(`${key.slice(0,1).toUpperCase()}${key.slice(1)}: ${addressState[key]}\r\n`)
        }
    })

    ws.on('pong', () => {
        ws.isAlive = true;
    })

})

const broadcastTerminal = (data) => {
    data = data.replace(/\r*\n/, '\r\n')
    wss.clients.forEach((client) => {
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

app.get('/address', (req, res) => {
    res.send(addressState)
})

const update = (local, network, tunnel) => {
    addressState = { local, network, tunnel }
}

const close = () => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.close()
        }
    })

    server.close()
}

setInterval(() => {
    wss.clients.forEach((ws) => {

        if (!ws.isAlive) return ws.terminate()

        ws.isAlive = false;
        ws.ping(null, false, true);
    })
}, 10000)

const startServer = () =>
    new Promise((resolve, reject) => {

        server.listen(port, (error) => {
            if (error) {
                console.error(error)
                reject(error)
                return
            }
            open(`http://localhost:${port}`).then(() => {
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