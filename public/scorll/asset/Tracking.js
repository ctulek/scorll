if(!dojo._hasResource["scorll.asset.Tracking"]){
dojo._hasResource["scorll.asset.Tracking"]=true;
dojo.provide("scorll.asset.Tracking");

dojo.declare("scorll.asset.Tracking",null,{
    asset: null,
    constructor: function(asset) {
        var tracking = this;
        tracking.asset = asset;
        dojo.connect(asset,"onMessage", function(message) {
            if(message.module == "tracking") {
            }
        });
    },
    track: function(trackData, callback) {
        this.asset.send({module:"tracking",
            action:"track", data: trackData});
    }
});
}
