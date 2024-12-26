const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const querystring = require("querystring");

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CDN_CLOUD_NAME,
    api_key: process.env.CDN_API_KEY,
    api_secret: process.env.CDN_API_SECRET
});


const formData = require("form-data");

require("dotenv").config();

const app = express();
const PORT = 8089;

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

const g_rcWelcome = {
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


// App Starts; sends welcome card
app.listen(PORT, () => {
    console.log(`[%s] LOG - RingCentral WebMedia to Glip app running on port ${PORT}`, get_timestamp());

    //  Send welcome card to groups
    sendRCAdaptiveCard(process.env.RC_GROUP, g_rcWelcome);
});


// Set up multer to store the uploaded file temporarily
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Set temp folder for uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save with a unique name
    },
});

const upload = multer({
    storage: storage
});
// Ensure the 'uploads' directory exists
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Route to receive and process the image
app.post('/upload', upload.fields([
    {
        name: 'image',
        maxCount: 1
    },
    {
        name: 'name',
        maxCount: 1
    },
    {
        name: 'surname',
        maxCount: 1
    },
    {
        name: 'number',
        maxCount: 1
    }, {
        name: 'street',
        maxCount: 1
    }
]), async (req, res) => {


    try {
        if (!req.files || !req.files['image']) {
            return res.status(400).send('No image uploaded.');
        }

        const {
            name,
            surname,
            number,
            street
        } = req.body;

        // Here we can call another API to upload the image
        const l_imageFile = req.files['image'][0];
        const l_imagePath = path.join(__dirname, 'uploads', l_imageFile.filename);


        console.log(`Received image file: ${l_imageFile.filename}`);
        console.log(`Path to local file: ${l_imagePath}`);

        const l_picurl = await cloudinaryUploadImage(l_imagePath);

        console.log(`Path to cloudinary file: ${l_picurl}`);

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
                        }, {
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
                                    text: "From " + name + " " + surname,
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
                    type: "FactSet",
                    facts: [
                        {
                            title: "Phone Number",
                            value: number
                    },
                        {
                            title: "Address",
                            value: street
                    }
                ]
            },
                {
                    type: "Image",
                    url: l_picurl,
                    altText: "incident"
                }

                    ]
        };

        const card_response = await sendRCAdaptiveCard(process.env.RC_GROUP, l_rcCard);

        res.status(200).sendFile(
            "/Users/filipe.leitao/DevCenter/the-ringcentral-collection/webform-to-glip/http/th-webform-to-glip-thankyou.html");
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file');
    }
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
                    "[%s] LOG - 📩 New Adaptive Card posted: [%s|%s]",
                    get_timestamp(),
                    res.status,
                    res.statusText
                );
            return res.status;
        })
        .catch((error) => {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            return error;
        });
}

// Async Function to Send Adaptive Card
async function sendrRCFile(rcGroup, rcFilePath, rcFileName) {
    if (process.env.RC_BEARER_TOKEN == "") await getRCToken();

    let l_formData = new FormData();
    l_formData.append("file", rcFilePath);


    const send_file = await axios
        .post(process.env.RC_SERVER_URL + "/team-messaging/v1/files", l_formData, {
            params: {
                groupId: rcGroup,
                name: rcFileName
            },
            headers: {
                Authorization: "Bearer " + process.env.RC_BEARER_TOKEN,
                "Content-Type": "multipart/form-data",
                Accept: "application/json"
            }
        })
        .then((res) => {
            if (res.status && res.statusText)
                console.log(
                    "[%s] LOG - 🖼️ New image uploaded successfully: [%s|%s]",
                    get_timestamp(),
                    res.status,
                    res.statusText
                );
            return res.status;
        })
        .catch((error) => {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            return error;
        });

}

const cloudinaryUploadImage = async (imagePath) => {

    const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
    };

    try {
        cloudinary.config({
            cloud_name: process.env.CDN_CLOUD_NAME,
            api_key: process.env.CDN_API_KEY,
            api_secret: process.env.CDN_API_SECRET
        });
        // Upload the image
        const result = await cloudinary.uploader.upload(imagePath, options);
        return result.url;
    } catch (error) {
        console.error(error);
    }
};


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
