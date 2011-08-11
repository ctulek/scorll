var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var schema = new Schema({
  alias: {
    type: String,
    indexed: true,
    unique: true
  },
  contentId: {
    type: ObjectId,
    indexed: true
  }
});

module.exports = mongoose.model('contentAlias', schema);
