const logger = require('./logger');
const LOG_ID = "STARTER/WATSON - ";

var AssistantV2 = require('watson-developer-cloud/assistant/v2');

class Watson {

    constructor() {
        this.keys = null;
        this.assistant = null;
        this.assistantSessionStorage = {};
    }

    start(configKeys) {

        return new Promise((resolve, reject) => {
            logger.log("debug", LOG_ID + "start() - enter");

            this.keys = configKeys;

            logger.log("info", LOG_ID + "connect to Watson Assistant V2 API");

            try {
                this.assistant = new AssistantV2({
                    "version": "2018-11-08"
                });
                resolve();
            } catch (err) {
                logger.log("error", LOG_ID + "Can't connect to Watson " + JSON.stringify(err));
                resolve();
            }
        });
    }

    sendMessage(message, conversationId, callback) {
        let that = this;
        logger.log("debug", LOG_ID + "sendMessage() - enter");

        return new Promise(async (resolve, reject) => {

            if (that.assistant) {

                let sessionId = that.assistantSessionStorage[conversationId] && that.assistantSessionStorage[conversationId].session_id;
                if (!sessionId) {
                    sessionId = await new Promise((resolve, reject) => {
                        that.assistant.createSession({
                                "assistant_id": that.keys.watson_assistant_id
                            },
                            (err, response) => {
                                if (err) {
                                    logger.log("error", LOG_ID + err);
                                    throw err;
                                } else {
                                    logger.log("debug", LOG_ID + JSON.stringify(response, null, 2));
                                    resolve(response.session_id);
                                }
                            });
                    });
                    that.assistantSessionStorage[conversationId] = {
                        "session_id": sessionId
                    }
                }

                logger.log("info", LOG_ID + "sendMessage() - try to send a message to Watson...");

                that.assistant.message({
                    "input": {
                        'message_type': 'text',
                        'text': message
                    },
                    "assistant_id": that.keys.watson_assistant_id,
                    "session_id": sessionId
                }, (err, response) => {

                    if (err) {
                        logger.log("error", LOG_ID + "Can't send a message " + JSON.stringify(err));
                        reject(err);
                    } else {

                        let intent = "";
                        let message = "";
                        let action = "";
                    
                        if (response.intents && response.intents.length > 0) {
                            intent = response.intents[0].intent;
                            logger.log("info", LOG_ID + "sendMessage() - intent detected: #" + intent);
                        }
                    
                        if (response.output.generic 
                            && response.output.generic.length > 0
                            && response.output.generic[0].response_type === "text") {
                            message = response.output.generic[0].text;
                            logger.log("info", LOG_ID + "sendMessage() - text received: " + message);
                        }
                    
                        if (response.output.actions && response.output.actions.length > 0) {
                            action = response.output.actions[0];
                            logger.log("info", LOG_ID + "sendMessage() - action received: " + action);
                        }

                        resolve({
                            "intent": intent,
                            "message": message,
                            "action": action
                        });
                    }
                });
            } else {
                logger.log("error", LOG_ID + "sendMessage() - No watson assistant defined, can't send message...");
                reject(null);
            }
        });
    }
}

module.exports = new Watson();