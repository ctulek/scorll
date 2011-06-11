dojo.provide("scorll.asset.Shared");

dojo.declare("scorll.asset.Shared", null, {
    call: function(methodName) {
        var params = Array.prototype.slice.call(arguments, 1);
        this.client.call(this, 'call', methodName, params);
    },
    receive: function(methodName, args) {
        if (typeof(this[methodName]) == "function") {
            this[methodName].apply(this, args);
        }
    }
});
