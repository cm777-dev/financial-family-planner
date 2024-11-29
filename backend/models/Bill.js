const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    required: function() { return this.isRecurring; }
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'credit_card', 'debit_card', 'cash', 'other']
  },
  autoPay: {
    enabled: {
      type: Boolean,
      default: false
    },
    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount'
    }
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms'],
      required: true
    },
    daysBeforeDue: {
      type: Number,
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  notes: String,
  attachments: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  history: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: Number,
    status: String,
    paymentMethod: String,
    notes: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps before saving
billSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for common queries
billSchema.index({ userId: 1, dueDate: 1 });
billSchema.index({ familyId: 1, dueDate: 1 });
billSchema.index({ status: 1, dueDate: 1 });

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
