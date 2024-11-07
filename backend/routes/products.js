// routes/products.js
const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const validateBranchId = require('../middlewares/validateBranch');

// Route to get a product by barcode and branchId
router.get('/:barcode', validateBranchId , async (req, res) => {
  const { branchId } = req.query; // Include branchId from query
  console.log(`Barcode requested: ${req.params.barcode} for branch: ${branchId}`);
  try {
    const product = await Product.findOne({ 
      barcode: req.params.barcode, 
      branchId: branchId // Filter by branchId
    });
    if (!product) return res.status(404).send('Product not found');
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Server error');
  }
});

// Route to add a product to inventory
router.post('/add', validateBranchId, async (req, res) => {
  const { barcode, name, description, price, quantity, category, branchId } = req.body; // Include branchId

  const existingProduct = await Product.findOne({ barcode, branchId });
if (existingProduct) {
    return res.status(400).json({ message: 'Product with this barcode already exists in this branch' });
}

  try {
    // Create a new product instance
    const newProduct = new Product({
      barcode,
      name,
      description,
      price,
      quantity,
      category,
      branchId, // Save branchId with the product
    });

    // Save the product to the database
    await newProduct.save();
    res.status(201).json({ message: 'Product added to inventory', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).send('Server error');
  }
});

// Route to search for products by category, query, and branchId
router.get('/', validateBranchId, async (req, res) => {
  const { category, query, branchId } = req.query; // Include branchId from query

  try {
    // Create a filter object
    const filter = {branchId};

    // Check if branchId is provided
    if (branchId) {
      filter.branchId = branchId; // Filter by branchId
    }

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

// Backend route to decrease product quantity by barcode and branchId
router.put('/:barcode/decrease',validateBranchId, async (req, res) => {
  const { barcode } = req.params;
  const { quantity, branchId } = req.body; // Ensure branchId is part of the request

  try {
    const product = await Product.findOneAndUpdate(
      { barcode, branchId }, // Include branchId in the filter
      { $inc: { quantity: -quantity } }, // Decrease quantity by specified amount
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found or does not belong to this branch' });
    }

    res.json({ message: 'Product quantity updated', product });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product quantity', error });
  }
});

// Route to update a product by barcode and branchId
router.put('/:barcode', validateBranchId, async (req, res) => {
  const { barcode } = req.params;
  const { branchId, ...updatedData } = req.body; // Extract branchId and other fields to update

  try {
    const product = await Product.findOneAndUpdate(
      { barcode, branchId }, // Ensure the product belongs to the specified branch
      updatedData, // Update with provided data
      { new: true } // Return the updated product
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found or does not belong to this branch' });
    }

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Route to delete a product by barcode and branchId
router.delete('/:barcode', validateBranchId, async (req, res) => {
  const { barcode } = req.params; // Get the barcode from the URL
  const { branchId } = req.query; // Include branchId from query

  try {
    // Find and delete the product
    const deletedProduct = await Product.findOneAndDelete({
      barcode,
      branchId // Ensure we are deleting the correct product in the correct branch
    });

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found or does not belong to this branch' });
    }

    res.json({ message: 'Product deleted successfully', product: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to update a product by ID and branchId
router.put('/id/:id', validateBranchId, async (req, res) => {
  const { id } = req.params; // Get the product ID from the URL
  const { branchId, ...updatedData } = req.body; // Extract branchId and other fields to update

  try {
    const product = await Product.findOneAndUpdate(
      { _id: id, branchId }, // Use the product ID and ensure the product belongs to the specified branch
      updatedData, // Update with provided data
      { new: true } // Return the updated product
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found or does not belong to this branch' });
    }

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});






module.exports = router;
