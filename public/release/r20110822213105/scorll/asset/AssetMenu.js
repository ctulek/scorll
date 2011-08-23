/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.AssetMenu"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.AssetMenu"] = true;
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
  templateString:"<div style=\"\">\n  <div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"addBeforeButton\"\n    dojoAttachEvent=\"onClick:add\">\n    Add\n  </div>\n  <div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"editButton\"\n    dojoAttachEvent=\"onClick:edit\">\n    Edit\n  </div>\n  <div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"deleteButton\"\n    dojoAttachEvent=\"onClick:_delete\">\n    Delete\n  </div>\n  <div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"cutButton\"\n    dojoAttachEvent=\"onClick:cut\">\n    Cut\n  </div>\n  <div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"copyButton\"\n    dojoAttachEvent=\"onClick:copy\">\n    Copy\n  </div>\n  <div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"pasteButton\"\n    dojoAttachEvent=\"onClick:paste\" style=\"display: none;\">\n    Paste\n  </div>\n  <div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"statsButton\"\n    dojoAttachEvent=\"onClick:stats\">\n    Stats\n  </div>\n",
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
  },
  disable: function (disabled) {
    this.addBeforeButton.setAttribute('disabled', disabled);
    this.editButton.setAttribute('disabled', disabled);
    this.deleteButton.setAttribute('disabled', disabled);
    this.cutButton.setAttribute('disabled', disabled);
    this.copyButton.setAttribute('disabled', disabled);
    this.pasteButton.setAttribute('disabled', disabled);
    this.statsButton.setAttribute('disabled', disabled);
  }
});

}
