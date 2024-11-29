const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @route   GET api/budget/:year/:month
// @desc    Get budget for specific month
// @access  Private
router.get('/:year/:month', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      familyId: req.user.familyId,
      year: parseInt(req.params.year),
      month: parseInt(req.params.month)
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found for this month' });
    }

    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/budget
// @desc    Create a new budget
// @access  Private
router.post('/', [
  auth,
  [
    check('totalBudget', 'Total budget is required').not().isEmpty(),
    check('month', 'Month is required').isInt({ min: 1, max: 12 }),
    check('year', 'Year is required').isInt({ min: 2000 }),
    check('categories', 'Categories are required').isArray()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { totalBudget, month, year, categories } = req.body;

    // Check if budget already exists for this month
    let budget = await Budget.findOne({
      familyId: req.user.familyId,
      year,
      month
    });

    if (budget) {
      return res.status(400).json({ message: 'Budget already exists for this month' });
    }

    budget = new Budget({
      familyId: req.user.familyId,
      totalBudget,
      month,
      year,
      categories
    });

    await budget.save();
    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/budget/:id
// @desc    Update a budget
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { totalBudget, categories } = req.body;

    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Make sure user owns budget
    if (budget.familyId.toString() !== req.user.familyId.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    budget.totalBudget = totalBudget || budget.totalBudget;
    budget.categories = categories || budget.categories;

    await budget.save();
    res.json(budget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/budget/summary/:year/:month
// @desc    Get budget summary with actual spending
// @access  Private
router.get('/summary/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Get budget
    const budget = await Budget.findOne({
      familyId: req.user.familyId,
      year: parseInt(year),
      month: parseInt(month)
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found for this month' });
    }

    // Get transactions for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions = await Transaction.find({
      familyId: req.user.familyId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Calculate spending by category
    const spendingByCategory = {};
    transactions.forEach(transaction => {
      if (!spendingByCategory[transaction.category]) {
        spendingByCategory[transaction.category] = 0;
      }
      spendingByCategory[transaction.category] += transaction.amount;
    });

    // Update budget categories with actual spending
    const updatedCategories = budget.categories.map(category => ({
      ...category.toObject(),
      spent: spendingByCategory[category.name] || 0
    }));

    res.json({
      budget: {
        ...budget.toObject(),
        categories: updatedCategories
      },
      totalSpent: Object.values(spendingByCategory).reduce((a, b) => a + b, 0)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
