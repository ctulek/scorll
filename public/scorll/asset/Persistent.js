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
    save: function(objects, callback) {
        this.asset.send({module:"persistent",
            action:"save", data: objects}, callback);
    },
    search: function(conditions, callback) {
        this.asset.send({module:"persistent",
            action:"search", data: conditions}, callback);
    },
    del: function(objects, callback) {
        this.asset.send({module:"persistent",
            action:"delete", data: objects}, callback);
    },
});
}
