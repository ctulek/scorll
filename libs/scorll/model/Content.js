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
  title: {
    type: String,
  default:
    "New Content Title (Click to Change)"
  },
  description: String,
  assets: [ObjectId]
});

module.exports = mongoose.model('content', schema);
