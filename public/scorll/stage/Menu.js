dojo.provide("scorll.stage.Menu");

dojo.require("dojo.fx.Toggler");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("scorll.stage.Menu", [
    dijit._Widget,
    dijit._Templated
    ], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl("scorll.stage", "Menu.html"),
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
    onEdit: function (widget) {},
    onDelete: function (widget) {},
    edit: function () {
        this.onEdit(this.widget);
    },
    _delete: function () {
        this.onDelete(this.widget);
    },
    stats: function () {
        this.hide(true);
        this.widget.showStats();
    },
    show: function (node) {
        clearTimeout(this._timeout);
        this.widget = dijit.byNode(node);
        if (this.widget.isInstanceOf(scorll.asset.Tracking)) {
            this.statsButton.domNode.style.display = "inline";
        } else {
            this.statsButton.domNode.style.display = "none";
        }
        var position = dojo.position(node, {
            includeScroll: true
        });
        this.domNode.style.left = position.x + position.w;
        this.domNode.style.top = position.y;
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
