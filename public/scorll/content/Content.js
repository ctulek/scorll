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
    receive: function(message) {
    },
    onLoad: function() {
    },
    load: function(id) {
        var content = this;
        var args = {};
        args.componentType = "content";
        args.action = "load";
        args.data = {id: id};
        content.client.send(args, function(message) {
           var data = message.data;
           content.id = data.id;
           content.title = data.title; 
           if(data.items) {
            for(var i in data.items) {
                content.add(data.items[i]);
            }
           }
           content.onLoad();
        });
    },
	query: function() {
		return this.store.query();
	},
	add: function(item) {
		if(item.id == undefined) {
			item.id = Date.now();
		}
		this.store.add(item);
	},
	update: function(item) {
		this.store.put(item, item.id);
	},
	remove: function(item) {
		this.store.remove(item.id);
	}	
});
}
