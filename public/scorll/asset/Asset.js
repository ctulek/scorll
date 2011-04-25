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
    [dijit._Widget, dijit._Templated,
     scorll.net.ClientComponent],{
    user: null,
    client: null,
    content: null,
	item: null,

    shared: null,
    tracking: null,
    persistent: null,
    constructor: function() {
        this.shared = new scorll.asset.Shared(this);
        this.tracking = new scorll.asset.Tracking(this);
        this.persistent = new scorll.asset.Persistent(this);
    },
    onMessage: function(message) {
    },
    send: function(message, callback) {
        this.client.send(this, message, callback);
    },
    // scorll.net.ClientComponent functions
    getComponentType: function() {
        return "asset";
    },
    getComponentId: function() {
        return "asset-" + this.item.id;
    },
    receive: function(err, message) {
        if(err) {
            console.error(err);
            return;
        }
        this.onMessage(message);
    }
});
}
