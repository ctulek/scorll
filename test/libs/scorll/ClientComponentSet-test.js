var vows = require('vows'),
    assert = require('assert');

var ClientComponentSet = require('libs/scorll/ClientComponentSet');

vows.describe('ClientComponentSet Class Tests').addBatch({
    'create instance': {
        topic: function () {
            return new ClientComponentSet();
        }
    }
}).export(module);
