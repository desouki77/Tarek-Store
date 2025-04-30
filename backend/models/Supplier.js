// backend/models/Supplier.js
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: false,
    },
    moneyOwed: {
        type: Number,
        default: 0,
        required: false,
    },
    productInvoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductInvoice',
    }
}, {
    timestamps: true,
});

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;
