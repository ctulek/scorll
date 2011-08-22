var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var schema = new Schema({
  created: {
    type: Date,
  default:
    Date.now,
    index: true
  },
  userId: {
    type: ObjectId,
    index: true
  },
  username: {
    type: String,
    index: true
  },
  email: {
    type: String,
    index: true
  },
  password: String
});

module.exports = mongoose.model('userStrategy', schema);
