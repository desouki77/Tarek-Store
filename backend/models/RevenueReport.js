const mongoose = require('mongoose');

const revenueReportSchema = new mongoose.Schema({
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },  // ربط مع الفرع
    startDate: { type: Date, required: true },  // تاريخ البداية
    endDate: { type: Date, required: true },  // تاريخ النهاية
    reportData: [
        {
            type: { type: String, enum: ['input', 'output', 'recharge', 'maintenance', 'supplier_payment', 'customer_payment', 'purchasing', 'returns', 'output_staff','sales'], required: true },
            totalRevenue: { type: Number, required: true },
        },
    ],
    reportTitle: { type: String, required: true },  // عنوان التقرير
    createdAt: { type: Date, default: Date.now },  // تاريخ الإنشاء
});

const RevenueReport = mongoose.model('RevenueReport', revenueReportSchema);

module.exports = RevenueReport;
