// backend/routes/suppliers.js
const express = require('express');
const Supplier = require('../models/Supplier');

const router = express.Router();

// Create a new supplier
router.post('/add', async (req, res) => {
    const { name, phoneNumber, company, notes ,moneyOwed } = req.body;

    try {
        const newSupplier = new Supplier({ name, phoneNumber, company, notes ,moneyOwed });
        await newSupplier.save();
        res.status(201).json({ message: 'تم اضافة المورد بنجاح', supplier: newSupplier });
    } catch (error) {
        res.status(400).json({ message: 'خطاء في اضافة المورد', error });
    }
});

// backend/routes/suppliers.js
router.get('/', async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Default values: page 1, 10 items per page

    try {
        const suppliers = await Supplier.find()
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(parseInt(limit))  // Limit to the specified number of documents
            .sort({ createdAt: -1 }); // Sort by newest first

        const totalSuppliers = await Supplier.countDocuments(); // Total number of documents

        res.json({
            suppliers,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalSuppliers / limit),
            totalSuppliers,
        });
    } catch (error) {
        res.status(500).json({ message: 'خطأ في استرجاع الموردين', error });
    }
});

// DELETE a supplier by ID
router.delete('/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'المورد غير موجود' });
        }
        res.json({ message: 'تم مسح المورد بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'خطأ في مسح المورد' });
    }
});

module.exports = router;
