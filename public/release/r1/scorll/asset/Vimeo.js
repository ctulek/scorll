/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.Vimeo"]){
dojo._hasResource["scorll.asset.Vimeo"]=true;
dojo.provide("scorll.asset.Vimeo");
dojo.require("scorll.asset.Asset");
dojo.declare("scorll.asset.Vimeo",[scorll.asset.Asset],{
	templateString:"<div style=\"text-align: center\">\n    <iframe src=\"http://player.vimeo.com/video/${item.data.video}?title=0&amp;byline=0&amp;portrait=0\" width=\"640\" height=\"510\" frameborder=\"0\"></iframe>\n</div>\n"
	}
);
}
