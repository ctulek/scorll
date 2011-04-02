if(!dojo._hasResource["scorll.asset.Shared"]){
dojo._hasResource["scorll.asset.Shared"]=true;
dojo.provide("scorll.asset.Shared");

dojo.declare("scorll.asset.Shared",null,{
    asset: null,
    constructor: function(asset) {
        var shared = this;
        shared.asset = asset;
        dojo.connect(asset,"onMessage", function(message) {
            if(message.module == "shared") {
               if(message.action == "call") {
                shared._call(message);
               }
            }
        });
    },
    call: function(funcName) {
        var args = [];
        for(var i in arguments) {
            args.push(arguments[i]);
        }
        args = args.slice(1);
        this.asset.send({module: "shared",
            action:"call", data: {funcName: funcName, args: args}});
    },
    _call: function(message) {
        var funcName = message.data.funcName;
        var args = message.data.args;
        if(this.asset[funcName] && typeof(this.asset[funcName]) == "function") {
            this.asset[funcName].apply(this.asset, args);
        }
    }
});
}
