/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');           //eason-13-add  add dependency

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello, Welcome to Annual Dinner. What is your birthday?';//eason-04-01 greeting words ⬇️ 
                                                                //That was a piece of cake! Bye! ' ; 'Welcome, you can say Hello or Help. Which would you like to try?';
        const repromptText = 'I was born Nov. 6th, 2014. When were you born?' ;
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)                              //eason-05-02 uncomment/comment to exit after speaking with/without need to listen for user's response ; if uncommented , give a example that Alexa expects user to say in provided and specified format .
            .getResponse();                                     //eason-03 ?? Callback interacting with ASK ??
    }
};

const HasBirthdayLaunchRequestHandler = {                       //eason-23-add canHandle check user's birth is saved on S3;handle notify func to SDK
    canHandle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {} ;
        
        const year = sessionAttributes.hasOwnProperty('year')?sessionAttributes.year : 0;
        const month = sessionAttributes.hasOwnProperty('month')?sessionAttributes.month : 0;
        const day = sessionAttributes.hasOwnProperty('day')?sessionAttributes.day : 0;
        
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
                && year
                && month
                && day ;
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {} ;
        
        const year = sessionAttributes.hasOwnProperty('year')?sessionAttributes.year : 0;
        const month = sessionAttributes.hasOwnProperty('month')?sessionAttributes.month : 0;
        const day = sessionAttributes.hasOwnProperty('day')?sessionAttributes.day : 0;
        
        //TODO:: Use setting API to get current date and then compute how many days until user's birthday
        //TODO:: Say Happy birthday to the user's birthday 
        
        const speakOutput = `Welcome back. It looks like there are X more days until your y-th birthday`;
        
        return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
    }
};

const CaptureBirthdayIntentHandler = {           //eason-06 alter from HelloWorld to CaptureBirthday
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CaptureBirthdayIntent';   //eason-07 alter from HelloWorld to CaptureBirthday
    },
    async handle(handlerInput) {                                                                //eason-15-add async attribute
        const year = handlerInput.requestEnvelope.request.intent.slots.year.value ;                  //eason-08-09-10
        const month = handlerInput.requestEnvelope.request.intent.slots.month.value ;
        const day = handlerInput.requestEnvelope.request.intent.slots.day.value ;
        
        //"ask-sdk-s3-persistence-adapter":"^2.0.0"                                           //eason-16-add dependency declaration::::tutorial error
        const attributesManager = handlerInput.attributesManager;                               //eason-17-add attributesManager
        let birthdayAttributes = {                                                            //eason-27alter-18add from const &construct birthdayAttributes
          "year":year,
          "month":month,
          "day":day
        };
        
        attributesManager.setPersistentAttributes(birthdayAttributes);                          //eason-19-add value set to attributesManager
        
        await attributesManager.savePersistentAttributes();                                    //eason-20-add wait for setting user information to S3
        
        const speakOutput = `Thanks, I'll remember that you were born ${month} ${day} ${year}.`;    //eason-11 alter from 'Hello World!';                                         

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const LoadBirthdayInterceptor = {                                                       //eason-21-add construct an interceptor to consolidate
    async process(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = await attributesManager.getPersistentAttributes() || {} ;
        
        const year= sessionAttributes.hasOwnProperty('year')?sessionAttributes.year:0;
        const month= sessionAttributes.hasOwnProperty('month')?sessionAttributes.month:0;
        const day= sessionAttributes.hasOwnProperty('day')?sessionAttributes.day:0;
        
        if(year&&month&&day) {
            attributesManager.setSessionAttributes(sessionAttributes);
        }
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .withPersistenceAdapter(                                                     //eason-14-add notify that persistenceAdapter exist
        new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
    )
    .addRequestHandlers(
        HasBirthdayLaunchRequestHandler,                                        //eason-24-add callback chain
        LaunchRequestHandler,
        CaptureBirthdayIntentHandler,                                           //eason-12 alter from HelloWorld to CaptureBirthday
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,                                                  //eason-??-25 whether to delete
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addRequestInterceptors(                                                    //eason-22 register an interceptor to the SDK   
        LoadBirthdayInterceptor
    )
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')                             //eason-??-26 wheter to delete
    .lambda();
