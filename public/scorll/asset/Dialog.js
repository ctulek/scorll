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
