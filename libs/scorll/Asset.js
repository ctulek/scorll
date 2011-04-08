var groups = require('libs/scorll/Groups.js');

exports.handle = function(client, message) {
    if(message.action == "call") {
        message.status = 'ok';
        groups.each(groups.id(client), function(client) {
            client.send(message);
        });
    }
}
