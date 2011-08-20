// Scorll.org Web Application
require.paths.unshift(__dirname);
require('mongoose').connect('mongodb://localhost/scorll');
var async = require('async');
var ObjectId = require('mongoose').Schema.ObjectId;
var express = require('express');

var express = require('express');
var gzip = require('connect-gzip');

var Client = require('libs/scorll/Client');
var ClientSet = require('libs/scorll/ClientSet');
var UserSet = require('libs/scorll/UserSet');
var ClientComponentSet = require('libs/scorll/ClientComponentSet');
var GroupSet = require('libs/scorll/GroupSet');
var ContentSet = require('libs/scorll/ContentSet');
var AssetSet = require('libs/scorll/AssetSet');

var clientSet = new ClientSet();
var clientComponentSet = new ClientComponentSet();
var groupSet = new GroupSet();
var assetSet = new AssetSet();
var contentSet = new ContentSet({assetSet: assetSet, clientComponentSet:
clientComponentSet});
var userSet = new UserSet({contentSet: contentSet});

var ContentPO = require('libs/scorll/model/Content');

var app = express.createServer(
    express.bodyParser(),
    express.methodOverride(),
    express.cookieParser()
    );

app.configure("production", function() {
  staticOptions = {maxAge: 30 * 24 * 60 * 60 * 1000};
  app.use(gzip.staticGzip(__dirname + '/public', staticOptions));
});
app.configure("development", function() {
  app.use(express.static(__dirname + '/public', {}));
});

new require('./config.js')(app);

app.contentSet = contentSet;
app.assetSet = assetSet;
app.groupSet = groupSet;
app.userSet = userSet;
app.clientComponentSet = clientComponentSet;
require('controller/index.js')(app);

app.listen(app.set("port"));
console.log("Ready to serve requests on port " + app.set('port') + ". Enjoy...");

var io = require("socket.io").listen(app);

io.configure(function(){
  io.enable('browser client minification');
  io.enable('browser client etag');
  io.set('log level', 1);

  io.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
  ]);
});

io.sockets.on('connection', function (ioClient) {
    var args = {
        ioClient: ioClient,
        contentSet: contentSet,
        clientComponentSet: clientComponentSet,
        groupSet: groupSet,
        userSet: userSet
    };
    var client = new Client(args);
    clientSet.add(client);
});

ContentPO.find({}).sort('created', 1).limit(1).find({}, function(err, content) {
  if(err) {
    console.log(err);
    return;
  }
  if(content.length > 0) {
    console.log("Database has the default contents");
    app.defaultContentId = content[0].id;
  } else {
    console.log("Creating content");
    defaultContent();
  }
});

function defaultContent() {
    var Content = require('libs/scorll/Content');
    var Group = require('libs/scorll/Group');

    var args = {
        title: "Scorll (Early Alpha)",
        owner: 0
    }
    var po = new ContentPO(args);
    var args = {
      po: po,
      assetSet: assetSet,
      clientComponentSet: clientComponentSet
    }
    var content = new Content(args);
    contentSet.add(content, function() {
      app.defaultContentId = content.getId();
      clientComponentSet.add(content);
      args = {
          id: content.getId()
      }
      var group = new Group(args);
      groupSet.add(group);
    });

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
            answers: ["Washington", "New York", "San Francisco", "Boston"]
        },
        interaction: {
          type: "choice",
          correctResponses: [
            ['0']
          ],
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

    async.forEachSeries(assets, function(assetData, callback) {
        content.addAsset(null, assetData, null, function() {
          callback();
        });
    }, function() {});
};

