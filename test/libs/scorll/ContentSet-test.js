var vows = require('vows'),
    assert = require('assert');

var ContentSet = require('libs/scorll/ContentSet');
var Content = require('libs/scorll/Content');

vows.describe("ContentSet Class").addBatch({
    'get instance': {
        topic: function () {
            return new ContentSet();
        },
        'add content': {
            topic: function (contentSet) {
                var content = new Content();
                contentSet.add(content);
                return contentSet;
            },
            '1 content in total': function (contentSet) {
                assert.equal(contentSet.contentCount, 1);
            }
        }
    }
}).export(module);
