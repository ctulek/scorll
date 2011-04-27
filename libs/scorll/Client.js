var content = require('libs/scorll/Content.js');
var asset = require('libs/scorll/Asset.js');

var clientCount = 0;

exports.add = function(client) {
    clientCount++;
	console.log('Client connected. ' + clientCount + " client(s) in total.");
	client.on('message', function(message) {
        var callback = null;
        if(message.callbackId) {
            var callbackId = message.callbackId;
            callback = function(err, message) {
                message.callbackId = callbackId;
                client.send(message);
            }
        }
        
        if(message.componentType == "content") {
            content.handle(this, message, callback);
        } else if(message.componentType == "asset") {
            asset.handle(this, message, callback);
        }
	});
	client.on('disconnect', function() {
        clientCount--;
        console.log('Client disconnected. ' + clientCount + " client(s) in total.");
	});
}
