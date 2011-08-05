// Scorll.org Web Application
require.paths.unshift(__dirname);
var express = require('express');

var express = require('express');

var Client = require('libs/scorll/Client');
var ClientSet = require('libs/scorll/ClientSet');
var ClientComponentSet = require('libs/scorll/ClientComponentSet');
var GroupSet = require('libs/scorll/GroupSet');
var ContentSet = require('libs/scorll/ContentSet');
var AssetSet = require('libs/scorll/AssetSet');

var clientSet = new ClientSet();
var clientComponentSet = new ClientComponentSet();
var groupSet = new GroupSet();
var contentSet = new ContentSet();
var assetSet = new AssetSet();

var app = express.createServer(
    express.static(__dirname + '/public'),
    express.bodyParser(),
    express.methodOverride(),
    express.cookieParser(),
    express.session({secret: 'Test' })
    );

new require('./config.js')(app);

app.contentSet = contentSet;
app.assetSet = assetSet;
app.groupSet = groupSet;
app.clientComponentSet = clientComponentSet;
require('controller/index.js')(app);

app.listen(app.set("port"));
console.log("Ready to serve requests on port " + app.set('port') + ". Enjoy...");

var io = require("socket.io").listen(app);
io.sockets.on('connection', function (ioClient) {
    var args = {
        ioClient: ioClient,
        contentSet: contentSet,
        clientComponentSet: clientComponentSet,
        groupSet: groupSet
    };
    var client = new Client(args);
    clientSet.add(client);
});

// Populate Test Data
(function() {
    var Content = require('libs/scorll/Content');
    var Group = require('libs/scorll/Group');

    var args = {
        id: 1,
        title: "Scorll (Early Alpha)",
        user: {},
        assetSet: assetSet,
        clientComponentSet: clientComponentSet
    }
    var content = new Content(args);
    contentSet.add(content);
    clientComponentSet.add(content);
    args = {
        id: 1
    }
    var group = new Group(args);
    groupSet.add(group);

    var assets = [{
        type: "text",
        data: {
            title: "What is Scorll?",
            text: "It's a tool for teachers to quickly prepare learning content and share with their students.\n\nA content is basically a list of assets created by teachers either from scratch (like Text, Quizzes, Graphs) or added from Internet by simply passing the URL (like YouTube, Vimeo, Scribd, SlideShare)."
        }
    }, {
        type: "text",
        data: {
            title: "How does it work?",
            text: "To create a Scorll Document, Teachers don't need to manage a class/school/group etc. In that respect, Scorll is different from a classical LMS. Creating a document and using it in your class is as simple as visiting [[http://scorll.com/new]] and sharing the unique URL with your students.\n\nThis document itself is a Scorll Document. Feel free to play with it. Please remember that this is an early alpha preview so your documents won't persist for too long (each server restart basically kills everything)"
        }
    }, {
        type: "image",
        data: {
            url: "http://www.worcesterk12.com/media/medium/Service_Learning.jpg"
        }
    }, {
        type: "multiplechoice",
        data: {
            question: "Where is the United States Capitol?",
            correctResponses: [
                ['0']
            ],
            answers: ["Washington", "New York", "San Francisco", "Boston"]
        }
    }, {
        type: "youtube",
        data: {
            video: "NDfew0YcDTo"
        }
    }, {
        type: "vimeo",
        data: {
            video: "22721995"
        }
    }];

    assets.forEach(function(assetData) {
        content.addAsset(null, assetData);
    });
})();

