/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.YouTube"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["scorll.asset.YouTube"] = true;
dojo.provide("scorll.asset.YouTube");

dojo.require("scorll.asset.Asset");

dojo.declare("scorll.asset.YouTube", [
  scorll.asset.Asset
  ], {
  templateString:"<div style=\"text-align: center\">\n\t<iframe title=\"YouTube video player\" width=\"640\" height=\"510\"\n  src=\"http://www.youtube.com/embed/${item.data.video}?rel=0&wmode=transparent&modestbranding=1\" frameborder=\"0\" allowfullscreen></iframe>\n</div>\n"
});

}
