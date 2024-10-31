// routes/products.js
const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

router.get('/:barcode', async (req, res) => {
  console.log(`Barcode requested: ${req.params.barcode}`);
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    if (!product) return res.status(404).send('Product not found');
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Server error');
  }
});

// Route to add a product to inventory
router.post('/add', async (req, res) => {
  const { barcode, name, description, price, quantity , category} = req.body;

  try {
    // Create a new product instance
    const newProduct = new Product({
      barcode,
      name,
      description,
      price,
      quantity,
      category,
    });

    // Save the product to the database
    await newProduct.save();
    res.status(201).json({ message: 'Product added to inventory', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).send('Server error');
  }
});

// Route to search for products by category and query
router.get('/', async (req, res) => {
  const { category, query } = req.query;

  try {
    // Create a filter object
    const filter = {};

    // Check if category is provided
    if (category) {
      filter.category = category;
    }

    // Check if query is provided
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } }, // Case-insensitive search for name
        { description: { $regex: query, $options: 'i' } }, // Case-insensitive search for description
      ];
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Server error');
  }
});


// Backend route to decrease product quantity by barcode
router.put('/:barcode/decrease', async (req, res) => {
  const { barcode } = req.params;
  const { quantity } = req.body;

  try {
      const product = await Product.findOneAndUpdate(
          { barcode },
          { $inc: { quantity: -quantity } }, // Decrease quantity by specified amount
          { new: true }
      );

      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }

      res.json({ message: 'Product quantity updated', product });
  } catch (error) {
      res.status(500).json({ message: 'Error updating product quantity', error });
  }
});

module.exports = router;
