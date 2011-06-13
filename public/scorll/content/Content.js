dojo.provide("scorll.content.Content");

dojo.require("dojo.store.Memory");

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
        content.store = new dojo.store.Memory();
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
            content.title = data.title;
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
    query: function() {
        return this.store.query();
    },
    add: function(asset) {
        this.client.call(this, "addAsset", asset, null);
    },
    _add: function(asset, position) {
        this.store.put(asset);
    },
    setTitle: function(value) {
        this.client.call(this, "setTitle", value);
        this.title = value;
    },
    update: function(asset) {
        this.client.call(this, "updateAsset", asset);
    },
    _update: function(asset) {
        this.store.put(asset);
    },
    remove: function(asset) {
        this.client.call(this, "deleteAsset", asset.id);
    },
    _remove: function(id) {
        this.store.remove(id);
    }
});
