const express = require('express')
const bodyParser = require('body-parser')
const hue = require('./hue-library')
require('dotenv').config();

const app = express()
const PORT = 8088

app.use(bodyParser.json())

function get_timestamp() {

    var now = new Date();

    return 'utc|' + now.getUTCFullYear() +
        '/' + (now.getUTCMonth() + 1) +
        '/' + now.getUTCDate() +
        '|' + now.getHours() +
        ':' + now.getMinutes() +
        ':' + now.getSeconds() +
        ':' + now.getMilliseconds();

}

// set initial status as available
var currentStatus = 'Available'

app.listen(PORT, () => console.log(`[%s] LOG - RingCentral Philips Hue Presence Server running on port ${PORT}`, get_timestamp()))

app.post('/hue', (req, res) => {

    // RingCentral Validation Token
    if (req.headers.hasOwnProperty("validation-token")) {
        console.log('[%s] LOG - ✅ Validation Token Received: %s', get_timestamp(), req.headers['validation-token'])
        res.header('Validation-Token', req.headers['validation-token'])
        res.header('Content-type', 'application/json') // <<<< leave this s*&^ here... super important
        console.log('[%s] LOG - Initiating light...', get_timestamp())
        hue.turnLightOn(process.env.HUE_BRIDGE,
            process.env.HUE_DEV_ID,
            process.env.HUE_LIGHT_ID
        )
    } else if (req.body.body.hasOwnProperty('presenceStatus')) {
        let rc_status = req.body.body.presenceStatus

        if (rc_status != currentStatus) {
            console.log('[%s] LOG - Presence Status Updated: ', get_timestamp())

            if (rc_status == 'Busy') {
                hue.setLightColor(process.env.HUE_BRIDGE,
                    process.env.HUE_DEV_ID,
                    process.env.HUE_LIGHT_ID,
                    65535)
                currentStatus = 'Busy'
            } else if (rc_status == 'Available') {
                hue.setLightColor(process.env.HUE_BRIDGE,
                    process.env.HUE_DEV_ID,
                    process.env.HUE_LIGHT_ID,
                    25500)
                currentStatus = 'Available'
            } else {
                hue.turnLightOff(process.env.HUE_BRIDGE,
                    process.env.HUE_DEV_ID,
                    process.env.HUE_LIGHT_ID
                )
                currentStatus = 'Offline'
            }
        } else {
            console.log('[%s] LOG - Notification received, status not changed, ignored...', get_timestamp())
        }
    } else if (req.body.body.hasOwnProperty('userStatus') && req.body.body.userStatus == 'Offline') {
        hue.turnLightOff(process.env.HUE_BRIDGE,
            process.env.HUE_DEV_ID,
            process.env.HUE_LIGHT_ID
        )
        currentStatus = 'Offline'
    }
    res.end()
})
