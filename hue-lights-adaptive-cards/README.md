<div align="center">
  
# Philips Hue Control Center for RingCentral & Adaptive Cards
Use your RingCentral MVP as Control Center for remote control over your Philips Hue light colour using this simple node.js script. 


<img src="https://raw.githubusercontent.com/fleitao/the-ringcentral-collection/main/hue-lights-adaptive-cards/resources/hue-lights-control-center-diagram.png" align="center">


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
3. While creating the app, make sure you set the following permission: Team Messaging. [Team Messaging](https://developers.ringcentral.com/api-reference/Adaptive-Cards/createGlipAdaptiveCard) is required for the script to execute RingCentral's API that allows you to push Adaptive Cards into RingCentral MVP. 
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

Before executing the script there are a couple of things you'll need to take care first.

## Setup your .env file

In this repository, you'll find a template for the `.env` file named `template.env`. Just rename that file to `.env` to be readable by your script.

After that, simply add your RingCentral credentials as well as your Philips Hue light parameters into the .env environment file:

```
###########################################################################
############# Philips Hue Adaptive Cards for RingCentral ##################
###########################################################################

#### RingCentral Environment Parameters Below ####


RC_SERVER_URL        = 'https://platform.devtest.ringcentral.com' # Sandbox
#RC_SERVER_URL      = 'https://platform.ringcentral.com'          # Production

RC_CLIENT_ID        = '*******'
RC_CLIENT_SECRET    = '*******'
RC_USERNAME         = '~'
RC_PASSWORD         = ''
RC_EXTENSION        = '~'

# Authorization
RC_REDIRECT_URL     = 'http://localhost:5000/oauth2callback'
RC_JWT              = '*******'

RC_BEARER_TOKEN     = ''

# GLIP Group for Adaptive Cards
RC_GROUP        = '*******'


#### Philips Hue Environment Parameters Below ####

HUE_SERVER          = 'https://*******.ngrok.io/hue'
HUE_BRIDGE          = '*******'
HUE_DEV_ID          = '*******'
HUE_LIGHT_ID        = '*******'
HUE_LIGHT_NAME      = '*******'
```

The script is ready to automatically fetch new a new Bearer Token using the JWT method. For that, simply leave the `RC_BEARER_TOKEN` field blank.

`RC_GROUP` is the RingCentral MVP group ID upon which we send the Adaptive Card. A simple trick to fetch this ID is to use the [web-browser](https://app.ringcentral.com/) version of RingCentral App, navigate through `Message` > `TEAMS` and select the MVP channel of choice. With that selection, you'll notice the numeric ID at the end of the URL path (static http address). For example `https://app.ringcentral.com/messages/123456789`. The value to use on `RC_GROUP` is that numeric value `123456789`.

`HUE_PORT` is 8088 by default. Change it here in case you need to use a different Port number.

`HUE_BRIDGE` IP Address, the `HUE_DEV_ID` (developer ID) and your `HUE_LIGHT_ID` can be easily found using Philips Hue developer tools. You'll find almost everything required to run this exercise in Philips Hue's `Getting Started` tutorial that can be found [here](https://developers.meethue.com/develop/get-started-2/).


## Setup Team Messaging's Outbound Webhook URL

As an interactive card, the Adaptive Card will be receiving and sending your input actions to an external URL (your node.js script). You need to configure that URL in your RingCentral Developer Portal for the app to work. For that please follow the steps below:

1. Login to your [RingCentral Developer Account](https://developers.ringcentral.com/login.html#/)
2. Navigate to your [RingCentral Developer Console](https://developers.ringcentral.com/my-account.html#/applications) and select the app that is hosting this application. 
3. Once in the app, please go to the `Settings` panel and scroll down until you find `App Features`. 
4. In `App Features` please make sure that the `Interactive Messages` box is selected and in the `Outbound Webhook URL` field please add the ngrok generated URL that we created previously followed by `/huemonitor`. Example: `https://d972-176-xxx-xxx-246.ngrok.io/huemonitor`
5. Once done, please click on `Update`.


# Start the script

```
$ node rc-hue-lights-monitor.js 

[utc|2022/9/19|20:53:6:634] LOG - RingCentral Adaptive Cards Server for Philips HUE running on port 8088
[utc|2022/9/19|20:53:6:660] LOG - 🔐 Fetching the RC API Access Token...
[utc|2022/9/19|20:53:6:861] LOG - 💡 HUE - light turned on 💡
[utc|2022/9/19|20:53:7:173] LOG - 🔐 Success!
[utc|2022/9/19|20:53:7:173] DEBUG - 🔐 New Token: [QU1TMDFQMzFQQVMwMHxBQUFFdHZLdmltd*****************************UQ]
[utc|2022/9/19|20:53:7:741] LOG - 📩 New Adaptive Card posted with status: [201|Created]

```

# See It In Action

If you are having trouble with the setup, I've recorded a video where I'm walking through this example. To watch it, simply click on the picture/link below:

[![huepresence](https://raw.githubusercontent.com/fleitao/the-ringcentral-collection/main/hue-lights-adaptive-cards/resources/hue-lights-control-center-cover.png)](https://youtu.be/pjGBl5rbj1s)

