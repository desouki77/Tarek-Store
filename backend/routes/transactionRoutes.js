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

router.get('/input', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        // Set the date range based on the provided startDate and endDate, or use today's date range by default
        const startOfDay = startDate ? new Date(startDate) : new Date();
        const endOfDay = endDate ? new Date(endDate) : new Date();

        // Default to the start and end of the current day if no date filters are provided
        if (!startDate) startOfDay.setHours(0, 0, 0, 0);
        if (!endDate) endOfDay.setHours(23, 59, 59, 999);

        const query = {
            type: 'input',
            date: { $gte: startOfDay, $lte: endOfDay },
        };

        // Return all transactions for the given date range
        const transactions = await Transaction.find(query).sort({ date: -1 });
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});

module.exports = router;
