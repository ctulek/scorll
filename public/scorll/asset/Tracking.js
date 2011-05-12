if(!dojo._hasResource["scorll.asset.Tracking"]){
dojo._hasResource["scorll.asset.Tracking"]=true;
dojo.provide("scorll.asset.Tracking");

dojo.declare("scorll.asset.Tracking",null,{
    userTrackingData: {},
    userTrackingDataHistory: {},
    track: function(params, callback) {
        var asset = this;
        params.assetId = this.item.id;
        if(!asset.user.authenticated) {
            asset.stage.userLogin(function(err) {
                if(err) {
                    callback("The user is not authenticated");
                } else {
                    asset.client.call(asset, "track", asset.getComponentId(), params, callback);
                }
            });
        } else {
            asset.client.call(asset, "track", asset.getComponentId(), params, callback);
        }
    }
    ,collect: function(userid, params) {
        this.userTrackingData[userid] = params;
        var history = this.userTrackingDataHistory[userid] || [];
        history.push(params);
        this.userTrackingDataHistory[userid] = history;
        console.log(this.userTrackingData);
        console.log(this.userTrackingDataHistory);
    }
    ,TRACKING_TYPE: {
        TRUE_FALSE: "true-false"
        ,CHOICE: "choice"
        ,FILL_IN: "fill-in"
        ,LIKERT: "likert"
        ,MATCHING: "matching"
        ,PERFORMANCE: "performance"
        ,SEQUENCING: "sequencing"
        ,NUMERIC: "numeric"
        ,OTHER: "other"
    }
});
}
