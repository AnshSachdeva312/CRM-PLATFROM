const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rules: [
    {
      field: { type: String, required: true },
      operator: { type: String, required: true },
      value: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Segment', segmentSchema);