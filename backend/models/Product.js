// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  barcode: { type: String, required: true},
  name: { type: String, required: true },
  sn: {type: [String], required:false},
  color: {type: String, required:false},

  mainCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
  thirdCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
  condition: { type: String, required: false },

  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: false },
  quantity: { type: Number, required:true, default:1 },

  purchasePrice: { type: Number, required: false },
  amountPaid: { type: Number, required: false},
  sellingPrice: { type: Number, required: true },

  branchId: { // New field to associate the order with a specific branch
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch', // Reference to a Branch model (you'll need to create this if you haven't already)
    required: true, // Make this field required
},
},{ timestamps: true }); // Enable timestamps);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
