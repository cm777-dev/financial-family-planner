const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['stocks', 'bonds', 'mutualFunds', 'etfs', 'crypto', 'realEstate', 'other'],
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  notes: String,
  tags: [String],
  history: [{
    date: Date,
    price: Number,
    action: {
      type: String,
      enum: ['buy', 'sell', 'dividend', 'split']
    },
    quantity: Number,
    amount: Number
  }]
});

// Calculate current value
investmentSchema.virtual('currentValue').get(function() {
  return this.quantity * this.currentPrice;
});

// Calculate total return
investmentSchema.virtual('totalReturn').get(function() {
  const totalCost = this.quantity * this.purchasePrice;
  const currentValue = this.currentValue;
  return currentValue - totalCost;
});

// Calculate return percentage
investmentSchema.virtual('returnPercentage').get(function() {
  const totalCost = this.quantity * this.purchasePrice;
  const currentValue = this.currentValue;
  return ((currentValue - totalCost) / totalCost) * 100;
});

const Investment = mongoose.model('Investment', investmentSchema);

module.exports = Investment;
