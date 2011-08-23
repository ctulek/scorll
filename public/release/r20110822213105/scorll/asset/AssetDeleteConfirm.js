/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.AssetDeleteConfirm"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.AssetDeleteConfirm"] = true;
dojo.provide("scorll.asset.AssetDeleteConfirm");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("scorll.asset.AssetDeleteConfirm", [
  dijit._Widget, dijit._Templated
  ], {
  widgetsInTemplate: true,
  templateString:"<div style=\"margin-left: 60px; margin-top: 80px;\">\n  Do you really want to delete this asset?\n  <div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"yesButton\"\n    dojoAttachEvent=\"onClick:yes\">\n    Yes\n  </div>\n  <div dojoType=\"dijit.form.Button\" dojoAttachPoint=\"noButton\"\n    dojoAttachEvent=\"onClick:no\">\n    No\n  </div>\n",
  postCreate: function () {},
  yes: function () {
    this.onConfirm();
  },
  no: function () {
    this.onCancel();
  }
});

}
