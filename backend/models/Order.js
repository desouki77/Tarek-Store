// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
    },
    checkoutItems: [{
        barcode: String,
        name: String,
        sellingPrice: Number,
        quantity: {
            type: Number,
            required: false,
            default: 1
        },
        sn: {
            type: String,  // Change from Mixed to String
            required: false
        },
        purchasePrice: { // Add purchase price for reference
            type: Number,
            required: false
        }
    }],
    discount: Number,
    paid: {
        type: Number,
        required: true,
    },
    remaining: Number,
    clientName: String,
    clientPhone: String,
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);