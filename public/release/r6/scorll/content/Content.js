/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.content.Content"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.content.Content"] = true;
dojo.provide("scorll.content.Content");

dojo.require("scorll.net.ClientComponent");

dojo.declare("scorll.content.Content", [
    scorll.net.ClientComponent
    ], {
    id: null,
    title: null,
    client: null,
    loaded: false,
    constructor: function( /* Object */ args) {
        var content = this;
        for (var k in args) {
            content[k] = args[k];
        }
    },
    getComponentType: function() {
        return "content";
    },
    getComponentId: function() {
        return this.id;
    },
    onLoad: function() {},
    load: function(callback) {
        var content = this;
        content.client.call(this, "load", function(err, data) {
            if (err) {
                console.error(err);
                callback && callback(err);
                return;
            }
            content._setTitle(data.title);
            if (data.assets) {
                for (var i in data.assets) {
                    var asset = data.assets[i];
                    if (asset) {
                        content._add(asset);
                    }
                }
            }
            content.loaded = true;
            content.onLoad();
            callback && callback();
        });
    },
    add: function(asset) {
        this.client.call(this, "addAsset", asset, null);
    },
    _add: function(asset, position) {
        this.onAdd(asset, position);
    },
    onAdd: function(asset, position) {
    },
    setTitle: function(value) {
        this.client.call(this, "setTitle", value);
    },
    _setTitle: function(value) {
        this.title = value;
        this.onTitleChange(value);
    },
    onTitleChange: function(value) {
    },
    update: function(asset) {
        this.client.call(this, "updateAsset", asset);
    },
    _update: function(asset) {
        this.onUpdate(asset);
    },
    onUpdate: function(asset) {
    },
    remove: function(asset) {
        this.client.call(this, "deleteAsset", asset.id);
    },
    _remove: function(id) {
        this.onRemove(id);
    },
    onRemove: function(id) {
    },
    move: function(id, position) {
        this.client.call(this, "moveAsset", id, position);
    },
    _move: function(id, position) {
        this.onMove(id, position);
    },
    onMove: function(id, position) {
    }
});

}
