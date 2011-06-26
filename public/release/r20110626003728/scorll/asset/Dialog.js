/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.Dialog"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.Dialog"] = true;
dojo.provide("scorll.asset.Dialog");

dojo.require("dijit.Dialog");

dojo.declare("scorll.asset.Dialog", [dijit.Dialog], {
    _isPositioned: false,
    _position: function () {
        if(this._isPositioned == false) {
            this.inherited(arguments);
            this._isPositioned = true;
        }
    }
});

}
