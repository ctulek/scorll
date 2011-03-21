if(!dojo._hasResource["scorll.stage.Stage"]){
dojo._hasResource["scorll.stage.Stage"]=true;
dojo.provide("scorll.stage.Stage");

dojo.require("dojo.store.Observable");
dojo.require("dijit.form.Button");

dojo.require("scorll.stage.Menu");
dojo.require("scorll.asset.AssetManager");

dojo.declare("scorll.stage.Stage",null,{
	mode: "author",
	content: null,
	observer: null,
	menu: null,
	constructor: function(/* Object */args) {
		var stage = this;
		for(var k in args) {
			stage[k] = args[k];
		}
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
				var newwidget = assetManager.getAssetRenderer(item);
				dojo.place(newwidget.domNode, widget.domNode, "replace");
				dojo.connect(newwidget,"onMouseOver", function() {
					stage.menu.show(this.domNode);
				});
				dojo.connect(newwidget,"onMouseOut", function() {
					stage.menu.hide();
				});
			});
			dojo.connect(form,"onCancel",function() {
				dialog.hide();
			});
		});
		dojo.connect(menu,"onDelete",function(widget) {
			menu.hide(true);
			stage.content.remove(widget.item);
		});
		this.observer = new dojo.store.Observable(stage.content.store);
	},
	render: function() {
		var stage = this;
		var assetManager = new scorll.asset.AssetManager();
		if(!this.content) {
			console.warn("No content");
			return;
		}
		var result = this.observer.query();
		result.forEach(function(item) {
			var widget = assetManager.getAssetRenderer(item);
			dojo.place(widget.domNode, "stage");
			dojo.connect(widget,"onMouseOver", function() {
				stage.menu.show(this.domNode);
			});
			dojo.connect(widget,"onMouseOut", function() {
					stage.menu.hide();
			});
		});
		result.observe(function(item, removedFrom, insertedInto) {
			if(removedFrom > -1){ // existing object removed
				removedFrom++;
				var node = dojo.query("> :nth-child(" + removedFrom + ")", dojo.byId('stage'));
				if(node.length > 0) {
					dojo.destroy(node[0]);
				}
			}
			if(insertedInto > -1){ // new or updated object inserted
				var widget = assetManager.getAssetRenderer(item);
				dojo.place(widget.domNode, "stage", insertedInto + 1);
				dojo.connect(widget,"onMouseOver", function() {
					stage.menu.show(this.domNode);
				});
				dojo.connect(widget,"onMouseOut", function() {
						stage.menu.hide();
				});
			}
		});
	}
});
}
