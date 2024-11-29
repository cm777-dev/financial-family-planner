const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Bill = require('../models/Bill');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  // Configure your email service here
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// @route   GET api/bills
// @desc    Get all bills for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const bills = await Bill.find({
      userId: req.user.id
    }).sort({ dueDate: 1 });
    res.json(bills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/bills
// @desc    Create a new bill
// @access  Private
router.post('/', [
  auth,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('amount', 'Amount must be a positive number').isFloat({ min: 0 }),
    check('dueDate', 'Due date is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newBill = new Bill({
      userId: req.user.id,
      familyId: req.user.familyId,
      ...req.body
    });

    const bill = await newBill.save();
    res.json(bill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/bills/:id
// @desc    Update a bill
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Make sure user owns bill
    if (bill.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // If status is being updated to 'paid', add to history
    if (req.body.status === 'paid' && bill.status !== 'paid') {
      bill.history.push({
        date: new Date(),
        amount: bill.amount,
        status: 'paid',
        paymentMethod: req.body.paymentMethod || 'other',
        notes: req.body.notes
      });

      // If recurring, create next bill
      if (bill.isRecurring) {
        const nextDueDate = new Date(bill.dueDate);
        switch (bill.frequency) {
          case 'weekly':
            nextDueDate.setDate(nextDueDate.getDate() + 7);
            break;
          case 'monthly':
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            break;
          case 'quarterly':
            nextDueDate.setMonth(nextDueDate.getMonth() + 3);
            break;
          case 'yearly':
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
            break;
        }

        const nextBill = new Bill({
          ...bill.toObject(),
          _id: undefined,
          dueDate: nextDueDate,
          status: 'pending',
          history: [],
          reminders: bill.reminders.map(r => ({ ...r.toObject(), sent: false }))
        });

        await nextBill.save();
      }
    }

    bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(bill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/bills/:id
// @desc    Delete a bill
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Make sure user owns bill
    if (bill.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await bill.remove();
    res.json({ message: 'Bill removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/bills/upcoming
// @desc    Get upcoming bills
// @access  Private
router.get('/upcoming', auth, async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const bills = await Bill.find({
      userId: req.user.id,
      dueDate: {
        $gte: today,
        $lte: thirtyDaysFromNow
      },
      status: 'pending'
    }).sort({ dueDate: 1 });

    res.json(bills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/bills/:id/remind
// @desc    Send reminder for a bill
// @access  Private
router.post('/:id/remind', auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Send email reminder
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Bill Reminder: ${bill.name}`,
      html: `
        <h2>Bill Payment Reminder</h2>
        <p>This is a reminder for your upcoming bill:</p>
        <ul>
          <li><strong>Bill:</strong> ${bill.name}</li>
          <li><strong>Amount:</strong> $${bill.amount}</li>
          <li><strong>Due Date:</strong> ${new Date(bill.dueDate).toLocaleDateString()}</li>
        </ul>
        <p>Please ensure timely payment to avoid any late fees.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Reminder sent successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
