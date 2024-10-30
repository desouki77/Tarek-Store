const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    checkoutItems: [{
        barcode: String,
        name: String,
        price: Number,
    }],
    discount: Number,
    paid: Number,
    remaining: Number,
    clientName: String,
    clientPhone: String,
    date: String,
    time: String,
}, { timestamps: true }); // Enable timestamps

module.exports = mongoose.model('Order', OrderSchema);
