const mongoose = require('mongoose');

const BankSchema = new mongoose.Schema({
    bankAmount: {
        type: String,
        required: true,
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Bank', BankSchema);
