var vows = require('vows'),
    assert = require('assert');

var Content = require('libs/scorll/Content');
var Client = require('libs/scorll/Client');
var ClientComponentSet = require('libs/scorll/ClientComponentSet');
var AssetSet = require('libs/scorll/AssetSet');

var clientComponentSet = new ClientComponentSet();
var assetSet = new AssetSet();

vows.describe('Content Class').addBatch({
    'create instance': {
        topic: function () {
            var args = {
                id: 5,
                clientComponentSet: clientComponentSet,
                assetSet: assetSet
            }
            return new Content(args);
        },
        'instance of Content': function (topic) {
            assert.ok(topic instanceof Content);
            assert.equal(topic.id, 5);
        },
        'add asset': {
            topic: function (content) {
                var callback = this.callback;
                var client = new Client();
                client.group = {
                    broadcast: function () {}
                }
                var assetData = {
                    id: 56,
                    type: "Text"
                }
                content.addAsset(client, assetData, null, function (err) {
                    callback(err, content);
                });
            },
            '1 asset added': function(content) {
                assert.equal(content.assets.length, 1);
                var assetId = content.assets[0];
                assetSet.findById(assetId, function(err, asset) {
                    assert.equal(asset.id, 56);
                    assert.equal(asset.type, "Text");
                });
            },
            'update asset': {
                topic: function(content) {
                    var callback = this.callback;
                    var client = new Client();
                    client.group = {
                        broadcast: function () {}
                    }
                    var assetData = {
                        id: 56,
                        type: "Video"
                    }
                    content.updateAsset(client, assetData, function (err) {
                        callback(err, content);
                    });
                },
                '1 asset updated': function(content) {
                    var assetId = content.assets[0];
                    assetSet.findById(assetId, function(err, asset) {
                        assert.equal(asset.id, 56);
                        assert.equal(asset.type, "Video");
                    });
                }
            }
        }
    }
}).export(module);
