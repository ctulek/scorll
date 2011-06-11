require.paths.unshift(__dirname + "/../../../");
var vows = require('vows'),
    assert = require('assert');

var Asset = require('libs/scorll/Asset');
var ClientComponentSet = require('libs/scorll/ClientComponentSet');
var clientComponentSet = new ClientComponentSet();

vows.describe("Asset Class").addBatch({
    'create instance': {
        topic: function () {
            var assetData = {
                id: 5,
                type: "Text",
                clientComponentSet: clientComponentSet
            }
            return new Asset(assetData)
        },
        'is Asset': function (topic) {
            assert.ok(topic instanceof Asset);
        },
        'componentId returns "5"': function (topic) {
            assert.equal(topic.getId(), "5");
        }
    }
}).export(module);
