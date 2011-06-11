var vows = require('vows'),
    assert = require('assert');

var GroupSet = require('libs/scorll/GroupSet');
var Group = require('libs/scorll/Group');

vows.describe("GroupSet Class").addBatch({
    'get instance': {
        topic: function () {
            return new GroupSet();
        },
        'add group': {
            topic: function (groupSet) {
                var group = new Group(1);
                groupSet.add(group);
                return groupSet;
            },
            '1 group in total': function (groupSet) {
                assert.equal(groupSet.groupCount, 1);
            }
        }
    }
}).export(module);
