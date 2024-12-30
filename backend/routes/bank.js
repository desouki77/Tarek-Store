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

// GET: Fetch all banks with pagination and date filter
router.get('/', async (req, res) => {
    const { startDate, endDate, page = 1, limit = 10 } = req.query; // الحصول على التاريخ والنطاق والصفحة والعدد المحدد من الاستعلام

    try {
        // إنشاء فلتر للتاريخ
        let filter = {};
        
        if (startDate && endDate) {
            filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // تحويل page و limit إلى أرقام صحيحة
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // حساب عدد العناصر التي سيتم تخزينها
        const totalBanks = await Bank.countDocuments(filter);
        const totalPages = Math.ceil(totalBanks / limitNumber);

        // الحصول على العناصر باستخدام التصفية والترتيب مع الـ pagination
        const banks = await Bank.find(filter)
            .populate('branch', 'name')
            .sort({ createdAt: -1 }) // ترتيب حسب createdAt من الأحدث إلى الأقدم
            .skip((pageNumber - 1) * limitNumber) // تحديد عدد العناصر التي يجب تخطيها بناءً على الصفحة
            .limit(limitNumber); // تحديد الحد الأقصى للعناصر في كل صفحة

        res.json({ banks, totalPages, currentPage: pageNumber }); // إرسال البيانات مع عدد الصفحات والصفحة الحالية
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

router.put('/:id', async (req, res) => {
    const { bankAmount } = req.body;

    try {
        const bank = await Bank.findByIdAndUpdate(
            req.params.id,
            { $set: { bankAmount } }, // تحديث فقط bankAmount
            { new: true } // إرجاع القيمة المحدثة
        );

        if (!bank) return res.status(404).json({ message: 'Bank not found' });
        res.json(bank);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


module.exports = router;