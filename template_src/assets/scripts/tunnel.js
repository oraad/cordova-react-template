/**
 * @license
 * Copyright (c) Omar Raad. All rights reserved.
 *
 * Licensed under the MIT License. 
 * See the LICENSE file in the project root for more information.
 */

const ngrok = require('ngrok')

let isConnected = false

const createTunnel = async (port = 80) => {
    try {
        const tunnel = await ngrok.connect(port)
        isConnected = true
        return tunnel
    } catch (error) {
        isConnected = false
        throw error
    }
}

const closeTunnel = async () => {
    isConnected = false
    await ngrok.disconnect()
    await ngrok.kill()
    
}

module.exports = {
    create: createTunnel,
    close: closeTunnel,
    isConnected: isConnected
}