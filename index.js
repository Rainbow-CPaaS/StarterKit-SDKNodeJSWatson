"use strict";

// Load the SDK for Node.JS
const sdk       = require('./app/modules/sdk');
const logger    = require('./app/modules/logger');
const router    = require('./app/modules/router');

// Load watson connector
const Watson = require('./app/modules/watson');

// Load configuration
const bot = require("./app/config/bot.json");
const defaultServer = require("./app/config/router.json");
const watsonServer = require("./app/config/watson.json");

const LOG_ID = "STARTER/INDX - ";

// Start the SDK
sdk.start(bot, process.argv).then(() => {
    // Start the router
    return router.start(process.argv, defaultServer, sdk);
}).then(() => {
    // Start Watson
    return Watson.start(watsonServer);
}).then( () => {
    // Link SDK and Watson
    sdk.configureWatson(Watson);
}).then(() => {
    logger.log("debug", LOG_ID + "starter-kit Watson initialized");
});
