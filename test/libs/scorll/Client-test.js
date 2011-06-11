var vows = require('vows'),
    assert = require('assert');

var Client = require('libs/scorll/Client');
var ClientComponentSet = require('libs/scorll/ClientComponentSet');
var GroupSet = require('libs/scorll/GroupSet');

var IoClientMockup = require('test/libs/scorll/IoClientMockup');
var ClientComponentMockup = require('test/libs/scorll/ClientComponentMockup');

var ioClientMockup = IoClientMockup.getInstance(5);
var clientComponentSet = new ClientComponentSet();
var clientComponentMockup = new ClientComponentMockup();
var groupSet = new GroupSet();

clientComponentSet.add(clientComponentMockup);

vows.describe('Client Class').addBatch({
    'create instance': {
        topic: function () {
            var args = {
                ioClient: ioClientMockup,
                clientComponentSet: clientComponentSet,
                groupSet: groupSet
            };
            return new Client(args);
        },
        'has ioClient': function (client) {
            assert.equal(client.ioClient, ioClientMockup);
        },
        'send message to call component method': {
            topic: function(client) {
                var message = {
                    callbackId: 1,
                    componentId: clientComponentMockup.getId(),
                    method: 'func1',
                    params: [5, 'cat']
                }
                client.message(message);
                return client;
            },
            'func1 is called': function(client) {
                var ioClient = client.ioClient;
                assert.equal(ioClient.lastMessage.callbackId, 1);
                assert.equal(ioClient.lastMessage.params[0], null);
                assert.equal(ioClient.lastMessage.params[1], client);
                assert.equal(ioClient.lastMessage.params[2], 5);
                assert.equal(ioClient.lastMessage.params[3], 'cat');
            }
        },
        'send message to callbackId': {
            topic: function(client) {
                var args;
                client._callbacks[5] = function() {
                    args = arguments;
                }
                var message = {
                    callbackId: 5,
                    params: [null, 4, 'cat']
                }
                client.message(message);
                return args;
            },
            'callback with id 5 is called': function(topic) {
                assert.equal(topic[0], null);
                assert.equal(topic[1], 4);
                assert.equal(topic[2], 'cat');
            }
        },
        'send message to call "join" method': {
            topic: function (client) {
                var message = {
                    method: 'join',
                    params: [5]
                }
                client.message(message);
                this.callback(null, client);
            },
            'call finished': function(client) {
                assert.ok(client);
            }
        }
    }
}).export(module);
