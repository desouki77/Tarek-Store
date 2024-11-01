// controllers/branchController.js
const Branch = require('../models/Branch'); // Update with the correct path to your Branch model

// Get all branches
exports.getBranches = async (req, res) => {
    try {
        const branches = await Branch.find();
        res.status(200).json(branches);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching branches', error });
    }
};
