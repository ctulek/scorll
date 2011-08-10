var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  created: {
    type: Date,
  default:
    Date.now,
    index: true
  },
  profile: {
    username: String,
    email: String
  }
});

module.exports = mongoose.model('user', schema);
