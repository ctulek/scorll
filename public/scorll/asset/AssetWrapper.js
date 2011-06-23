dojo.provide("scorll.asset.AssetWrapper");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("scorll.asset.AssetWrapper", [
    dijit._Widget, dijit._Templated
    ], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl("scorll.asset", "AssetWrapper.html"),
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
