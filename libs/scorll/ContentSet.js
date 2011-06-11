var Content = require('libs/scorll/Content');

var ContentSet = function () {
        this.contentCount = 0;
        this.contents = {};
    }

ContentSet.prototype.add = function (content, callback) {
    if(this.contents[content.getId()]) {
        callback && callback("Already in the set");
        return;
    }
    this.contentCount++;
    console.log('Content added. ' + this.contentCount + " content(s) in total.");
    this.contents[content.getId()] = content;
    callback && callback(null);
}

ContentSet.prototype.delete = function (content, callback) {
    if(!this.contents[content.getId()]) {
        callback && callback("Not in the set");
        return;
    }
    this.contentCount--;
    delete this.contents[content.getId()];
    callback && callback();
}

ContentSet.prototype.findById = function (id, callback) {
    var content = this.contents[id];
    var err = content ? null : "Cannot find content with the id #" + id;
    callback && callback(err, content);
}

module.exports = ContentSet;
