var async = require('async');

var Asset = require('libs/scorll/Asset');

var Content = function (args) {
    this.user = null;
    this.title = "";
    this.description = "";
    for (var i in args) {
      this[i] = args[i];
    }
    this.assets = [];
    this.id = this.id || Date.now();
  }

Content.prototype.getId = function () {
  return this.id;
}

Content.prototype.save = function (callback) {
  this.id = this.id || Date.now();
  callback && callback();
}

Content.prototype.delete = function (callback) {
  callback && callback();
}

Content.prototype.setTitle = function (client, newTitle, callback) {
  this.title = newTitle;
  client && client.broadcast(this.getId(), '_setTitle', newTitle);
  callback && callback();
}

Content.prototype.addAsset = function (client, assetData, position, callback) {
  var content = this;
  var asset = new Asset(assetData);
  if (position === undefined || position === null) {
    position = content.assets.length;
  }
  asset.save(function (err) {
    if (err) {
      callback && callback(err);
      return;
    }
    content.assetSet.add(asset, function (err) {
      if (err) {
        callback && callback(err);
        return;
      }
      content.assets.splice(position, 0, asset.getId());
      content.clientComponentSet && content.clientComponentSet.add(asset);
      client && client.broadcast(content.getId(), '_add', asset.toAssetData(), position);
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
    asset.save(function (err) {
      if (err) {
        callback && callback(err);
        return;
      }
      client && client.broadcast(content.getId(), '_update', asset.toAssetData());
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
      if (err) {
        callback && callback(err);
        return;
      }
      var position = content.assets.indexOf(assetId);
      if (position > -1) {
        content.assets.splice(position, 1);
        client && client.broadcast(content.getId(), '_remove', assetId);
        callback && callback();
      }
    });
  });
}

Content.prototype.moveAsset = function (client, assetId, position, callback) {
  for (var i in this.assets) {
    if (this.assets[i] == assetId) {
      var asset = this.assets.splice(i, 1);
      var index = position;
      if (i < index) {
        index--;
      }
      this.assets.splice(index, 0, assetId);
      break;
    }
  }
  client && client.broadcast(this.getId(), '_move', assetId, position);
  callback && callback();
}

Content.prototype.load = function (client, callback) {
  var content = this;
  async.map(this.assets, function (assetId, callback) {
    content.assetSet.findById(assetId, function (err, asset) {
      callback(null, asset.toAssetData());
    });
  }, function (err, assets) {
    var data = {
      id: content.id,
      title: content.title,
      description: content.description,
      assets: assets
    }
    callback(err, data);
  });
}

module.exports = Content;
