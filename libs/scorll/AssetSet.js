var Asset = require('libs/scorll/Asset');
var AssetPO = require('libs/scorll/model/Asset');

var AssetSet = function () {
    this.assetCount = 0;
    this.assets = {};
  }

AssetSet.prototype.add = function (asset, callback) {
  var assetSet = this;
  asset.save(function (err) {
    if (err) {
      callback && callback(err);
      return;
    }
    assetSet.assets[asset.getId()] = asset;
    assetSet.assetCount++;
    console.log('Asset added. ' + assetSet.assetCount + " asset(s) in total.");
    callback && callback(null);
  });
}

AssetSet.prototype.delete = function (asset, callback) {
  var assetSet = this;
  asset.remove(function (err) {
    if (err) {
      callback && callback(err);
      return;
    }
    if (assetSet.assets[asset.getId()]) {
      delete assetSet.assets[asset.getId()];
      assetSet.assetCount--;
      console.log('Asset removed. ' + assetSet.assetCount + " asset(s) in total.");
    }
    callback && callback();
  });
}

AssetSet.prototype.findById = function (id, callback) {
  var assetSet = this;
  var asset = this.assets[id];
  if (asset) {
    callback && callback(null, asset);
    return;
  }
  AssetPO.findById(id, function (err, assetPO) {
    if (err) {
      callback && callback(err);
      return;
    }
    var args = {
      po: assetPO
    }
    var asset = new Asset(args);
    assetSet.assets[asset.getId()] = asset;
    assetSet.assetCount++;
    console.log('Asset added. ' + assetSet.assetCount + " asset(s) in total.");
    callback && callback(err, asset);
  });
}

module.exports = AssetSet;
