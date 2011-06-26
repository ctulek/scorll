/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.AssetWrapper"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.AssetWrapper"] = true;
dojo.provide("scorll.asset.AssetWrapper");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("scorll.asset.AssetWrapper", [
    dijit._Widget, dijit._Templated
    ], {
    widgetsInTemplate: true,
    templateString:"<div class=\"dojoDndItem asset-wrapper\">\n",
    menu: null,
    stage: null,
    assetManager: null,
    asset: null,
    widget: null,
    postCreate: function () {
        this.menu && dojo.place(this.menu.domNode, this.domNode);
        if(this.asset) {
            this.widget = this.assetManager.getAssetRenderer(this.stage, this.asset);
        }
        this.widget && dojo.place(this.widget.domNode, this.domNode);
    },
    updateAsset: function (asset) {
        this.asset = asset;
        this.widget && this.widget.destroyRecursive();
        this.widget = this.assetManager.getAssetRenderer(this.stage, this.asset);
        this.widget && dojo.place(this.widget.domNode, this.domNode);
        this.stage.registerAsset(this.widget);
    }
});

}
