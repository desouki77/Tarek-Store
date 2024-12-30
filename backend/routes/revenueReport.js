const express = require('express');
const router = express.Router();
const RevenueReport = require('../models/RevenueReport'); // استيراد النموذج

router.post('/save-revenue-report', async (req, res) => {
    const { startDate, endDate, branchId, currentMonthReport, previousMonthReport } = req.body;

    // إذا لم يتم تحديد branchId، نعتبر أنه يجب جلب الإيرادات من جميع الفروع
    const reportTitle = `تقرير الإيرادات - ${new Date(startDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}`;

    try {
        // إذا تم تحديد branchId وكان صحيحًا، نقوم بإنشاء تقرير خاص بالفرع المحدد
        if (branchId && mongoose.Types.ObjectId.isValid(branchId)) {
            const newReport = new RevenueReport({
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                branchId,
                reportData: currentMonthReport,  // تقرير الشهر الحالي
                reportTitle,  // إضافة عنوان التقرير
            });

            await newReport.save();
            res.status(200).json({ message: 'تم حفظ التقرير بنجاح للفرع المحدد' });
        } else {
            // إذا لم يتم تحديد branchId أو كان غير صالح، نعتبر أنه يجب جلب الإيرادات من جميع الفروع
            const newReport = new RevenueReport({
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                branchId: null,  // تحديده كـ null في حالة عدم وجود branchId
                reportData: currentMonthReport,  // تقرير الشهر الحالي
                reportTitle,  // إضافة عنوان التقرير
            });

            await newReport.save();
            res.status(200).json({ message: 'تم حفظ التقرير بنجاح لجميع الفروع' });
        }
    } catch (err) {
        console.error('Error saving the report:', err);
        res.status(500).json({ message: 'حدث خطأ أثناء حفظ التقرير' });
    }
});

// نقطة API لاسترجاع جميع التقارير مع الترقيم
router.get('/revenue-reports', async (req, res) => {
    const { page = 1, limit = 5 } = req.query;  // الصفحة الحالية وعدد العناصر في الصفحة
    try {
        // حساب إجمالي عدد التقارير
        const totalReports = await RevenueReport.countDocuments();
        const totalPages = Math.ceil(totalReports / limit);  // حساب عدد الصفحات

        // استرجاع التقارير حسب الترقيم
        const reports = await RevenueReport.find()
            .populate('branchId')
            .skip((page - 1) * limit)  // تحديد السجل الذي نبدأ منه
            .limit(parseInt(limit));   // تحديد عدد العناصر في الصفحة

        res.json({
            reports,
            totalPages,  // إرسال عدد الصفحات
        });
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ message: 'Error fetching reports' });
    }
});



router.get('/revenue-reports/:reportId', async (req, res) => {
    try {
        const report = await RevenueReport.findById(req.params.reportId).populate('branchId');
        res.json(report);
    } catch (err) {
        console.error('Error fetching report details:', err);
        res.status(500).json({ message: 'Error fetching report details' });
    }
});







module.exports = router;
