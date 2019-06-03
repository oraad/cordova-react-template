/**
 * @license
 * Copyright (c) Omar Raad. All rights reserved.
 *
 * Licensed under the MIT License. 
 * See the LICENSE file in the project root for more information.
 */

const detect = require('detect-port-alt')

module.exports = async (host, port) => {

    let _port
    do {
        port = _port || port
        _port = await detect(port, host)

    } while (_port !== port)

    return port
}