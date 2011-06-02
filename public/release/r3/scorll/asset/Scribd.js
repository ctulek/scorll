/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.Scribd"]){
dojo._hasResource["scorll.asset.Scribd"]=true;
dojo.provide("scorll.asset.Scribd");
dojo.require("scorll.asset.Asset");
dojo.declare("scorll.asset.Scribd",[scorll.asset.Asset],{
	templateString:"<div style=\"text-align: center\">\n    <iframe class=\"scribd_iframe_embed\"\n        id=\"${item.id}\"\n        src=\"http://www.scribd.com/embeds/${item.data.scribd}/content?start_page=1&view_mode=slideshow\"\n        data-auto-height=\"true\" data-aspect-ratio=\"0.772727272727273\"\n        scrolling=\"no\"\n        width=\"100%\" height=\"600\"\n        frameborder=\"0\"></iframe><script type=\"text/javascript\">(function() { var scribd = document.createElement(\"script\"); scribd.type = \"text/javascript\"; scribd.async = true; scribd.src = \"http://www.scribd.com/javascripts/embed_code/inject.js\"; var s = document.getElementsByTagName(\"script\")[0]; s.parentNode.insertBefore(scribd, s); })();</script>\n</div>\n"
	}
);
}
