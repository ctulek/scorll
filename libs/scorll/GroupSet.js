var Group = require('libs/scorll/Group');

var GroupSet = function () {
    this.groupCount = 0;
    this.groups = {};
  }

GroupSet.prototype.add = function (group, callback) {
  if (this.groups[group.getId()]) {
    var err = new Error("Already in set");
    console.error(err);
    callback && callback(err);
    return;
  }
  this.groupCount++;
  console.info('Group added. ' + this.groupCount + " group(s) in total.");
  this.groups[group.getId()] = group;
  callback && callback(null);
}

GroupSet.prototype.delete = function (group, callback) {
  if (!this.groups[group.getId()]) {
    var err = new Error("Not in set");
    console.error(err);
    callback && callback(err);
    return;
  }
  this.groupCount--;
  delete this.groups[group.getId()];
  callback && callback();
}

GroupSet.prototype.findById = function (id, callback) {
  var group = this.groups[id];
  if (!group) {
    console.info("Adding new group");
    var args = {
      id: id
    };
    var group = new Group(args);
    this.add(group, function (err) {
      if (err) {
        console.error(err);
        callback && callback(err);
        return;
      }
      callback && callback(null, group);
    });
  }
  else {
    callback && callback(null, group);
  }
}

module.exports = GroupSet;
