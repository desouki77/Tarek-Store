// routes/branch.js
const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');

// POST: Create a new branch
router.post('/', async (req, res) => {
    const { name, location } = req.body;

    try {
        const newBranch = new Branch({ name, location });
        await newBranch.save();
        res.status(201).json(newBranch);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET: Fetch all branches
router.get('/', async (req, res) => {
    try {
        const branches = await Branch.find();
        res.json(branches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Fetch a branch by ID
router.get('/:id', async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id);
        if (!branch) return res.status(404).json({ message: 'Branch not found' });
        res.json({ name: branch.name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Delete a branch by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedBranch = await Branch.findByIdAndDelete(req.params.id);
        if (!deletedBranch) return res.status(404).json({ message: 'Branch not found' });
        res.json({ message: 'Branch deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
