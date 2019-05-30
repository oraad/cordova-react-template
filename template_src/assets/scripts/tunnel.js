/**
 * @license
 * Copyright (c) Omar Raad. All rights reserved.
 *
 * Licensed under the MIT License. 
 * See the LICENSE file in the project root for more information.
 */

const ngrok = require('ngrok')

const createTunnel = async (port = 80) => {
    try {
        const tunnel = await ngrok.connect(port)
        return tunnel
    } catch (error) {
        console.log(`ngrok error: ${error}`)
        throw error
    }
}

const closeTunnel = async () => {
    await ngrok.disconnect()
    await ngrok.kill()
}

module.exports = {
    create: createTunnel,
    close: closeTunnel
}