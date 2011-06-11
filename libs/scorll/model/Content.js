var util = require("util");
var events = require("events");

exports = function(params) {
    this.id = params.id || null;
    this.title = params.title || null;
    this.data = params.data || [];
}
util.inherits(exports, events.EventEmitter);

exports.prototype.add = function(asset, position, callback) {
    var index = position || this.data.length;
    this.data.splice(index, 0, asset);
    this.emit("add", asset, index);
    callback && callback(null);
}

exports.prototype.remove = function(asset, callback) {
    var index = this.data.indexOf(asset);
    this.data.splice(index,1);
    this.emit("remove", asset, index);
    callback && callback(null);
}

exports.prototype.move = function(asset, to, callback) {
    var from = this.data.indexOf(asset);
    to > from && to--;
    this.data.splice(from, 1);
    this.data.splice(to, 0, asset);
    this.emit("move", asset, from, to);
    callback && callback(null);
}
