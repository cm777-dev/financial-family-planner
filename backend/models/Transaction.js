const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  isShared: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }]
});

// Add indexes for common queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ familyId: 1, date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
