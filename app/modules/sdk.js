"use strict";

const NodeSDK = require("rainbow-node-sdk");
const logger = require('./logger');

const LOG_ID = "STARTER/SDKN - ";

class SDK {
    
    constructor() {
        logger.log("debug", LOG_ID + "constructor()");
        this.nodeSDK = null;
        this.watson = null;
    }

    start(bot, argv) {
        return new Promise((resolve) => {

            if(argv.length >= 4) {
                bot.credentials.login = argv[2];
                bot.credentials.password = argv[3];
                logger.log("info", LOG_ID + "using " + bot.credentials.login  + " (forced by CLI)");
            }

             // Start the SDK
            this.nodeSDK = new NodeSDK(bot);

            this.nodeSDK.events.on('rainbow_onmessagereceived', (message) => {

                logger.log("debug", LOG_ID + "on message received");

                // Do not deal with messages coming from the bot loaded several times
                if(!message.cc) {

                    // Send manually a 'read' receipt to the sender
                    this.nodeSDK.im.markMessageAsRead(message);

                    if(this.watson) {

                        logger.log("info", LOG_ID + "watson is configured. Use it to understand the message");

                        // Send an answer the message to Watson
                        this.watson.sendMessage(message.content, message.conversation.id).then( (answer) => {

                            let returnMessage = "";

                            if(answer.action) {

                                // TODO: put your own logic here...
                                switch (answer.action) {
                                    default:
                                        break;
                                }

                            } else {
                                returnMessage = answer.message;
                            }

                            // Give the answer from Watson
                            if(message.type === "chat") {
                                this.nodeSDK.im.sendMessageToJid(returnMessage, message.fromJid);
                            } else if (message.type === "groupchat") {
                                this.nodeSDK.im.sendMessageToBubbleJid(returnMessage, message.fromBubbleJid);
                            }
                        });

                    } else {
                        logger.log("info", LOG_ID + "watson not configured / simple answer");

                        if(message.type === "chat") {
                            this.nodeSDK.im.sendMessageToJid("Hello!, I'm a simple bot. I'm configured to answer always like this", message.fromJid);
                        } else if (message.type === "groupchat") {
                            this.nodeSDK.im.sendMessageToBubbleJid("Hello!, I'm a simple bot. I'm configured to answer always like this", message.fromBubbleJid);
                        }
                    }
                } else {
                    logger.log("warn", LOG_ID + "on message received from self / do not answer");
                }
                
            });

            this.nodeSDK.start().then(() => {
                logger.log("debug", LOG_ID + "SDK started");
                resolve();
            });
        });
    }

    configureWatson (_watson) {
        this.watson = _watson;
    }

    restart() {
        return new Promise((resolve, reject) => {
            this.nodeSDK.events.once('rainbow_onstopped', (data) => {
                logger.log("debug", LOG_ID + "SDK - rainbow_onstopped - rainbow event received. data", data);

                logger.log("debug",  LOG_ID + "SDK - rainbow_onstopped rainbow SDK will re start");
                this.nodeSDK.start().then(() => {
                    resolve();
                });
            });

            this.nodeSDK.stop();

            /*this.nodeSDK.stop().then(() => {
                logger.log("debug", LOG_ID + "SDK stopped");
                return this.nodeSDK.start();
            }).then(() => {
                logger.log("debug", LOG_ID + "SDK started");
                resolve();
            }).catch((err) => {
                reject(err);
            });
            // */
        });
    }

    get state() {
        return this.nodeSDK.state;
    }

    get version() {
        return this.nodeSDK.version;
    }

    get sdk() {
        return this.nodeSDK;
    }
}

module.exports = new SDK();
