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
  updated: {
    type: Date
  },
  ownerId: {
    type: ObjectId,
    indexed: true
  },
  username: String,
  assetId: {
    type: ObjectId,
    indexed: true
  },
  responses: []
});

module.exports = mongoose.model('tracking', schema);
