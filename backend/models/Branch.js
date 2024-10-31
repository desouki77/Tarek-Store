const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    inventory: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // Reference to your Product model
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Branch', BranchSchema);
