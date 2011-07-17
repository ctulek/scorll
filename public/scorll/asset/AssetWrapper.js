dojo.provide("scorll.asset.AssetWrapper");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("scorll.asset.AssetMenu");

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
        var wrapper = this;
        this.menu = new scorll.asset.AssetMenu();
        this.menu.hide(true);
        dojo.place(this.menu.domNode, this.domNode);
        if(this.asset) {
            this.createWidget(this.asset);
        }
        this.registerEvents();
    },
    createWidget: function (asset) {
        var wrapper = this;
        var menu = this.menu;
        var widget = this.widget =
            this.assetManager.getAssetRenderer(this.stage, this.asset);
        this.stage.registerAsset(widget);
        menu.widget = widget;
        dojo.connect(widget, "onMouseOver", function () {
            menu && menu.show(wrapper.domNode);
        });
        dojo.connect(widget, "onMouseOut", function () {
            menu && menu.hide();
        });
        widget && dojo.place(widget.domNode, this.domNode);
    },
    updateAsset: function (asset) {
        this.asset = asset;
        this.widget && this.widget.destroyRecursive();
        this.createWidget(this.asset);
    },
    registerEvents: function() {
        var wrapper = this;
        var menu = this.menu;
        var stage = this.stage;
        var assetManager = this.assetManager;
        dojo.connect(menu, "onEdit", function () {
            // Use the current widget
            var widget = wrapper.widget;
            menu.hide(true);
            widget.domNode.style.display = "none";
            var form = assetManager.getAssetForm(widget.item);
            if (!form) {
                return;
            }
            var container = new dijit.TitlePane({title: "Edit Asset", toggleable: false});
            dojo.destroy(container.arrowNode);
            form.placeAt(container.containerNode);
            container.placeAt(widget.domNode, "before");
            dojo.connect(form, "onSubmit", function (item) {
                container.destroyRecursive();
                stage.content.update(item);
            });
            dojo.connect(form, "onCancel", function () {
                container.destroyRecursive();
                widget.domNode.style.display = "block";
            });
        });
        dojo.connect(menu, "onDelete", function (widget) {
            var widget = wrapper.widget;
            menu.hide(true);
            stage.content.remove(widget.item);
        });
    }
});
