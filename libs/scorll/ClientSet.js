var components = {
  user: require('libs/scorll/User.js'),
  content: require('libs/scorll/Content.js'),
  asset: require('libs/scorll/Asset.js')
}

var Client = require('libs/scorll/Client');

var ClientSet = function (args) {
    this.clientCount = 0;
    this.clients = {};
  }

ClientSet.prototype.add = function (client, callback) {
  if (this.clients[client.getId()]) {
    var err = new Error("Already in set");
    console.error(err);
    callback && callback(err);
    return;
  }
  this.clientCount++;
  console.info('Client connected. ' + this.clientCount + " client(s) in total.");
  this.clients[client.getId()] = client;
  var clientSet = this;
  client.on('disconnect', function () {
    clientSet.delete(this);
    console.info('Client disconnected. ' + clientSet.clientCount + " client(s) in total.");
  });
  callback && callback(null);
}

ClientSet.prototype.delete = function (client, callback) {
  if (!this.clients[client.getId()]) {
    var err = new Error("Not in set");
    console.error(err);
    callback && callback(err);
    return;
  }
  this.clientCount--;
  delete this.clients[client.getId()];
  callback && callback();
}

module.exports = ClientSet;
