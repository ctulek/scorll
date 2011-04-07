if(!dojo._hasResource["scorll.asset.Asset"]){
dojo._hasResource["scorll.asset.Asset"]=true;
dojo.provide("scorll.asset.Asset");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.require("scorll.asset.Shared");
dojo.require("scorll.asset.Tracking");
dojo.require("scorll.asset.Persistent");

dojo.declare("scorll.asset.Asset",[dijit._Widget, dijit._Templated],{
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
    receive: function(err, message) {
        if(err) {
            console.error(err);
            return;
        }
        this.onMessage(message);
    },
    send: function(message, callback) {
        message.componentType = "asset";
        message.componentId = "asset-" + this.item.id;
        message.userId = this.user.id;
        message.contentId = this.content.id;
        this.client.send(message, callback);
    }
});
}
