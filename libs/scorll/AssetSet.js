var Asset = require('libs/scorll/Asset');

var AssetSet = function () {
        this.assetCount = 0;
        this.assets = {};
    }

AssetSet.prototype.add = function (asset, callback) {
    if(this.assets[asset.getId()]) {
        callback && callback("Already in the set");
        return;
    }
    this.assetCount++;
    console.log('Asset added. ' + this.assetCount + " asset(s) in total.");
    this.assets[asset.getId()] = asset;
    callback && callback(null);
}

AssetSet.prototype.delete = function (asset, callback) {
    if(!this.assets[asset.getId()]) {
        callback && callback("Not in the set");
        return;
    }
    this.assetCount--;
    delete this.assets[asset.getId()];
    callback && callback();
}

AssetSet.prototype.findById = function (id, callback) {
    var asset = this.assets[id];
    var err = asset ? null : "Cannot find asset with the id #" + id;
    callback && callback(err, asset);
}

module.exports = AssetSet;
