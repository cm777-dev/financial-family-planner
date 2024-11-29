const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Investment = require('../models/Investment');
const axios = require('axios');

// @route   GET api/investments
// @desc    Get all investments for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const investments = await Investment.find({
      userId: req.user.id
    }).sort({ purchaseDate: -1 });

    // Update current prices for all investments
    for (let investment of investments) {
      if (investment.type === 'stocks' || investment.type === 'etfs') {
        try {
          // Note: Replace with your preferred stock API
          const response = await axios.get(`https://api.example.com/stocks/${investment.symbol}`);
          investment.currentPrice = response.data.price;
          investment.lastUpdated = Date.now();
          await investment.save();
        } catch (error) {
          console.error(`Failed to update price for ${investment.symbol}:`, error);
        }
      }
    }

    res.json(investments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/investments
// @desc    Add new investment
// @access  Private
router.post('/', [
  auth,
  [
    check('type', 'Investment type is required').not().isEmpty(),
    check('symbol', 'Symbol is required').not().isEmpty(),
    check('name', 'Name is required').not().isEmpty(),
    check('quantity', 'Quantity must be a positive number').isFloat({ min: 0 }),
    check('purchasePrice', 'Purchase price must be a positive number').isFloat({ min: 0 })
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newInvestment = new Investment({
      userId: req.user.id,
      familyId: req.user.familyId,
      ...req.body,
      purchaseDate: new Date(),
      history: [{
        date: new Date(),
        price: req.body.purchasePrice,
        action: 'buy',
        quantity: req.body.quantity,
        amount: req.body.purchasePrice * req.body.quantity
      }]
    });

    const investment = await newInvestment.save();
    res.json(investment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/investments/:id
// @desc    Update investment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    // Make sure user owns investment
    if (investment.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Add transaction to history if quantity or price changed
    if (req.body.quantity !== investment.quantity || req.body.currentPrice !== investment.currentPrice) {
      investment.history.push({
        date: new Date(),
        price: req.body.currentPrice || investment.currentPrice,
        action: req.body.quantity > investment.quantity ? 'buy' : 'sell',
        quantity: Math.abs(req.body.quantity - investment.quantity),
        amount: Math.abs(req.body.quantity - investment.quantity) * (req.body.currentPrice || investment.currentPrice)
      });
    }

    investment = await Investment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(investment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/investments/:id
// @desc    Delete investment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    // Make sure user owns investment
    if (investment.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await investment.remove();
    res.json({ message: 'Investment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/investments/portfolio
// @desc    Get portfolio summary
// @access  Private
router.get('/portfolio', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id });
    
    const summary = {
      totalValue: 0,
      totalReturn: 0,
      totalReturnPercentage: 0,
      byType: {},
      topPerformers: [],
      worstPerformers: []
    };

    let totalCost = 0;

    investments.forEach(inv => {
      const currentValue = inv.quantity * inv.currentPrice;
      const cost = inv.quantity * inv.purchasePrice;
      
      summary.totalValue += currentValue;
      totalCost += cost;

      // Group by type
      if (!summary.byType[inv.type]) {
        summary.byType[inv.type] = {
          value: 0,
          return: 0,
          count: 0
        };
      }
      summary.byType[inv.type].value += currentValue;
      summary.byType[inv.type].return += (currentValue - cost);
      summary.byType[inv.type].count++;
    });

    summary.totalReturn = summary.totalValue - totalCost;
    summary.totalReturnPercentage = (summary.totalReturn / totalCost) * 100;

    // Sort investments by return percentage for top/worst performers
    const sortedInvestments = [...investments].sort((a, b) => {
      const aReturn = ((a.currentPrice - a.purchasePrice) / a.purchasePrice) * 100;
      const bReturn = ((b.currentPrice - b.purchasePrice) / b.purchasePrice) * 100;
      return bReturn - aReturn;
    });

    summary.topPerformers = sortedInvestments.slice(0, 5);
    summary.worstPerformers = sortedInvestments.slice(-5).reverse();

    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
