const mongoose = require('mongoose');

const ProductInvoiceSchema = new mongoose.Schema({
    // Product Details
    productId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    productBarcode: {
        type: String,
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    sn: {
        type: [String], // Array of serial numbers
        default: [],
    },
    color: {
        type: String,
    },
    mainCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: false,
    },
    thirdCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: false,
    },
    condition: {
        type: String,
        required: false,
    },

    // Supplier Details
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true,
    },

    // Pricing and Quantity
    quantity: {
        type: Number,
        required: true,
    },
    purchasePrice: {
        type: Number,
        required: true,
    },
    amountPaid: {
        type: Number,
        required: true,
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
    moneyOwed: {
        type: Number,
        required: true,
    },

    // Invoice Status
    invoiceStatus: {
        type: String,
        enum: ["غير خالص", "خالص"],
        default: "غير خالص",
        required: true,
    },

    // Branch Details
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true,
    },

    // Timestamps
}, { timestamps: true });

module.exports = mongoose.model("ProductInvoice", ProductInvoiceSchema);