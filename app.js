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

var client = require('libs/scorll/Client.js');

var socket = io.listen(app);
socket.on('connection', function(socketClient) {
    client.add(socketClient);
});


