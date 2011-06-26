var util = require('util');
var events = require('events');

var IoClientMockup = function (sessionId) {
        this.sessionId = sessionId;
        this.lastMessage = null;
        var mockup = this;
        this.json = {
            send: function (message) {
                mockup.lastMessage = message;
            }
        }
    }

util.inherits(IoClientMockup, events.EventEmitter);

IoClientMockup.getInstance = function (sessionId) {
    var ioClientMockup = new IoClientMockup(sessionId);
    return ioClientMockup;
}

module.exports = IoClientMockup;
