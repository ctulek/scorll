exports.handle = function(client, message) {
    if(message.action == "call") {
        message.status = 'ok';
        client.send(message);
    }
}
