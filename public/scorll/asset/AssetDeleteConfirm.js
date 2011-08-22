dojo.provide("scorll.asset.AssetDeleteConfirm");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("scorll.asset.AssetDeleteConfirm", [
  dijit._Widget, dijit._Templated
  ], {
  widgetsInTemplate: true,
  templatePath: dojo.moduleUrl("scorll.asset", "AssetDeleteConfirm.html"),
  postCreate: function() {
  },
  yes: function() {
    this.onConfirm();
  },
  no: function() {
    this.onCancel();
  }
});
