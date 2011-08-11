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
    var err = "PO is not defined";
    console.error(err);
    callback && callback(err);
  }
  this.po.save(function (err) {
    if (err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    callback && callback();
  });
}

Content.prototype.delete = function (callback) {
  if (!this.po) {
    var err = "PO is not defined";
    console.error(err);
    callback && callback(err);
  }
  this.po.remove(function (err) {
    if (err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    callback && callback();
  });
}

Content.prototype.setTitle = function (client, newTitle, callback) {
  var content = this;
  content.po.title = newTitle;
  content.save(function (err) {
    if (err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    client && client.broadcast(content.getId(), '_setTitle', newTitle);
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
      console.error(err);
      callback && callback(err);
      return;
    }
    content.po.assets.splice(position, 0, asset.getId());
    content.clientComponentSet && content.clientComponentSet.add(asset);
    content.save(function (err) {
      if (err) {
        console.error(err);
        callback && callback(err);
        return;
      }
      client && client.group.each(function (otherClient) {
        var isTeacher = (content.getOwnerId() && content.getOwnerId() == otherClient.user.getId());
        otherClient.call(content.getId(), '_add', asset.toAssetData(isTeacher), position);
      });
      callback && callback();
    });
  });
}

Content.prototype.updateAsset = function (client, assetData, callback) {
  var content = this;
  this.assetSet.findById(assetData.id, function (err, asset) {
    if (err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    if(!asset) {
      err = "Cannot find asset " + assetData.id;
      console.error(err);
      callback && callback(err);
      return;
    }
    asset.populate(assetData);
    asset.save(function (err) {
      if(err) {
        console.error(err);
        callback && callback(err);
        return;
      }
      client && client.group.each(function (otherClient) {
        var isTeacher = (content.getOwnerId() && content.getOwnerId() == otherClient.user.getId());
        otherClient.call(content.getId(), '_update', asset.toAssetData(isTeacher));
      });
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
      if(err) {
        console.error(err);
        callback && callback(err);
        return;
      }
      var position = content.po.assets.indexOf(assetId);
      if (position > -1) {
        content.po.assets.splice(position, 1);
        client && client.broadcast(content.getId(), '_remove', assetId);
        content.save(function (err) {
          if(err) {
            console.error(err);
            callback && callback(err);
            return;
          }
          callback && callback();
        });
      }
    });
  });
}

Content.prototype.moveAsset = function (client, assetId, position, callback) {
  var content = this;
  var found = false;
  for (var i in content.po.assets) {
    if (content.po.assets[i] == assetId) {
      found = true;
      content.po.assets.splice(i, 1);
      var index = position;
      if (i < index) {
        index--;
      }
      content.po.assets.splice(index, 0, assetId);
      break;
    }
  }

  if(!found) {
    var err = "Cannot find asset " + assetId;
    console.error(err);
    callback && callback(err);
    return;
  }

  content.save(function (err) {
    if(err) {
      console.error(err);
      callback && callback(err);
      return;
    }
    client && client.broadcast(content.getId(), '_move', assetId, position);
    callback && callback();
  });
}

Content.prototype.load = function (client, callback) {
  var content = this;
  var isTeacher = (content.getOwnerId() && content.getOwnerId() == client.user.getId());
  async.map(content.po.assets, function (assetId, callback) {
    content.assetSet.findById(assetId, function (err, asset) {
      if(err) {
        console.error(err);
        callback && callback(err);
        return;
      }
      if(!asset) {
        err = "Cannot find asset " + assetId;
        console.error(err);
        callback && callback(err);
        return;
      }
      content.clientComponentSet && content.clientComponentSet.add(asset);
      callback(null, asset.toAssetData(isTeacher));
    });
  }, function (err, assets) {
    if(err) {
      console.error(err);
      callback && callback(err);
    }
    var data = {
      id: content.getId(),
      title: content.po ? content.po.title : null,
      description: content.po ? content.po.description : null,
      assets: assets
    }
    callback && callback(null, data);
  });
}

module.exports = Content;
