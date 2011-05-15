if(!dojo._hasResource["scorll.content.Content"]){
dojo._hasResource["scorll.content.Content"]=true;
dojo.provide("scorll.content.Content");

dojo.require("dojo.store.Memory");

dojo.require("scorll.net.ClientComponent");

dojo.declare("scorll.content.Content",[scorll.net.ClientComponent],{
    id: null,
    title: null,
    client: null,
    loaded: false,
	constructor: function(/* Object */ args) {
		var content = this;
		for(var k in args) {
			content[k] = args[k];
		}
		content.store = new dojo.store.Memory();
	},
    getComponentType: function() {
        return "content";
    },
    getComponentId: function() {
        return "content";
    },
    onLoad: function() {
    },
    load: function(id, callback) {
        var content = this;
        content.client.call(this, "get", id, function(err, data) {
           if(err) {
            callback && callback(err);
            return;
           }
           content.id = data.id;
           content.title = data.title; 
           if(data.items) {
            for(var i in data.items) {
                var item = data.items[i];
                if(item) {
                    content._add(item);
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
	add: function(item) {
        this.client.call(this, "addAsset", this.id, item);
	},
    _add: function(item) {
		this.store.put(item);
    },
	update: function(item) {
        this.client.call(this, "updateAsset", this.id, item);
	},
    _update: function(item) {
		this.store.put(item);
    },
	remove: function(item) {
        this.client.call(this, "deleteAsset", this.id, item);
	},
    _remove: function(item) {
		this.store.remove(item.id);
    }
});
}
