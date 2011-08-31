var Content = require('libs/scorll/Content');
var ContentPO = require('libs/scorll/model/Content');

var ContentSet = function (args) {
    this.contentCount = 0;
    this.contents = {};
    for (var i in args) {
      this[i] = args[i];
    }
  }

ContentSet.prototype.add = function add(content, callback) {
  var contentSet = this;
  content.save(function (err) {
    if (err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    contentSet.contents[content.getId()] = content;
    contentSet.contentCount++;
    console.info('Content added. ' + contentSet.contentCount + " content(s) in total.");
    callback && callback(null);
  });
}

ContentSet.prototype.delete = function _delete(content, callback) {
  var contentSet = this;
  content.delete(function (err) {
    if (err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    if (contentSet.contents[content.getId()]) {
      delete contentSet.contents[content.getId()];
      contentSet.contentCount--;
      console.info('Content removed. ' + contentSet.contentCount + " content(s) in total.");
    }
    callback && callback();
  });
}

ContentSet.prototype.findById = function findById(id, callback) {
  var contentSet = this;
  var content = contentSet.contents[id];
  if (content) {
    callback && callback(null, content);
    return;
  }
  ContentPO.findById(id, function (err, contentPO) {
    if (err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    var args = {
      po: contentPO,
      assetSet: contentSet.assetSet,
      clientComponentSet: contentSet.clientComponentSet
    }
    var content = new Content(args);
    contentSet.contents[content.getId()] = content;
    contentSet.contentCount++;
    console.info('Content added from database. ' + contentSet.contentCount + " content(s) in total.");
    callback && callback(err, content);
  });
}

module.exports = ContentSet;
