const express = require('express');
const router = express.Router();
const SalesReport = require('../models/SalesReport'); // نموذج التقرير

router.post('/save-sales-report', async (req, res) => {
    const { reportName, totalSales, totalItemsSold, totalDiscounts, orderCount, branchId, startDate, endDate } = req.body;

    try {
        const newReport = new SalesReport({
            reportName,
            totalSales,
            totalItemsSold,
            totalDiscounts,
            orderCount,
            branchId,
            startDate,
            endDate,
            createdAt: new Date(),
        });

        await newReport.save();
        res.status(200).json({ message: 'Report saved successfully' });
    } catch (err) {
        console.error('Error saving report:', err);
        res.status(500).json({ message: 'Error saving report' });
    }
});


// API لاسترجاع جميع التقارير المحفوظة مع التصفية حسب الصفحة
router.get('/get-all-reports', async (req, res) => {
    const page = parseInt(req.query.page) || 1;  // الصفحة الافتراضية هي 1
    const limit = parseInt(req.query.limit) || 10;  // الحد الافتراضي للنتائج في الصفحة هو 10
    const skip = (page - 1) * limit;  // حساب عدد النتائج التي يجب تخطيها

    try {
        const totalReports = await SalesReport.countDocuments(); // حساب العدد الإجمالي للتقارير
        const reports = await SalesReport.find()
            .skip(skip)
            .limit(limit); // جلب التقارير باستخدام التصفية

        res.status(200).json({
            reports,
            totalPages: Math.ceil(totalReports / limit), // حساب عدد الصفحات الكلي
            currentPage: page,
        });
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ message: 'Error fetching reports' });
    }
});


module.exports = router;
