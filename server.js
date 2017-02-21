
// Required packages
var builder = require('botbuilder');
var restify = require('restify');

//============================================================
// Setting up server and connector
//============================================================

// Connector options
var botConnectorOptions = {
    appId: process.env.MICROSOFT_APP_ID || "",
    appPassword: process.env.MICROSOFT_APP_PASSWORD || ""
};

// Handle Bot Framework messages with a restify server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   //When testing on a local machine, 3978 indicates the port to test on
   console.log('%s listening to %s', server.name, server.url); 
});

// Instatiate the chat connector to route messages and create chat bot
var connector = new builder.ChatConnector(botConnectorOptions);
server.post('/api/messages', connector.listen());

//============================================================
// Defining how bot carries on the conversation with the user
//============================================================

// Create our bot
var bot = new builder.UniversalBot(connector);

bot.dialog('/', [
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else if (session.userData.name && !session.userData.servicename) {
            session.beginDialog('/getCognitiveService');
        } else {
            next();
        }
    },
    function (session, results) {
         if (session.userData.name && !session.userData.servicename)
         {
            session.send('Hello %s!', session.userData.name);
         } else {
            if (session.userData.servicename=="Face") {
                var myUrl="https://www.microsoft.com/cognitive-services/en-us/face-api";
                var msg = session.userData.name + ", the URL for the " + session.userData.serviceapi + " service " + session.userData.servicename + " api is: " + myUrl;
            } else {
                var myUrl="https://www.microsoft.com/cognitive-services/en-us/";
               var msg = "Not able to find the service " + session.userData.servicename + ", or the API " + session.userData.serviceapi + " so am directing you to the general documentation: " + myUrl;
            }
            session.send(msg);
        }
                
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
       session.endDialog();
    }
]);

bot.dialog('/getCognitiveService', [
    function (session, args, next) {
        session.dialogData.cogservice = args || {};
        if (!session.dialogData.cogservice.name) {
            builder.Prompts.text(session, "Which Cognitive Service are you interested in?");
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.userData.servicename = results.response;
        }
        if (!session.userData.serviceapi) {
            builder.Prompts.text(session, "Which specific API?");
        } else {
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.userData.serviceapi = results.response;
        }
        session.endDialog();
    }
]);
//============================================================
// Set up some trigger actions
//============================================================

// Example of a triggered action - when user types something matched by
// the trigger, this dialog begins, clearing the stack and interrupting
// the current dialog (so be cognizant of this).
// What if we had put 'send' instead of 'endDialog' here - try this.
bot.dialog('/bye', function (session) {
    // end dialog with a cleared stack.  we may want to add an 'onInterrupted'
    // handler to this dialog to keep the state of the current
    // conversation by doing something with the dialog stack
    session.endDialog("Ok... See you later.");
}).triggerAction({matches: /^bye|Bye/i});


//============================================================
// Add-ons
//============================================================

// Serve a static web page - for testing deployment (note: this is optional)
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));



// More samples here:  https://github.com/Microsoft/BotBuilder-Samples
// And of course here:  https://github.com/Microsoft/BotBuilder/tree/master/Node/examples
