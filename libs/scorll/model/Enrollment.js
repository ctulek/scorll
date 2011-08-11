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
    indexed: true
  },
  contentId: {
    type: ObjectId,
    indexed: true
  }
});

module.exports = mongoose.model('enrollment', schema);
