exports.handle = function(client, message) {
    if(message.action == "call") {
        client.send(message);
    }
}
