dojo.provide("scorll.asset.AssetMenu");

dojo.require("dojo.fx.Toggler");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("scorll.asset.AssetMenu", [
    dijit._Widget,
    dijit._Templated
    ], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl("scorll.asset", "AssetMenu.html"),
    widget: null,
    _toggler: null,
    _timeout: null,
    postCreate: function () {
        this._toggler = new dojo.fx.Toggler({
            node: this.domNode
        });
        this._toggler.hideDuration = 100;
        dojo.connect(this, "onMouseOver", function () {
            clearTimeout(this._timeout);
        });
        dojo.connect(this, "onMouseOut", function () {
            this.hide();
        });
    },
    onEdit: function () {},
    onDelete: function () {},
    onShowStats: function () {},
    edit: function () {
        this.hide(true);
        this.onEdit();
    },
    _delete: function () {
        this.onDelete();
    },
    stats: function () {
        this.hide(true);
        this.onShowStats();
    },
    show: function () {
        clearTimeout(this._timeout);
        if (this.widget.isInstanceOf(scorll.asset.Tracking)) {
            this.statsButton.domNode.style.display = "";
        } else {
            this.statsButton.domNode.style.display = "none";
        }
        this._toggler.show();
    },
    hide: function (immediately) {
        var toggler = this._toggler;
        if (immediately) {
            toggler.hide();
        } else {
            this._timeout = setTimeout(function () {
                toggler.hide();
            }, 300);
        }
    }
});
