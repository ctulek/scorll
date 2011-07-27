dojo.provide("scorll.asset.NewAssetForm");

dojo.require("dijit.TitlePane");
dojo.require("dijit.form.Button");
dojo.require("scorll.asset.AssetManager");

dojo.declare("scorll.asset.NewAssetForm", [dijit._Widget, dijit._Templated], {
  widgetsInTemplate: true,
  templatePath: dojo.moduleUrl("scorll.asset", "NewAssetForm.html"),
  position: null,
  postCreate: function() {
    var newAssetForm = this;
    var stage = this.stage;
    var container = this.container;
    dojo.destroy(container.arrowNode);
    container.startup();
    var assetList = this.assetList;
    var assetManager = new scorll.asset.AssetManager();
    for (var type in assetManager.assets) {
      var button = new dijit.form.Button();
      var label = assetManager.assets[type].label;
      button.attr('label', label);
      button.widgetType = type;
      dojo.connect(button, "onClick", function() {
        container.attr('title', this.attr('label'));
        var form = assetManager.getAssetForm({
          type: this.widgetType
        });
        dojo.place(form.domNode, container.containerNode, "only");
        dojo.connect(form, "onSubmit", function(item) {
          stage.content.add(item, newAssetForm.position);
          newAssetForm.onSubmit();
        });
        dojo.connect(form, "onCancel", function() {
          newAssetForm.cancel();
        });
      });
      button.placeAt(assetList);
      container.containerNode.scrollIntoView()
    }
  },
  onSubmit: function() {},
  onCancel: function() {},
  cancel: function() {
    this.onCancel();
  }
});
