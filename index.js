"use strict";

// Load the SDK for Node.JS
const sdk = require('./app/modules/sdk');
const logger = require('./app/modules/logger');
const router = require('./app/modules/router');

// Load watson connector
const Watson = require('./app/modules/watson');

// Load configuration
//const bot = require("./app/config/bot.json");
const defaultServer = require("./app/config/router.json");
const watsonServer = require("./app/config/watson.json");
const json = require('comment-json');
const fs = require('fs');
const botfile = fs.readFileSync("./app/config/bot.json");
let txt = botfile.toString();
let bot = json.parse(txt);

json.stringify(bot, null, 2);


const LOG_ID = "STARTER/INDX - ";

const VCAP_SERVICES = process.env.VCAP_SERVICES ? JSON.parse(process.env.VCAP_SERVICES) : undefined;

if (VCAP_SERVICES && VCAP_SERVICES['user-provided']) {
    const rainbow_settings = VCAP_SERVICES['user-provided'].find((setting) => {
        if (Object.keys(setting.credentials).find((entry) => entry.toLowerCase().startsWith('rainbow'))) {
            bot.credentials.login = setting.credentials.rainbow_login;
            bot.credentials.password = setting.credentials.rainbow_password;
            bot.application.appID = setting.credentials.rainbow_appid;
            bot.application.appSecret = setting.credentials.rainbow_appsecret;
            bot.rainbow.host = setting.credentials.rainbow_host;
        }
    });
}

if (process.env.WATSON_ASSISTANT_ID) {
    watsonServer.watson_assistant_id = process.env.WATSON_ASSISTANT_ID;
}

// Start the SDK
sdk.start(bot, process.argv).then(() => {
    // Start the router
    return router.start(process.argv, defaultServer, sdk);
}).then(() => {
    // Start Watson
    return Watson.start(watsonServer);
}).then(() => {
    // Link SDK and Watson
    sdk.configureWatson(Watson);
}).then(() => {
    logger.log("debug", LOG_ID + "starter-kit Watson initialized");
});