// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  category: { type: String, required: false },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch', // Reference to the Branch model
    required: false, // This could be optional if some users are not assigned to a branch
},
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
