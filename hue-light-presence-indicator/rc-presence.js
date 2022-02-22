const axios = require('axios');
require('dotenv').config();

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
        console.log(res.status);
        console.log(res.statusText);
    })
    .catch(error => {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    });
