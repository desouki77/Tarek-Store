const express = require('express');
const router = express.Router();
const ProductInvoice = require('../models/ProductInvoice');
const mongoose = require('mongoose');

// Helper function to calculate money owed
const calculateMoneyOwed = (invoice) => {
  return invoice.purchasePrice - invoice.amountPaid;
};

// POST Create a new product invoice
router.post("/", async (req, res) => {
    try {
        const invoiceData = req.body;
        // Calculate initial moneyOwed
        invoiceData.moneyOwed = invoiceData.purchasePrice - (invoiceData.amountPaid || 0);
        invoiceData.invoiceStatus = invoiceData.moneyOwed <= 0 ? 'خالص' : 'غير خالص';
        
        const invoice = new ProductInvoice(invoiceData);
        await invoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET All product invoices
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 30, branchId, search, startDate, endDate } = req.query;
        const query = {};

        if (branchId) {
            query.branchId = branchId;
        }

        if (search) {
            query.$or = [
                { productBarcode: { $regex: search, $options: "i" } }, 
            ];
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const totalInvoices = await ProductInvoice.countDocuments(query);
        const invoices = await ProductInvoice.find(query)
            .populate("supplier", "name")
            .populate("branchId", "name")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Ensure moneyOwed is calculated for each invoice
        const formattedInvoices = invoices.map(invoice => ({
            ...invoice._doc,
            moneyOwed: calculateMoneyOwed(invoice)
        }));

        res.json({ 
            invoices: formattedInvoices, 
            totalInvoices, 
            limit: parseInt(limit) 
        });
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ أثناء جلب الفواتير", error });
    }
});

// GET Product invoices by supplierId
router.get("/supplier/:supplierId", async (req, res) => {
    try {
        let { supplierId } = req.params;
        const { page = 1, limit = 30, startDate, endDate } = req.query;
        const query = { supplier: supplierId };

        if (!mongoose.Types.ObjectId.isValid(supplierId)) {
            return res.status(400).json({ message: "Invalid supplier ID format" });
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const invoices = await ProductInvoice.find(query)
            .populate("branchId", "name")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const formattedInvoices = invoices.map(invoice => {
            const moneyOwed = calculateMoneyOwed(invoice);
            return {
                _id: invoice._id,
                productBarcode: invoice.productBarcode,
                productName: invoice.productName,
                purchasePrice: invoice.purchasePrice,
                amountPaid: invoice.amountPaid,
                moneyOwed: moneyOwed,
                remaining: moneyOwed, // Alias for moneyOwed for backward compatibility
                invoiceStatus: moneyOwed <= 0 ? 'خالص' : 'غير خالص',
                branch: invoice.branchId?.name || "غير محدد",
                createdAt: invoice.createdAt
            };
        });

        const totalInvoices = await ProductInvoice.countDocuments(query);
        const totalPages = Math.ceil(totalInvoices / limit);

        res.json({ 
            invoices: formattedInvoices, 
            totalPages,
            totalInvoices
        });
    } catch (error) {
        console.error("خطأ في جلب الفواتير:", error);
        res.status(500).json({ message: "حدث خطأ أثناء جلب فواتير المورد" });
    }
});

// PUT Update invoice moneyOwed
router.put('/update-moneyowed', async (req, res) => {
    const { invoiceId, paymentType, partialAmount } = req.body;
  
    try {
        const invoice = await ProductInvoice.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        if (paymentType === 'full') {
            invoice.amountPaid = invoice.purchasePrice;
        } else if (paymentType === 'partial') {
            const payment = Number(partialAmount);
            if (isNaN(payment)) {
                return res.status(400).json({ message: 'Partial amount must be a number' });
            }
            invoice.amountPaid += payment;
        } else {
            return res.status(400).json({ message: 'Invalid payment type' });
        }

        // Recalculate moneyOwed
        invoice.moneyOwed = calculateMoneyOwed(invoice);
        
        // Update status based on moneyOwed
        invoice.invoiceStatus = invoice.moneyOwed <= 0 ? 'خالص' : 'غير خالص';
        
        // Prevent negative moneyOwed
        if (invoice.moneyOwed < 0) {
            invoice.moneyOwed = 0;
            invoice.amountPaid = invoice.purchasePrice;
        }

        await invoice.save();
        
        // Return the updated invoice with all calculations
        const updatedInvoice = {
            ...invoice._doc,
            moneyOwed: calculateMoneyOwed(invoice),
            remaining: calculateMoneyOwed(invoice) // For backward compatibility
        };

        res.status(200).json({ 
            message: 'Payment processed successfully', 
            invoice: updatedInvoice 
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;