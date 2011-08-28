/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.util"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.util"] = true;
dojo.provide("scorll.util");

dojo.require("dojo.fx");
dojo.require("dojox.fx.scroll");
dojo.require("dojo.fx.easing");
dojo.require("dojo.window");

scorll.util.slideIntoView = function (domNode) {
  setTimeout(function () {
    var windowH = dojo.window.getBox().h;
    var wrapperY = dojo.position(domNode).y;
    var wrapperH = dojo.position(domNode).h + 10;
    var notInView = wrapperY < 0 || (wrapperY + wrapperH) > windowH;
    if (wrapperH < windowH && notInView) {
      var offsetY = 0;
      if (wrapperY > 0) {
        offsetY = windowH - wrapperH;
      }
      else {
        offsetY += 30;
      }
      dojox.fx.smoothScroll({
        win: window,
        node: domNode,
        easing: dojo.fx.easing.quintIn,
        duration: 300,
        offset: {
          y: -offsetY
        }
      }).play();
    }
  });
}

if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function () {
    return dojo.trim(this);
  }
}


if (typeof Array.prototype.indexOf !== 'function') {
  Array.prototype.indexOf = function (searchElement, fromIndex) {
    return dojo.indexOf(this, searchElement, fromIndex);
  }
}


if (typeof Array.prototype.forEach !== 'function') {
  Array.prototype.forEach = function (callback) {
    return dojo.forEach(this, callback);
  }
}

}
