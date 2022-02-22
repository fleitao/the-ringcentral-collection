const axios = require('axios')
const https = require('https')

/*
IMPORTANT NOTE: we are forcing the HTTPS agent to ignore TLS certificate issues with the server. 
We do this here because the Philips HUE Bridge uses a self-signed certificate that Axios doesn't 
like. For this particular usage, this design does not pose a security threat since the Philips HUE 
Bridge operates on the local private network. However, if your Philips Hue Bridge is somehow being 
accessed through the public internet, we STRONGLY RECOMMEND that a valid certificate is exchanged 
instead.
*/

// turn hue light on 
function turnLightOn(bridgeAddress, hueDevId, lightId) {

    axios.put('https://' + bridgeAddress + '/api/' + hueDevId + '/lights/' + lightId + '/state', {
        on: true,
        sat: 254,
        bri: 254,
        hue: 25500
    }, {
        headers: {
            'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false // ignoring self-signed certificate issues, see note
        })
    }).then(res => {
        if (res.data)
            console.log('💡 HUE - light turned on 💡')
    }).catch(error => {
        console.log('💡 HUE ERROR - Unable to change Hue light status')
        console.log(JSON.stringify(error));
    });
}

// turn hue light off 
function turnLightOff(bridgeAddress, hueDevId, lightId) {

    axios.put('https://' + bridgeAddress + '/api/' + hueDevId + '/lights/' + lightId + '/state', {
        on: false
    }, {
        headers: {
            'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false // ignoring self-signed certificate issues, see note
        })
    }).then(res => {
        if (res.data)
            console.log('💡 HUE - light turned off ❌')
    }).catch(error => {
        console.log('💡 HUE ERROR - Unable to change Hue light status')
        console.log(JSON.stringify(error));
    });
}

// change hue light color 
function setLightColor(bridgeAddress, hueDevId, lightId, lightColor) {

    axios.put('https://' + bridgeAddress + '/api/' + hueDevId + '/lights/' + lightId + '/state', {
        sat: 254,
        bri: 254,
        hue: lightColor // green (25500) / red (65535)
    }, {
        headers: {
            'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false // ignoring self-signed certificate issues, see note
        })
    }).then(res => {
        if (res.data) {
            let changedColor = ''
            if (lightColor == 65535) {
                changedColor = '🛑';
            } else {
                changedColor = '🟩';
            }
            console.log('💡 HUE - light color changed: %s', changedColor)
        }
    }).catch(error => {
        console.log('💡 HUE ERROR - Unable to change Hue light status')
        console.log(JSON.stringify(error));
    });
}

module.exports = {
    turnLightOn,
    turnLightOff,
    setLightColor
};
