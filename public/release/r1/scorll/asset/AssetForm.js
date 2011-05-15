/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


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
