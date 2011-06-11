var vows = require('vows'),
    assert = require('assert');

vows.describe("Test Vows Framework").addBatch({
    'unit testing works?': {
        topic: true,
        'yes': function(topic) {
            assert.ok(topic);
        }
    }
}).export(module);
