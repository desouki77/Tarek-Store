// backend/routes/transactions.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Create a transaction with a specific type (e.g., "input")
router.post('/', async (req, res) => {
    const transaction = new Transaction({
        ...req.body,
        type: 'input', // Ensure type is set to "input" for InputTransaction component
    });

    try {
        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all transactions of type "input" for the current day, with pagination
router.get('/input', async (req, res) => {
    const { page = 1, limit = 3 } = req.query;

    // Get transactions only for the current day and type "input"
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    try {
        const transactions = await Transaction.find({
            type: 'input',
            date: { $gte: startOfDay, $lte: endOfDay },
        })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ date: -1 });

        const count = await Transaction.countDocuments({
            type: 'input',
            date: { $gte: startOfDay, $lte: endOfDay },
        });

        res.json({
            transactions,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
