dojo.provide("scorll.asset.Asset");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.require("scorll.asset.Shared");
dojo.require("scorll.asset.Tracking");
dojo.require("scorll.asset.Persistent");
dojo.require("scorll.net.ClientComponent");

dojo.declare("scorll.asset.Asset", [
    dijit._Widget, dijit._Templated,
    scorll.net.ClientComponent
    ], {
    user: null,
    client: null,
    content: null,
    stage: null,
    item: null,

    // Events
    onLoginRequired: function() {
    },
    // scorll.net.ClientComponent functions
    getComponentType: function () {
        return "asset";
    },
    getComponentId: function () {
        return this.item.id;
    }
});
