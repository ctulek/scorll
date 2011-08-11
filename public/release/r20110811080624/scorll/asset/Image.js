/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.Image"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.Image"] = true;
dojo.provide("scorll.asset.Image");

dojo.require("scorll.asset.Asset");

dojo.declare("scorll.asset.Image", [
  scorll.asset.Asset
  ], {
  templateString:"<div>\n\t<img src=\"${item.data.url}\" />\n</div>\n"
});

}
