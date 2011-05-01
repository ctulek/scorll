var groups = require('libs/scorll/Groups.js');
var client = require('libs/scorll/Client.js');

var call = function(ioclient, assetId, method) {
    client.call.apply(client, arguments);
}

exports.call = function(client, assetId, method) {
    var params = Array.prototype.slice.call(arguments);  
    var callback = params.pop();
    groups.each(groups.id(client), function(client) {
        call.apply(null, params);
    });
}
