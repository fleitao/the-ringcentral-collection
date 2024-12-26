const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const querystring = require("querystring");

require("dotenv").config();

const app = express();
const PORT = 8088;

app.use(bodyParser.json());

function get_timestamp() {
    var now = new Date();

    return (
        now.getUTCFullYear() +
        "/" +
        (now.getUTCMonth() + 1) +
        "/" +
        now.getUTCDate() +
        " | " +
        now.getHours() +
        ":" +
        now.getMinutes() +
        ":" +
        now.getSeconds() +
        ":" +
        now.getMilliseconds()
    );
}

// App Starts; sends welcome card
app.listen(PORT, () => {
    console.log(`[%s] LOG - RingCentral WebForm to Glip app running on port ${PORT}`, get_timestamp());

    //  Send welcome card to groups
    let l_rcCard = {
        type: "AdaptiveCard",
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        version: "1.3",
        body: [
            {
                type: "TextBlock",
                size: "Medium",
                weight: "Bolder",
                text: "Town Hall Citizen Feedback Service"
            },
            {
                type: "TextBlock",
                text: "✅ Town Hall Citizen Feedback Service is now ready.",
                wrap: true
            }
        ]
    };

    sendRCAdaptiveCard(process.env.RC_GROUP, l_rcCard);
});

// Async Function to Send Adaptive Card
async function sendRCAdaptiveCard(rcGroup, rcCard) {
    if (process.env.RC_BEARER_TOKEN == "") await getRCToken();

    const send_msg = await axios
        .post(process.env.RC_SERVER_URL + "/restapi/v1.0/glip/chats/" + rcGroup + "/adaptive-cards", rcCard, {
            headers: {
                Authorization: "Bearer " + process.env.RC_BEARER_TOKEN,
                "Content-Type": "application/json",
                Accept: "application/json"
            }
        })
        .then((res) => {
            if (res.status && res.statusText)
                console.log(
                    "[%s] LOG - 📩 New Adaptive Card posted with status: [%s|%s]",
                    get_timestamp(),
                    res.status,
                    res.statusText
                );
            return res;
        })
        .catch((error) => {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            return error;
        });
}

// Async Function to Retrieve Token
async function getRCToken() {
    console.log("[%s] LOG - 🔐 Fetching the RC API Access Token...", get_timestamp());

    var data = querystring.stringify({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: process.env.RC_JWT
    });

    const token_data = await axios
        .post(process.env.RC_SERVER_URL + "/restapi/oauth/token", data, {
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            },
            auth: {
                username: process.env.RC_CLIENT_ID,
                password: process.env.RC_CLIENT_SECRET
            }
        })
        .then((res) => {
            if (res.status == 200 && res.data.access_token) {
                console.log("[%s] LOG - 🔐 Success!", get_timestamp());
                console.log("[%s] DEBUG - 🔐 New Token: [%s]", get_timestamp(), res.data.access_token);

                // update .env variable with new token data
                process.env.RC_BEARER_TOKEN = res.data.access_token;
            }
        })
        .catch((error) => {
            console.log(error);
        });

    return token_data;
}

// Collect data from WebForm

app.get("/webform", function (req, res) {
    if (process.env.RC_DEBUG) {
        console.log("[%s] DEBUG - Form received:", get_timestamp());
        console.log("   Service: %s", req.query.service);
        console.log("   NIF: %s", req.query.nif);
        console.log("   Name: %s", req.query.name);
        console.log("   Surname: %s", req.query.surname);
        console.log("   Number: %s", req.query.number);
        console.log("   Email: %s", req.query.email);
        console.log("   Message: %s", req.query.message);
    }

    //  Build RC Card
    let l_rcCard = {
        type: "AdaptiveCard",
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        version: "1.3",
        body: [
            {
                type: "TextBlock",
                size: "Medium",
                weight: "Bolder",
                text: "Town Hall Citizen Feedback Service"
            },
            {
                type: "ColumnSet",
                columns: [
                    {
                        type: "Column",
                        items: [
                            {
                                type: "Image",
                                url: "https://static.vecteezy.com/system/resources/previews/026/574/662/original/city-hall-building-icon-city-hall-sign-town-hall-symbol-municipal-building-logo-flat-style-vector.jpg",
                                altText: "Town Hall",
                                size: "small"
                            }
                        ],
                        width: "auto"
                    },
                    {
                        type: "Column",
                        items: [
                            {
                                type: "TextBlock",
                                weight: "bolder",
                                text: "You got a new message!",
                                wrap: true
                            },
                            {
                                type: "TextBlock",
                                spacing: "none",
                                text: "From " + req.query.name + " " + req.query.surname,
                                isSubtle: true,
                                wrap: true
                            },
                            {
                                type: "TextBlock",
                                spacing: "none",
                                text: "Received at " + get_timestamp(),
                                isSubtle: true,
                                wrap: true
                            }
                        ],
                        width: "stretch"
                    }
                ]
            },
            {
                type: "TextBlock",
                text: req.query.message,
                wrap: true
            },
            {
                type: "FactSet",
                facts: [
                    {
                        title: "Name",
                        value: req.query.name
                    },
                    {
                        title: "Surname",
                        value: req.query.surname
                    },
                    {
                        title: "ID Number",
                        value: req.query.nif
                    },
                    {
                        title: "Phone Number",
                        value: req.query.number
                    },
                    {
                        title: "Email",
                        value: req.query.email
                    }
                ]
            }
        ]
    };


    try {
        const post_card = sendRCAdaptiveCard(process.env.RC_GROUP, l_rcCard);
    } catch (error) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    }

    res.sendFile(
        "./http/th-webform-to-glip-thankyou.html"
    );
});
