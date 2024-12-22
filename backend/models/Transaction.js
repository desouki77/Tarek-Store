const mongoose = require('mongoose');

// Define the Transaction schema
const transactionSchema = new mongoose.Schema({
    branchId: { // New field to associate the order with a specific branch
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch', // Reference to a Branch model (you'll need to create this if you haven't already)
        required: true, // Make this field required
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model
    },
    type: {
        type: String,
        enum: ['input', 'output','recharge','maintenance','supplier_payment','customer_payment','purchasing','returns','warranty','output_staff'], 
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
    date: {
        type: Date,
        default: Date.now, // Default to the current date
    },
    supplier: { // New field to associate the order with a specific branch
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier', // Reference to a Branch model (you'll need to create this if you haven't already)
        required: false, // Make this field required
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Create the Transaction model
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
