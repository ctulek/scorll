dojo.provide("scorll.asset.TrackingStats");

dojo.require("dojox.grid.DataGrid");
dojo.require("dijit.form.Button");

dojo.declare("scorll.asset.TrackingStats", [
    dijit._Widget, dijit._Templated
    ], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl("scorll.asset", "TrackingStats.html"),
    postCreate: function() {
        this.resultsGrid.formatterScope = this;
        this.resultsGrid.startup();
    },
    onClose: function() {
    },
    close: function() {
        this.onClose();
    }
});
