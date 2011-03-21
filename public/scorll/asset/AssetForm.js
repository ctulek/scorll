if(!dojo._hasResource["scorll.asset.AssetForm"]){
dojo._hasResource["scorll.asset.AssetForm"]=true;
dojo.provide("scorll.asset.AssetForm");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("scorll.asset.AssetForm",[dijit._Widget, dijit._Templated],{
	widgetsInTemplate: true,
	item: {},
	onSubmit: function(item) {
	},
	onCancel: function() {
	},
	submit: function() {
		throw new Error("Implement add function");
	},
	cancel: function() {
		throw new Error("Implement cancel function");
	}
	});
}
