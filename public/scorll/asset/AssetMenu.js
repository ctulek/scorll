dojo.provide("scorll.asset.AssetMenu");

dojo.require("dojo.fx.Toggler");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");

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
  onAdd: function () {},
  onEdit: function () {},
  onDelete: function () {},
  onCut: function () {},
  onCopy: function () {},
  onPaste: function () {},
  onShowStats: function () {},
  add: function () {
    this.hide(true);
    this.onAdd();
  },
  edit: function () {
    this.hide(true);
    this.onEdit();
  },
  _delete: function () {
    this.onDelete();
  },
  cut: function () {
    this.onCut();
  },
  copy: function () {
    this.onCopy();
  },
  paste: function () {
    this.onPaste();
  },
  stats: function () {
    this.hide(true);
    this.onShowStats();
  },
  show: function () {
    clearTimeout(this._timeout);
    if (this.widget.isInstanceOf(scorll.asset.Tracking)) {
      this.statsButton.domNode.style.display = "";
    }
    else {
      this.statsButton.domNode.style.display = "none";
    }
    this._toggler.show();
  },
  hide: function (immediately) {
    var toggler = this._toggler;
    if (immediately) {
      toggler.hide();
    }
    else {
      this._timeout = setTimeout(function () {
        toggler.hide();
      }, 300);
    }
  }
});
