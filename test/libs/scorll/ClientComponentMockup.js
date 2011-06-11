var ClientComponentMockup = function() {
    this.id = Math.round(Math.random() * 10000000);
}

ClientComponentMockup.prototype.getId = function() {
    return this.id;
}

ClientComponentMockup.prototype.func1 = function(client, arg1, arg2, callback) {
    console.log("func1 of component #" + this.id + " called");
    callback(null, client, arg1, arg2);
}

ClientComponentMockup.prototype.func2 = function(client, arg1, callback) {
    console.log("func2 of component #" + this.id + " called");
    callback(null, client, arg1);
}

module.exports = ClientComponentMockup;
