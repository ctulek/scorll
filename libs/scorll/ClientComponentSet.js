var ClientComponentSet = function() {
    this.components = {};
}

ClientComponentSet.prototype.add = function(component, callback) {
    var id = component.getId();
    if(this.components[id]) {
        callback && callback('Component is already added');
        return;
    }
    this.components[id] = component;
    callback && callback();
}

ClientComponentSet.prototype.findById = function(id, callback) {
    var component = this.components[id];
    var err = component ? null : 'Cannot find component';
    callback && callback(err, component);
}

ClientComponentSet.prototype.delete = function(component, callback) {
    delete this.components[component.getId()];
    callback && callback();
}

module.exports = ClientComponentSet;
