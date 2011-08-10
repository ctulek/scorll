var async = require('async');

var Asset = require('libs/scorll/Asset');
var AssetPO = require('libs/scorll/model/Asset');
var ContentPO = require('libs/scorll/model/Content');

var Content = function (args) {
    for (var i in args) {
      this[i] = args[i];
    }
  }

Content.prototype.getId = function () {
  return this.po ? this.po.id : null;
}

Content.prototype.getOwnerId = function () {
  return this.po ? this.po.ownerId : null;
}

Content.prototype.save = function (callback) {
  if (!this.po) {
    callback && callback();
  }
  this.po.save(function (err) {
    callback && callback(err);
  });
}

Content.prototype.delete = function (callback) {
  if (!this.po) {
    callback && callback();
  }
  this.po.remove(function (err) {
    callback && callback(err);
  });
}

Content.prototype.setTitle = function (client, newTitle, callback) {
  var content = this;
  this.po.title = newTitle;
  client && client.broadcast(content.getId(), '_setTitle', newTitle);
  this.save(function () {
    callback && callback();
  });
}

Content.prototype.addAsset = function (client, assetData, position, callback) {
  var content = this;
  var args = {
    po: new AssetPO(assetData)
  }
  var asset = new Asset(args);
  if (position === undefined || position === null) {
    position = content.po.assets.length;
  }
  content.assetSet.add(asset, function (err) {
    if (err) {
      callback && callback(err);
      return;
    }
    content.po.assets.splice(position, 0, asset.getId());
    content.clientComponentSet && content.clientComponentSet.add(asset);
    client && client.group.each(function(otherClient) {
      var isTeacher = (content.getOwnerId() && content.getOwnerId() ==
        otherClient.user.getId());
      otherClient.call(content.getId(), '_add',
        asset.toAssetData(isTeacher), position);
    });
    content.save(function (err) {
      callback && callback();
    });
  });
}

Content.prototype.updateAsset = function (client, assetData, callback) {
  var content = this;
  this.assetSet.findById(assetData.id, function (err, asset) {
    if (err) {
      callback && callback(err);
      return;
    }
    asset.populate(assetData);
    client && client.group.each(function(otherClient) {
      var isTeacher = (content.getOwnerId() && content.getOwnerId() ==
        otherClient.user.getId());
      otherClient.call(content.getId(), '_update',
        asset.toAssetData(isTeacher));
    });
    asset.save(function (err) {
      callback && callback();
    });
  });
}

Content.prototype.deleteAsset = function (client, assetId, callback) {
  var content = this;
  this.assetSet.findById(assetId, function (err, asset) {
    if (err) {
      callback && callback(err);
      return;
    }
    asset.delete(function (err) {
      var position = content.po.assets.indexOf(assetId);
      if (position > -1) {
        content.po.assets.splice(position, 1);
        client && client.broadcast(content.getId(), '_remove', assetId);
        content.save(function (err) {
          callback && callback();
        });
      }
    });
  });
}

Content.prototype.moveAsset = function (client, assetId, position, callback) {
  for (var i in this.assets) {
    if (this.assets[i] == assetId) {
      var asset = this.po.assets.splice(i, 1);
      var index = position;
      if (i < index) {
        index--;
      }
      this.po.assets.splice(index, 0, assetId);
      break;
    }
  }

  client && client.broadcast(this.getId(), '_move', assetId, position);
  this.save(function (err) {
    callback && callback();
  });
}

Content.prototype.load = function (client, callback) {
  var content = this;
  console.log(content.po.assets);
  var isTeacher = (content.getOwnerId() && content.getOwnerId() == client.user.getId());
  console.log(isTeacher);
  async.map(content.po.assets, function (assetId, callback) {
    content.assetSet.findById(assetId, function (err, asset) {
      content.clientComponentSet && content.clientComponentSet.add(asset);
      callback(null, asset.toAssetData(isTeacher));
    });
  }, function (err, assets) {
    var data = {
      id: content.getId(),
      title: content.po ? content.po.title : null,
      description: content.po ? content.po.description : null,
      assets: assets
    }
    callback(err, data);
  });
}

module.exports = Content;
