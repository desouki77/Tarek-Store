const mongoose = require('mongoose');

const salesReportSchema = new mongoose.Schema({
    reportName: String,
    totalSales: Number,
    totalItemsSold: Number,
    totalDiscounts: Number,
    orderCount: Number,
    branchId: mongoose.Schema.Types.ObjectId,
    startDate: Date,
    endDate: Date,
    createdAt: { type: Date, default: Date.now },
});

const SalesReport = mongoose.model('SalesReport', salesReportSchema);

module.exports = SalesReport;
