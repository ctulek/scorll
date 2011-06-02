dojo.provide("scorll.asset.Shared");

dojo.declare("scorll.asset.Shared", null, {
    call: function(methodName) {
        var args = Array.prototype.slice.call(arguments);
        var params = [this, "call", this.getComponentId()].concat(args);
        this.client.call.apply(this.client, params);
    },
    receive: function(methodName) {
        if (typeof(this[methodName]) == "function") {
            var args = Array.prototype.slice.call(arguments);
            var params = args.slice(1);
            this[methodName].apply(this, params);
        }
    }
});
