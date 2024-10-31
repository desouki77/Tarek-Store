const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    branchId: { // New field to associate the order with a specific branch
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch', // Reference to a Branch model (you'll need to create this if you haven't already)
        required: true, // Make this field required
    },
    checkoutItems: [{
        barcode: String,
        name: String,
        price: Number,
        quantity: { // Add quantity to track how many of each item is being ordered
            type: Number,
            required: false,
        },
    }],
    discount: { 
        type: Number,
    },
    paid: { 
        type: Number,
        required: true,
    },
    remaining: { 
        type: Number,
        required: false,
    },
    clientName: { 
        type: String,
        required: false,
    },
    clientPhone: { 
        type: String,
        required: false,
    },
    date: { 
        type: String,
        required: true,
    },
    time: { 
        type: String,
        required: true,
    },
}, { timestamps: true }); // Enable timestamps

module.exports = mongoose.model('Order', OrderSchema);
