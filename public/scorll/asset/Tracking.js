if(!dojo._hasResource["scorll.asset.Tracking"]){
dojo._hasResource["scorll.asset.Tracking"]=true;
dojo.provide("scorll.asset.Tracking");

dojo.declare("scorll.asset.Tracking",null,{
    track: function(data, callback) {
        this.client.call(this, "track", data, callback);
    }
});
}
