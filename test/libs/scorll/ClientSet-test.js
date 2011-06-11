var vows = require('vows'),
    assert = require('assert');

var ClientSet = require('libs/scorll/ClientSet');
var Client = require('libs/scorll/Client');
var IoClientMockup = require('test/libs/scorll/IoClientMockup');

vows.describe("ClientSet Class").addBatch({
    'get instance': {
        topic: function () {
            return new ClientSet();
        },
        'add ioclient': {
            topic: function (clientSet) {
                var ioClientMockup = new IoClientMockup.getInstance(5);
                var args = {
                    ioClient: ioClientMockup
                };
                var client = new Client(args);
                clientSet.add(client);
                this.callback(null, ioClientMockup, clientSet);
            },
            'clientSet has 1 client with id 5': function (err, ioClientMockup, clientSet) {
                assert.ok(clientSet.clients[5]);
                assert.ok(clientSet.clients[5].ioClient === ioClientMockup);
            },
            'disconnect ioClient': {
                topic: function (ioClientMockup, clientSet) {
                    ioClientMockup.emit("disconnect");
                    return clientSet;
                },
                'clientSet has no client with id 5 anymore': function (clientSet) {
                    assert.ok(!clientSet.clients[5]);
                }
            }
        }
    }
}).export(module);
