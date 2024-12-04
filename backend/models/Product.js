// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  sn: {type: String, required:false},
  description: { type: String , required:false},
  color: {type: String, required:false},
  price: { type: Number, required: true },
  quantity: { type: Number, required:true, default: 0 },
  category: { type: String, required: false },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
