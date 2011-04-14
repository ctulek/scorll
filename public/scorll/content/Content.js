if(!dojo._hasResource["scorll.content.Content"]){
dojo._hasResource["scorll.content.Content"]=true;
dojo.provide("scorll.content.Content");

dojo.require("dojo.store.Memory");

dojo.declare("scorll.content.Content",null,{
    id: null,
    title: null,
    client: null,
	constructor: function(/* Object */ args) {
		var content = this;
		for(var k in args) {
			content[k] = args[k];
		}
		content.store = new dojo.store.Memory();
	},
    receive: function(err, message) {
        if(err) {
            console.error(err);
            return;
        }
        if(message.action == "add") {
            this._add(message.data.item);
        } else if(message.action == "update") {
            this._update(message.data.item);
        } else if(message.action == "remove") {
            this._remove(message.data.item);
        }
    },
    onLoad: function() {
    },
    load: function(id) {
        var content = this;
        var message = {};
        message.componentType = "content";
        message.action = "load";
        message.data = {id: id};
        content.client.send(message, function(err, message) {
           if(err) {
            console.error(err);
            return;
           }
           var data = message.data;
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
           content.onLoad();
        });
    },
	query: function() {
		return this.store.query();
	},
	add: function(item) {
        var message = {};
        message.componentId = "content";
        message.componentType = "content";
        message.action = "add";
        message.data = {item: item};
        this.client.send(message);
	},
    _add: function(item) {
		if(item.id == undefined) {
			item.id = Date.now();
		}
		this.store.put(item);
    },
	update: function(item) {
        var message = {};
        message.componentId = "content";
        message.componentType = "content";
        message.action = "update";
        message.data = {item: item};
        this.client.send(message);
	},
    _update: function(item) {
		this.store.put(item);
    },
	remove: function(item) {
        var message = {};
        message.componentId = "content";
        message.componentType = "content";
        message.action = "remove";
        message.data = {item: item};
        this.client.send(message);
	},
    _remove: function(item) {
		this.store.remove(item.id);
    }
});
}
