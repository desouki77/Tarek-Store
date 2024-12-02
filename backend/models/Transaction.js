const mongoose = require('mongoose');

// Define the Transaction schema
const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model
    },
    type: {
        type: String,
        enum: ['input', 'output','recharge','maintenance','supplier_payment','customer_payment','purchasing','returns'], 
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true, // Remove whitespace from both ends
    },
    amount: {
        type: Number,
        required: true,
        min: 0, // Ensure the amount is not negative
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Branch', // Reference to the Branch model
    },
    date: {
        type: Date,
        default: Date.now, // Default to the current date
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Create the Transaction model
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
