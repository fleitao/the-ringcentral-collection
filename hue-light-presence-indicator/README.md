<div align="center">
  
# Hue Light Presence Indicator
Use your Philips Hue light colour to reflect your RingCentral presence status using this simple node.js script. 

</div>

# What You'll Need

* [ngrok](https://ngrok.com/) (optional)
* [RingCentral Developer Account](https://developers.ringcentral.com/login.html#/)
* [Philips Hue Lamp](https://www.philips-hue.com/en-gb) 
* [Philips Hue Developer Account](https://developers.meethue.com/)
* [node.js](https://nodejs.org/)

For this example, we are using [Philips Hue Go](https://www.lighting.philips.co.uk/consumer/choose-a-fixture/hue-go) light. This script works with any other Philips Hue Color lamp.

# Getting Started

## ngrok

Skip this step if you are working on a VPS with a public IP address.

If you're using your own machine to host the webhook server, download ngrok if you have not already. It is a handy tool that provides an external URL to map to localhost:port. 

The application defaults to port 8088, so launch ngrok HTTP mapping to port 8088:

```$ ngrok http 8088```

Be sure to copy the forwarding ngrok URL, we’ll need that later to configure the webhook server.

## RingCentral Developer Account Setup

1. Create a RingCentral Developer Account ([here](https://developers.ringcentral.com/free-tier-sign-up.html))
2. Create a new app (there's a nice tutorial for that [here](https://ringcentr.al/3rYMdwG))
3. While creating the app, make sure you set the following permissions: Read Presence & Webhook Subscriptions. [Read Presence](https://developers.ringcentral.com/api-reference/Extension-Presence-Event) is required for the app to retrieve Presence status changes from your extension. [Webhook Subscriptions](https://developers.ringcentral.com/api-reference/Subscriptions/createSubscription) is required for your app to be able to subscribe to events.
3. Once the app is created, you'll need to set up your app credentials. In this example, we are using the JWT Authentication method. This authorization method is well documented [here](https://developers.ringcentral.com/guide/authentication/jwt/create-jwt).

## node.js

For this script we're using node.js with several dependencies that are being used for different things:

* [axios](https://axios-http.com/) to execute HTTP requests
* [express](https://expressjs.com/) to create the web app/webhook that will be listening to event updates
* [body-parser](https://www.npmjs.com/package/body-parser) to parse JSON based requests
* [querystring](https://nodejs.org/api/querystring.html) to enforce URL encoded HTTP requests
* [dotenv](https://www.npmjs.com/package/dotenv) to be able to load and use environment values stored in .env files

These dependencies do not come as default node.js modules and you can fetch and install them by executing the following on the root directory of the script:

```npm install axios```

```npm install express```

```npm install body-parser```

```npm install querystring```

```npm install dotenv```


# The Basics

Before executing the script there are two things you'll need to take care first.

## Setup your .env file

In this repository, you'll find a template for the `.env` file named `template.env`. Just rename that file to `.env` to be readable by your script.

After that, simply add your RingCentral credentials as well as your Philips Hue light parameters into the .env environment file:


 ```
###########################################################################
############# Philips Hue Presence Light for RingCentral ##################
###########################################################################

#### RingCentral Environment Parameters Below ####


RC_SERVER_URL        = 'https://platform.devtest.ringcentral.com' # Sandbox
#RC_SERVER_URL      = 'https://platform.ringcentral.com'          # Production

RC_CLIENT_ID        = 'aNVJ2wE7QpO-z3*******A'
RC_CLIENT_SECRET    = 'jOJxiYCPRR6Pz4xhk5k1vgTF-ta*********5LBUPj3A'
RC_USERNAME         = '~'
RC_PASSWORD         = ''
RC_EXTENSION        = '~'

# Authorization
RC_REDIRECT_URL     = 'http://localhost:5000/oauth2callback'
RC_JWT              = 'eyJraWQiOiI4Nz*********************************************WRDphX3ibTf39kcpV0VGxdRDEA'

RC_BEARER_TOKEN     = ''



#### Philips Hue Environment Parameters Below ####

HUE_SERVER          = 'https://5a4a-***-***-***-246.ngrok.io/presence'
HUE_PORT            = '8088'
HUE_BRIDGE          = '192.168.2.7'
HUE_DEV_ID          = 'x3iAru7********WIjHqW'
HUE_LIGHT_ID        = '18'
```

The script is ready to automatically fetch new a new Bearer Token using the JWT method. For that, simply leave the `RC_BEARER_TOKEN` field blank.

`HUE_SERVER` will be using the ngrok URL generated previously, adding `/presence`. `HUE_PORT` is 8088 by default. Change it here in case you need to use a different Port number.

`HUE_BRIDGE` IP Address, the `HUE_DEV_ID` (developer ID) and your `HUE_LIGHT_ID` can be easily found using Philips Hue developer tools. You'll find almost everything required to run this exercise in Philips Hue's `Getting Started` tutorial that can be found [here](https://developers.meethue.com/develop/get-started-2/).

# Light It Up

You should be ready to try the script now. Let us test this out in the following order:

1. Turn on your Philips Hue lamp
2. Start the webhook listener app (light should turn light white)
3. Open your RingCentral app (desktop or [web-browser](https://app.ringcentral.com/))
3. Start making or receiving calls or manually change your presence status


## Start the webhook

```
$ node rc-hue-presence-server.js

[utc|2022/9/19|16:42:16:983] LOG - RingCentral Philips Hue Presence Server running on port 8088
[utc|2022/9/19|16:42:16:988] LOG - 🔐 Fetching the RC API Access Token...
[utc|2022/9/19|16:42:17:379] LOG - 🔐 Success!
[utc|2022/9/19|16:42:17:379] DEBUG - 🔐 New Token: [QU1TMDFQMzFQQVMwMHxBQUFFdHZLdmltd*****************************UQ]
[utc|2022/9/19|16:42:18:173] LOG - ✅ Validation Token Received: 4bb3aabc-856a-471c-****-ac357e04a5c2
[utc|2022/9/19|16:42:18:173] LOG - Initiating light...
[utc|2022/9/19|16:42:18:307] LOG - ⚓ Subscribed: [Active | WebHook | https://1897-176-199-***-***.ngrok.io/presence]
[utc|2022/9/19|16:42:18:381] LOG - 💡 HUE - light turned on 💡
```


# See It In Action

If you are having trouble with the setup, I've recorded a video where I'm walking through this example. To watch it, simply click on the picture/link below:

[![smsscript](https://raw.githubusercontent.com/fleitao/the-ringcentral-collection/main/hue-light-presence-indicator/resources/hue_presence_demo_cover.png)](https://youtu.be/w--DD7qJFSg)

