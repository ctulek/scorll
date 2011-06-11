// Scorll.org Web Application
require.paths.unshift(__dirname);
var express = require('express');
var io = require('socket.io');

var express = require('express');

var Client = require('libs/scorll/Client');
var ClientSet = require('libs/scorll/ClientSet');
var ClientComponentSet = require('libs/scorll/ClientComponentSet');
var GroupSet = require('libs/scorll/GroupSet');
var ContentSet = require('libs/scorll/ContentSet');

var clientSet = new ClientSet();
var clientComponentSet = new ClientComponentSet();
var groupSet = new GroupSet();
var contentSet = new ContentSet();

var app = express.createServer(
    //express.logger(),
    express.static(__dirname + '/public'),
    express.bodyParser(),
    express.methodOverride(),
    express.cookieParser(),
    express.session({secret: 'Test' })
    );

app.set("view engine", "jade");
app.register(".html", require("jade"));

app.contentSet = contentSet;
require('controller/index.js')(app);

var port = 8080;
app.listen(port);
console.log("Ready to serve requests on port " + port + ". Enjoy...");


var socket = io.listen(app);
socket.on('connection', function (ioClient) {
    var args = {
        ioClient: ioClient,
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
    var AssetSet = require('libs/scorll/AssetSet');

    var args = {
        id: 1,
        title: "Test test test",
        assetSet: new AssetSet(),
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
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vulputate dictum egestas. Curabitur nisi nisi, pellentesque quis sodales id, euismod ut magna. Ut dui lectus, volutpat id dictum sit amet, accumsan nec tortor. Aliquam ac dui non leo aliquam lacinia. Ut egestas nisi a magna elementum scelerisque. Sed mattis facilisis nunc quis elementum. Aenean nisl dui, lobortis sed vehicula porttitor, consectetur nec ante. Vivamus vestibulum dignissim sollicitudin. Aliquam vulputate, est vel vehicula convallis, mi nunc consectetur dui, quis condimentum ligula augue sed elit."
        }
    }, {
        type: "text",
        data: {
            title: "Lorem bolem",
            text: "Curabitur congue, leo a sodales pulvinar, lacus mi consectetur libero, a blandit turpis sapien a nisi. Donec fringilla enim faucibus risus tincidunt pretium. Integer rhoncus tincidunt pulvinar. Ut quis enim vitae dui tristique rhoncus et non tellus. Sed convallis turpis ut arcu sagittis lobortis. Quisque commodo posuere venenatis. Morbi aliquet rutrum auctor. Phasellus facilisis justo vel purus fringilla eget tristique est varius."
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

