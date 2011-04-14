if(!dojo._hasResource["scorll.stage.Stage"]){
dojo._hasResource["scorll.stage.Stage"]=true;
dojo.provide("scorll.stage.Stage");

dojo.require("dojo.store.Observable");
dojo.require("dijit.form.Button");

dojo.require("scorll.net.Client");
dojo.require("scorll.stage.Menu");
dojo.require("scorll.asset.AssetManager");

dojo.declare("scorll.stage.Stage",null,{
	mode: "author",
    user: null,
    client: null,
	content: null,
	observer: null,
	menu: null,
	constructor: function(/* Object */args) {
		var stage = this;
		for(var k in args) {
			stage[k] = args[k];
		}
        // USER
        var user = stage.user = {};
        user.id = "USERID";
        // CLIENT
        var client = stage.client = new scorll.net.Client();
        client.connect();
        dojo.connect(client, "onConnect", function() {
            stage.content.load(1);
        });
        // CONTENT
        var content = stage.content = new scorll.content.Content();
        client.register("content", content);
        content.client = stage.client;
        stage.observe();
        // MENU
		var menu = stage.menu = new scorll.stage.Menu();
		stage.menu = menu;
		menu.placeAt(dojo.body());
		menu.hide();
		dojo.connect(menu,"onEdit",function(widget) {
			menu.hide(true);
			var assetManager = new scorll.asset.AssetManager();
			var form = assetManager.getAssetForm(widget.item);
			if(!form) {
				return;
			}
			var dialog = new dijit.Dialog();
			form.placeAt(dialog.containerNode);
			dialog.show();
			dojo.connect(form,"onSubmit",function(item) {
				dialog.hide();
				stage.content.update(item);
			});
			dojo.connect(form,"onCancel",function() {
				dialog.hide();
			});
		});
		dojo.connect(menu,"onDelete",function(widget) {
			menu.hide(true);
			stage.content.remove(widget.item);
		});
	},
	observe: function() {
		var stage = this;
        stage.observer = new dojo.store.Observable(stage.content.store);
		var assetManager = new scorll.asset.AssetManager();
		var result = this.observer.query();
		result.forEach(function(item) {
			var widget = assetManager.getAssetRenderer(stage, item);
			dojo.place(widget.domNode, "stage");
            stage.register(widget);
		});
		result.observe(function(item, removedFrom, insertedInto) {
			if(removedFrom > -1){ // existing object removed
				var node = dijit.byId("asset-" + item.id);
				if(node) {
                    node.destroyRecursive();
				}
			}
			if(insertedInto > -1){ // new or updated object inserted
				var widget = assetManager.getAssetRenderer(stage, item);
				dojo.place(widget.domNode, "stage", insertedInto);
                stage.register(widget);
			}
		}, true);
	},
    register: function(widget) {
        var stage = this;
        stage.client.register("asset-" + widget.item.id, widget);
        dojo.connect(widget,"onMouseOver", function() {
            stage.menu.show(this.domNode);
        });
        dojo.connect(widget,"onMouseOut", function() {
            stage.menu.hide();
        });
    }
});
}
