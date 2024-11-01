// routes/branch.js
const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');

// POST route to create a new branch
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

// GET route to fetch all branches
router.get('/', async (req, res) => {
    try {
        const branches = await Branch.find();
        res.json(branches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
