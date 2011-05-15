/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["scorll.asset.Asset"]){
dojo._hasResource["scorll.asset.Asset"]=true;
dojo.provide("scorll.asset.Asset");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.require("scorll.asset.Shared");
dojo.require("scorll.asset.Tracking");
dojo.require("scorll.asset.Persistent");
dojo.require("scorll.net.ClientComponent");

dojo.declare("scorll.asset.Asset",
[dijit._Widget, dijit._Templated
 ,scorll.net.ClientComponent
 ,scorll.asset.Shared
 ,scorll.asset.Tracking
 ,scorll.asset.Persistent
]
,{
    user: null,
    client: null,
    content: null,
    stage: null,
	item: null,

    // scorll.net.ClientComponent functions
    getComponentType: function() {
        return "asset";
    },
    getComponentId: function() {
        return "asset-" + this.item.id;
    }
});
}
