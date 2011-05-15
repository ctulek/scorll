if(!dojo._hasResource["scorll.asset.Persistent"]){
dojo._hasResource["scorll.asset.Persistent"]=true;
dojo.provide("scorll.asset.Persistent");

dojo.declare("scorll.asset.Persistent",null,{
    save: function(objects, callback) {
        this.client.call(this, 'save', objects, callback);
    },
    search: function(conditions, callback) {
        this.client.call(this, 'search', conditions, callback);
    },
    del: function(objects, callback) {
        this.client.call(this, 'delete', conditions, callback);
    },
});
}
