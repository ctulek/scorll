/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.Text"]){
dojo._hasResource["scorll.asset.Text"]=true;
dojo.provide("scorll.asset.Text");

dojo.require("scorll.asset.Asset");

dojo.declare("scorll.asset.Text",[scorll.asset.Asset], {
    templateString:"<div>\n\t<h2 dojoAttachPoint=\"titleText\"></h2>\n\t<p dojoAttachPoint=\"bodyText\"></p>\n",
    postCreate: function() {
        var data = this.item.data;
        if(data.text) {
            this.bodyText.innerHTML = data.text;
        }
        if(data.title) {
            this.titleText.innerHTML = data.title;
        } else {
            dojo.destroy(this.titleText);
        }
        var userid = this.user ? this.user.id : "unknown";
        this.call("test","Test Message From User " + userid);
    },
    test: function(message) {
        console.log("Message to Test: " + message);
    }
});
}
