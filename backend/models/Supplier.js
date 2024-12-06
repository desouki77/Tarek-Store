// backend/models/Supplier.js
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
    },
    phoneNumber: {
        type: String,
        required: false,
    },
    company: {
        type: String,
        required: false,
    },
    notes: {
        type: String,
        required: false,
    }
}, {
    timestamps: true,
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
