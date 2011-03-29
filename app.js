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

var socket = io.listen(app);
socket.on('connection', function(client) {
	console.log('Client connected');
	client.on('message', function(message) {
		console.log('Socket message:');
		console.log(message);
        if(message.callbackId) {
            console.log("We have a callback");
            this.send({callbackId:message.callbackId,
                data: "Hi, how are you?"
            });
        }
	});
	client.on('disconnect', function() {
		console.log('Disconnected');
	});
});

console.log("Ready to serve requests on port " + port + ". Enjoy...");
