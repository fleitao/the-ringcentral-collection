const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios');
const querystring = require('querystring');

const hue = require('./hue-library');

const cardHueLightOn = require('./hueCards/card_hueLightOn.json');
const cardHueLightOff = require('./hueCards/card_hueLightOff.json');
const cardHueLightRed = require('./hueCards/card_hueLightRed.json');
const cardHueLightBlue = require('./hueCards/card_hueLightBlue.json');
const cardHueLightGreen = require('./hueCards/card_hueLightGreen.json');


require('dotenv').config();

const app = express();
const PORT = 8088;

app.use(bodyParser.json());

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

// App Starts; turn light on and send first card
app.listen(PORT, () => {

    console.log(`[%s] LOG - RingCentral Adaptive Cards Server for Philips HUE running on port ${PORT}`, get_timestamp());

    //  Turn Light On
    hue.turnLightOn(process.env.HUE_BRIDGE,
        process.env.HUE_DEV_ID,
        process.env.HUE_LIGHT_ID
    );

    //  Display Card
    sendRCAdaptiveCard(cardHueLightOn);
});

//  Adaptive Cards Webhook to digest Actions
app.post('/huemonitor', (req, res) => {

    console.log('[%s] LOG - 📧 Adaptive Card Actiion Received. ', get_timestamp());

    if (req.body && req.body.data.menu) {

        let hue_action = req.body.data.menu;

        if (hue_action == 'white') {
            hue.turnLightOn(process.env.HUE_BRIDGE,
                process.env.HUE_DEV_ID,
                process.env.HUE_LIGHT_ID
            );
            sendRCAdaptiveCard(cardHueLightOn);
        } else if (hue_action == 'red') {
            hue.setLightColor(process.env.HUE_BRIDGE,
                process.env.HUE_DEV_ID,
                process.env.HUE_LIGHT_ID,
                65535);
            sendRCAdaptiveCard(cardHueLightRed);
        } else if (hue_action == 'blue') {
            hue.setLightColor(process.env.HUE_BRIDGE,
                process.env.HUE_DEV_ID,
                process.env.HUE_LIGHT_ID,
                46920);
            sendRCAdaptiveCard(cardHueLightBlue);
        } else if (hue_action == 'green') {
            hue.setLightColor(process.env.HUE_BRIDGE,
                process.env.HUE_DEV_ID,
                process.env.HUE_LIGHT_ID,
                25500);
            sendRCAdaptiveCard(cardHueLightGreen);
        } else if (hue_action == 'off') {
            hue.turnLightOff(process.env.HUE_BRIDGE,
                process.env.HUE_DEV_ID,
                process.env.HUE_LIGHT_ID);
            sendRCAdaptiveCard(cardHueLightOff);

        } else {
            console.log('[%s] ERROR - 📧 Adaptive Card Action is Corrupted... ignoring! ', get_timestamp());
        }
    } else {
        console.log('[%s] ERROR - 📧 Not able to recognize Action... ignoring! ', get_timestamp());
    }

    res.end()
})


// Async Function to Send Adaptive Card
async function sendRCAdaptiveCard(rcCard) {

    if (process.env.RC_BEARER_TOKEN == '')
        await getRCToken();

    axios.post(process.env.RC_SERVER_URL + '/restapi/v1.0/glip/chats/' + process.env.RC_GROUP + '/adaptive-cards', rcCard, {
            headers: {
                'Authorization': 'Bearer ' + process.env.RC_BEARER_TOKEN,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        })
        .then(res => {
            if (res.status && res.statusText)
                console.log("[%s] LOG - 📩 New Adaptive Card posted with status: [%s|%s]", get_timestamp(), res.status, res.statusText);
        })
        .catch(error => {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        });
}

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
            console.log(error);
        });

    return token_data;
};
