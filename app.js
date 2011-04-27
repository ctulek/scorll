// Scorll.org Web Application
require.paths.unshift(__dirname);
var express = require('express');
var io = require('socket.io');

var express = require('express');

var app = express.createServer(
	//express.logger(),
	express.static(__dirname + '/public'),
	express.bodyParser(),
	express.methodOverride(),
	express.cookieParser(),
	express.session({secret: 'Test'})
	);

app.set('view engine', 'jade');

var port = 8080;
app.listen(port);
console.log("Ready to serve requests on port " + port + ". Enjoy...");

var user = require('libs/scorll/User.js');
var content = require('libs/scorll/Content.js');
var asset = require('libs/scorll/Asset.js');

var socket = io.listen(app);
socket.on('connection', function(client) {
	console.log('Client connected');
	client.on('message', function(message) {
        var callback = null;
        if(message.callbackId) {
            var callbackId = message.callbackId;
            callback = function(err, message) {
                message.callbackId = callbackId;
                client.send(message);
            }
        }
        
        if(message.componentType == "user") {
            user.handle(this, message, callback);
        } else if(message.componentType == "content") {
            content.handle(this, message, callback);
        } else if(message.componentType == "asset") {
            asset.handle(this, message, callback);
        }
	});
	client.on('disconnect', function() {
		console.log('Disconnected');
	});
});


