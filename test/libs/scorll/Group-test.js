var vows = require('vows'),
    assert = require('assert');

var Group = require('libs/scorll/Group');
var Client = require('libs/scorll/Client');
var IoClientMockup = require('test/libs/scorll/IoClientMockup');

vows.describe('Group Class').addBatch({
    'create instance': {
        topic: function () {
            return new Group(1);
        },
        'instance of Group': function (group) {
            assert.ok(group instanceof Group);
        },
        'join client': {
            topic: function (group) {
                var callback = this.callback;
                var args = {
                    ioClient: IoClientMockup.getInstance(5)
                };
                var client = new Client(args);
                group.join(client, function (err) {
                    callback(err, group);
                });
            },
            'client count is 1': function (group) {
                assert.equal(group.clientCount, 1);
            },
            'join second client': {
                topic: function (group) {
                    var callback = this.callback;
                    var args = {
                        ioClient: IoClientMockup.getInstance(6)
                    };
                    var client = new Client(args);
                    group.join(client, function (err) {
                        callback(err, group);
                    });
                },
                'client count is 2': function (group) {
                    assert.equal(group.clientCount, 2);
                },
                'send message to all clients': {
                    topic: function (group) {
                        var message = {
                            x: 5,
                            y: 6
                        }
                        group.broadcast('component5', 'test4', 1, 2);
                        return group;
                    },
                    '2 clients received the message': function (group) {
                        group.each(function (client) {
                            assert.equal(client.ioClient.lastMessage.componentId, 'component5');
                            assert.equal(client.ioClient.lastMessage.method, 'test4');
                            assert.equal(client.ioClient.lastMessage.params[0], 1);
                            assert.equal(client.ioClient.lastMessage.params[1], 2);
                        });
                    },
                    'clients leave': {
                        topic: function (group) {
                            var callback = this.callback;
                            group.findById(5, function (err, client) {
                                group.leave(client, function () {
                                    group.findById(6, function (err, client) {
                                        group.leave(client, function () {
                                            callback(null, group);
                                        });
                                    });
                                });
                            })
                        },
                        'no clients left': function (group) {
                            assert.equal(group.clientCount, 0);
                        }
                    }
                }
            }
        },
    }
}).export(module);
