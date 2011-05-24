if(!dojo._hasResource["scorll.asset.TrackingStats"]){
dojo._hasResource["scorll.asset.TrackingStats"]=true;
dojo.provide("scorll.asset.TrackingStats");

dojo.require("dojox.grid.DataGrid");

dojo.declare("scorll.asset.TrackingStats"
,[dijit._Widget, dijit._Templated]
,{
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl("scorll.asset","TrackingStats.html"),
    dialog: null,
    postCreate: function() {
        this.resultsGrid.formatterScope = this;
        console.log(this.resultsGrid);
    }
});
}
