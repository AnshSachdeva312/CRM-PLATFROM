const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment', required: true },
  campaignName: { type: String, required: true },
  message: { type: String, required: true },
  audienceSize: { type: Number, required: true },
  deliveryStatuses: [
    {
      customerId: String,
      status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CommunicationLog', communicationLogSchema);