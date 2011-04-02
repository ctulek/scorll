if(!dojo._hasResource["scorll.asset.Persistent"]){
dojo._hasResource["scorll.asset.Persistent"]=true;
dojo.provide("scorll.asset.Persistent");

dojo.declare("scorll.asset.Persistent",null,{
    asset: null,
    constructor: function(asset) {
        var persistent = this;
        persistent.asset = asset;
        dojo.connect(asset,"onMessage", function(message) {
            if(message.module == "persistent") {
            }
        });
    },
    track: function(trackData, callback) {
        this.asset.send({module:"persistent",
            action:"track", data: trackData});
    }
});
}
