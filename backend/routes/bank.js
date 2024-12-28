const express = require('express');
const router = express.Router();
const Bank = require('../models/Bank');

// POST: Create a new bank
router.post('/', async (req, res) => {
    const { bankAmount, branch } = req.body;

    try {
        const newBank = new Bank({ bankAmount, branch });
        await newBank.save();
        res.status(201).json(newBank);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET: Fetch all banks
router.get('/', async (req, res) => {
    try {
        const banks = await Bank.find();
        res.json(banks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Fetch a bank by ID
router.get('/:id', async (req, res) => {
    try {
        const bank = await Bank.findById(req.params.id);
        if (!bank) return res.status(404).json({ message: 'Bank not found' });
        res.json({ bankAmount: bank.bankAmount, branch: bank.branch });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT: Update a bank by ID
router.put('/:id', async (req, res) => {
    const { bankAmount, branch } = req.body;

    try {
        const newBank = { bankAmount, branch };
        const bank = await Bank.findByIdAndUpdate(req.params.id, newBank, { new: true });
        if (!bank) return res.status(404).json({ message: 'Bank not found' });
        res.json(bank);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;