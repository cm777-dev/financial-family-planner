const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
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
  bankName: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['checking', 'savings', 'credit', 'investment', 'loan'],
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSync: {
    type: Date,
    default: Date.now
  },
  plaidAccessToken: {
    type: String
  },
  plaidItemId: {
    type: String
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  bills: [{
    name: String,
    amount: Number,
    dueDate: Date,
    isRecurring: Boolean,
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly']
    },
    isAutoPay: Boolean,
    category: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending'
    }
  }]
});

// Add indexes for common queries
bankAccountSchema.index({ userId: 1, bankName: 1 });
bankAccountSchema.index({ familyId: 1 });

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

module.exports = BankAccount;
