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
  userId: ObjectId,
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
