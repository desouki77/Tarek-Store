// backend/models/Client.js
const mongoose = require('mongoose');

// models/Client.js
const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    amountRequired: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }]
}, { timestamps: true });

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
