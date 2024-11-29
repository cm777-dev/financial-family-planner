const mongoose = require('mongoose');

const budgetCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    required: true
  },
  spent: {
    type: Number,
    default: 0
  }
});

const budgetSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  totalBudget: {
    type: Number,
    required: true
  },
  categories: [budgetCategorySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
budgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add compound index for efficient querying
budgetSchema.index({ familyId: 1, year: 1, month: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
