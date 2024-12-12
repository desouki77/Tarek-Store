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
  supplier: { type: String, required: false },
  mainCategory: { type: String, required: true },
  subCategory: { type: String, required: false },
  thirdCategory: { type: String, required: false },
  condition: { type: String, required: false },
  branchId: { // New field to associate the order with a specific branch
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch', // Reference to a Branch model (you'll need to create this if you haven't already)
    required: true, // Make this field required
},
},{ timestamps: true }); // Enable timestamps);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
