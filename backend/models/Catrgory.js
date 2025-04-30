const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // Reference to parent category
    level: { type: Number, required: true }, // 1 = main, 2 = sub, 3 = third
});

module.exports = mongoose.model('Category', categorySchema);
