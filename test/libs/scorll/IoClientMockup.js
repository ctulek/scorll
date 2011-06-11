var util = require('util');
var events = require('events');

var IoClientMockup = function (sessionId) {
        this.sessionId = sessionId;
        this.lastMessage = null;
    }

util.inherits(IoClientMockup, events.EventEmitter);

IoClientMockup.getInstance = function (sessionId) {
    var ioClientMockup = new IoClientMockup(sessionId);
    return ioClientMockup;
}

IoClientMockup.prototype.send = function (message) {
    this.lastMessage = message;
}

module.exports = IoClientMockup;
