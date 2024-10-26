// routes/products.js
const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

router.get('/:barcode', async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    if (!product) return res.status(404).send('Product not found');
    res.json(product);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
