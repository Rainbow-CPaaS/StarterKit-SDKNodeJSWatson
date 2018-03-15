const logger = require('./logger');
const LOG_ID = "STARTER/WATSON - ";

var watson = require('watson-developer-cloud');

class Watson {
    
    constructor() {
        this.keys = null;
        this.conversation = null;
    }

    start(configKeys) {

        return new Promise( (resolve, reject) => {
            logger.log("debug", LOG_ID + "start() - enter");

            this.keys = configKeys;

            logger.log("info", LOG_ID + "connect to Watson Conversation API");

            try {
                this.conversation = new watson.ConversationV1(this.keys);
                resolve();
            }
            catch(err) {
                logger.log("error", LOG_ID + "Can't connect to Watson", JSON.stringify(err));
                resolve();
            }
        });
    }

    sendMessage(message, callback) {

        logger.log("debug", LOG_ID + "sendMessage() - enter");

        return new Promise((resolve, reject) => {
            
            if(this.conversation) {
                
                logger.log("info", LOG_ID + "sendMessage() - try to send a message to Watson...");

                this.conversation.message({
                    "input": {text: message},
                    "workspace_id": this.keys.path.workspace_id
                }, (err, response) => {
                    
                    if(err) {
                        logger.log("error", LOG_ID + "Can't send a message " + JSON.stringify(err));
                        reject(err);
                    } else {

                        let intent = "";
                        let message = "";
                        let action = "";

                        if(response.intents && response.intents.length > 0) {
                            intent = response.intents[0].intent;
                            logger.log("info", LOG_ID + "sendMessage() - intent detected: #" + intent);
                        }

                        if(response.output.text && response.output.text.length > 0) {
                            message = response.output.text[0];
                            logger.log("info", LOG_ID + "sendMessage() - text received: " + message);
                        }

                        if(response.output.action && response.output.action.length > 0) {
                            action = response.output.action;
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
                reject(null);
            }
        });
    }
}

module.exports = new Watson();
