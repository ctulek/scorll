var Group = require('libs/scorll/Group');

var GroupSet = function () {
        this.groupCount = 0;
        this.groups = {};
    }

GroupSet.prototype.add = function (group, callback) {
    if(this.groups[group.getId()]) {
        callback && callback("Already in the set");
        return;
    }
    this.groupCount++;
    console.log('Group added. ' + this.groupCount + " group(s) in total.");
    this.groups[group.getId()] = group;
    callback && callback(null);
}

GroupSet.prototype.delete = function (group, callback) {
    if(!this.groups[group.getId()]) {
        callback && callback("Not in the set");
        return;
    }
    this.groupCount--;
    delete this.groups[group.getId()];
    callback && callback();
}

GroupSet.prototype.findById = function (id, callback) {
    var group = this.groups[id];
    var err = group ? null : "Cannot find group with the id #" + id;
    callback && callback(err, group);
}

module.exports = GroupSet;
