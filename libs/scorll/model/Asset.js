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
  ownerId: {
    type: ObjectId,
    indexed: true
  },
  type: {
    type: String,
    indexed: true
  },
  data: {},
  interaction: {}
});

module.exports = mongoose.model('asset', schema);
