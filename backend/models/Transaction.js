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
        enum: ['بيع', ,'مدخلات','مخرجات', 'شحن', 'صيانة', 'سداد عملاء','سداد موردين','مشتروات','مرتجعات'], // Define transaction types
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    branch: {
        type: String,
        enum:['فرع بالاس','فرع النمسا '],
        required: true,
    },
}, {
    timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
