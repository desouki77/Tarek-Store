const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Create a transaction
router.post('/', async (req, res) => {
    const transaction = new Transaction(req.body);
    
    try {
        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all transactions (with filtering and pagination)
router.get('/', async (req, res) => {
    const { page = 1, limit = 10, type } = req.query;

    // Filter transactions by type if provided
    const filter = type ? { type } : {};

    try {
        const transactions = await Transaction.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('client') // Populate client or supplier details if referenced
            .populate('supplier')
            .exec();

        // Get total number of documents
        const count = await Transaction.countDocuments(filter);

        res.json({
            transactions,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a transaction
router.put('/:id', async (req, res) => {
    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a transaction
router.delete('/:id', async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
