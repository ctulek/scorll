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
  cookie: {
    type: String,
    index: true
  },
  expiresAt: Date
});

module.exports = mongoose.model('cookieStrategy', schema);
