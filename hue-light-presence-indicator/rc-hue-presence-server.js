const express = require('express')
const bodyParser = require('body-parser')
const hue = require('./hue-library')
const querystring = require('querystring');
const axios = require('axios');
require('dotenv').config();

const app = express()

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

app.listen(process.env.HUE_PORT, () => {

    console.log(`[%s] LOG - RingCentral Philips Hue Presence Server running on port ${process.env.HUE_PORT}`, get_timestamp());

    // Subscribe to Presence Changes
    rcSubscribePresence();


});

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
});


// Async Function to Presence Subscription
async function rcSubscribePresence() {

    if (process.env.RC_BEARER_TOKEN == '')
        await getRCToken();

    axios.post(process.env.RC_SERVER_URL + '/restapi/v1.0/subscription', {
            eventFilters: [
                '/restapi/v1.0/account/' + process.env.RC_USERNAME + '/extension/' + process.env.RC_EXTENSION + '/presence'
            ],
            deliveryMode: {
                transportType: 'WebHook',
                address: process.env.HUE_SERVER
            },
            expiresIn: 3600 // temporary until I have the 'Cancel Subscription' created
        }, {
            headers: {
                'Authorization': 'Bearer ' + process.env.RC_BEARER_TOKEN,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        })
        .then(res => {
            console.log('[%s] LOG - ⚓ Subscribed: [%s | %s | %s]', get_timestamp(),
                res.data.status,
                res.data.deliveryMode.transportType,
                res.data.deliveryMode.address);
        })
        .catch(error => {
            console.log('[%s] ERROR - ⚓ Unable to Subscribe to Webhook:[%s|%s]', get_timestamp(), error.response.status, error.response.statusText);
            console.log(error);

        });

};


// Async Function to Retrieve Token
async function getRCToken() {

    console.log("[%s] LOG - 🔐 Fetching the RC API Access Token...", get_timestamp());

    var data = querystring.stringify({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: process.env.RC_JWT
    });

    const token_data = await axios.post(process.env.RC_SERVER_URL + '/restapi/oauth/token',
            data, {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                auth: {
                    'username': process.env.RC_CLIENT_ID,
                    'password': process.env.RC_CLIENT_SECRET
                },
            })
        .then(res => {
            if (res.status == 200 && res.data.access_token) {
                console.log("[%s] LOG - 🔐 Success!", get_timestamp());
                console.log("[%s] DEBUG - 🔐 New Token: [%s]", get_timestamp(), res.data.access_token);

                // update .env variable with new token data
                process.env.RC_BEARER_TOKEN = res.data.access_token;
            }
        })
        .catch(error => {
            console.log('[%s] ERROR - 🔐 Unable to fetch Bearer Token: [%s|%s]', get_timestamp(), error.response.status, error.response.statusText);
        });

    return token_data;
};
