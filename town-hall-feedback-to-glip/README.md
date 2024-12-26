<div align="center">
  
# Town Hall Feedback to Glip
Send your citizens' feedback directly to a RingEX glip group.


<img src="placeholder to image" align="center">


</div>

# What You'll Need

* [ngrok](https://ngrok.com/) (optional)
* [RingCentral Developer Account](https://developers.ringcentral.com/login.html#/)
* [Philips Hue Lamp](https://www.philips-hue.com/en-gb) 
* [Cloudinary Account](https://cloudinary.com/)
* [node.js](https://nodejs.org/)


# Getting Started

## ngrok

Skip this step if you are working on a VPS with a public IP address.

If you're using your own machine to host the webhook server, download ngrok if you have not already. It is a handy tool that provides an external URL to map to localhost:port. 

The application defaults to port 8089, so launch ngrok HTTP mapping to port 8088:

```$ ngrok http 8089```

Be sure to copy the forwarding ngrok URL, we’ll need that later to configure the webhook server.

## RingCentral Developer Account Setup

1. Create a RingEX Account ([here](https://app.ringcentral.com/signup))
2. Create a new app (there's a nice starting guide [here](https://developers.ringcentral.com/guide/voice/quick-start))
3. While creating the app, make sure you set Team Messaging permissions. [Team Messaging](https://developers.ringcentral.com/guide/team-messaging) is required for the app to interact with your RingCentral messaging app.
3. Once the app is created, you'll need to set up your app credentials. In this example, we are using the JWT Authentication method. This authorization method is well documented [here](https://developers.ringcentral.com/guide/authentication/jwt/create-jwt).

## node.js

For this script, we're using node.js with several dependencies that are being used for different things:

* [axios](https://axios-http.com/) to execute HTTP requests.
* [express](https://expressjs.com/) to create the web app/webhook that will be listening to event updates.
* [body-parser](https://www.npmjs.com/package/body-parser) to parse JSON based requests.
* [querystring](https://nodejs.org/api/querystring.html) to enforce URL-encoded HTTP requests.
* [dotenv](https://www.npmjs.com/package/dotenv) to be able to load and use environment values stored in .env files.
* [path](https://nodejs.org/docs/latest/api/path.html) which provides utilities for working with file and directory paths.
* [fs](https://nodejs.org/api/fs.html) which provides a collection of methods for interacting with the file system.
* [cloudinary](https://www.npmjs.com/package/cloudinary) which is the SDK that we use to connect with Cloudinary.


These dependencies do not come as default node.js modules and you can fetch and install them by executing the following on the root directory of the script:

```npm install axios express body-parser querystring dotenv path cloudinary```

## Free Cloudinary Account

The [Cloudinary](https://cloudinary.com/) is an online service targeting content creators that offers tools to upload, manage and deliver media files (audio/video). It is a paid service with several [pricing tiers](https://cloudinary.com/pricing). For the purpose of this proof of concept, the free tier should be enough. Cloudinary offers a very good set of SDKs, including a [Node.JS one](https://cloudinary.com/documentation/node_integration#landingpage), which was the reason why we chose this service.


# The Basics

Before executing the script there are a couple of things you'll need to take care of first.

## Setup your .env file

In this repository, you'll find a template for the `.env` file named `template.env`. Just rename that file to `.env` to be readable by your script.

After that, simply add your RingCentral credentials, the RingCentral message channel ID to be used as well as your Cloudinary account credentials to the .env environment file:


 ```
###########################################################################
#############              Web-Form to Glip              ##################
###########################################################################

#### RingCentral Environment Parameters Below ####


RC_SERVER_URL      = 'https://platform.ringcentral.com'          # Production

RC_CLIENT_ID        = 'YDo9dy********' # Production
RC_CLIENT_SECRET    = 'W0waSP8l********' # Production
RC_USERNAME         = '~'
RC_PASSWORD         = ''
RC_EXTENSION        = '~'

RC_EXTENSION        = '~'

# RC Authorization
RC_REDIRECT_URL     = 'http://localhost:5000/oauth2callback'
RC_JWT              = 'eyCtaWWiOrI4NzYyZj********'

RC_BEARER_TOKEN     = ''

# GLIP Group for Adaptive Cards
RC_GROUP        = '141********'

RC_DEBUG        = true

# CLOUDINARY
CDN_CLOUD_NAME      = 'dh********'
CDN_API_KEY         = '47********'
CDN_API_SECRET      = 'CFs_R0********'
```

The script is ready to automatically fetch new a new Bearer Token using the JWT method. For that, simply leave the `RC_BEARER_TOKEN` field blank.

`RC_PORT` is 8089 by default. Change it here in case you need to use a different Port number.

`RC_GROUP` is the RingCentral messaging group ID upon which we send the Adaptive Card. A simple trick to fetch this ID is to use the [web-browser](https://app.ringcentral.com/) version of RingCentral App, navigate through `Message` > `TEAMS` and select the messaging channel of choice. With that selection, you'll notice the numeric ID at the end of the URL path (static http address). For example `https://app.ringcentral.com/messages/123456789`. The value to use on `RC_GROUP` is the numeric value `123456789`.

## Host your Town Hall Web Portal

To make it easy to test, I've created a few basic html web portals that you can find on this page. In reality, you could be using whatever you would like, as long as the basic information expected by the script is submitted: name, surname, phone, address and of course, the picture.


*PLACEHOLDER FOR SCREENSHOtS*


# Light It Up

You should be ready to try the script now. Let us test this out in the following order:

1. Start the Town Hall feedback-to-glip app
2. Open your RingCentral app (desktop or [web-browser](https://app.ringcentral.com/))
3. Go to your Town Hall page, fill out and submit the form.

Note: this assumes your server URL did not change. If you are using ngrok

## Start the webhook

```
$ node th-webmedia-to-glip.js 
[2024/12/26 | 17:14:7:43] LOG - RingCentral WebMedia to Glip app running on port 8089
[2024/12/26 | 17:14:7:48] LOG - 🔐 Fetching the RC API Access Token...
[2024/12/26 | 17:14:7:501] LOG - 🔐 Success!
[2024/12/26 | 17:14:7:501] DEBUG - 🔐 New Token: [QU1TMDFQMzFQQVMwM***]
[2024/12/26 | 17:14:8:43] LOG - 📩 New Adaptive Card posted: [201|Created]
```



# See It In Action
If you are having trouble with the setup, I've recorded a video where I'm walking through this example. To watch it, simply click on the picture/link below:

*PLACEHOLDER FOR VIDEO*

<!--
[![huepresence](https://raw.githubusercontent.com/fleitao/the-ringcentral-collection/main/hue-light-presence-indicator/resources/hue_presence_demo_cover.png)](https://youtu.be/w--DD7qJFSg)
-->
