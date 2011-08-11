/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.TrackingStats"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.TrackingStats"] = true;
dojo.provide("scorll.asset.TrackingStats");

dojo.require("dojox.grid.DataGrid");
dojo.require("dijit.form.Button");

dojo.declare("scorll.asset.TrackingStats", [
  dijit._Widget, dijit._Templated
  ], {
  widgetsInTemplate: true,
  templateString:"<div>\n    <style type=\"text/css\">\n        @import \"dojox/grid/resources/Grid.css\";\n        @import \"dojox/grid/resources/claroGrid.css\";\n        .dojoxGrid table { margin: 0; } html, body { width: 100%; height: 100%;\n        margin: 0; }\n    </style>\n\t<div style=\"width: 100%; height:300px;\">\n        <table dojoType=\"dojox.grid.DataGrid\" dojoAttachPoint=\"resultsGrid\" style=\"width: 100%; height: 100%;\">\n          <thead width=\"100%\">\n            <tr>\n              <th field=\"username\" width=\"40%\">Username</th>\n              <th field=\"response\" width=\"40%\">Response</th>\n              <th field=\"result\" width=\"20%\">Result</th>\n            </tr>\n          </thead>\n        </table>\n\t</div>\n    <div style=\"text-align: right;\">\n        <div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick:close\">Close</div>\n    </div>\n",
  postCreate: function () {
    this.resultsGrid.formatterScope = this;
    this.resultsGrid.startup();
  },
  onClose: function () {},
  close: function () {
    this.onClose();
  }
});

}
