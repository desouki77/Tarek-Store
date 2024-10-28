// backend/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        required: true,
    },
    type: {
        type: String,
        enum: ['selling', 'input', 'output', 'recharge', 'maintenance', 'customer_payment', 'supplier_payment', 'purchasing', 'returns'],
        required: true,
    },
    code: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    amount: {
        type: Number,
        required: true,
    },
    remaining: {
        type: Number,
        required: false,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    branch: {
        type: String,
        enum: ['فرع باراديس', 'فرع النمسا'],
        required: true,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: false, // Not all transactions will involve a client
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: false, // Not all transactions will involve a supplier
    },
}, {
    timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
