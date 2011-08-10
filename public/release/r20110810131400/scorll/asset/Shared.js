/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.Shared"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.Shared"] = true;
dojo.provide("scorll.asset.Shared");

dojo.declare("scorll.asset.Shared", null, {
  call: function (methodName) {
    var params = Array.prototype.slice.call(arguments, 1);
    this.client.call(this, 'call', methodName, params);
  },
  receive: function (methodName, args) {
    if (typeof (this[methodName]) == "function") {
      this[methodName].apply(this, args);
    }
  }
});

}
