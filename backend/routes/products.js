// routes/products.js
const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Route to get a product by barcode 
router.get('/:barcode' , async (req, res) => {
  console.log(`Barcode requested: ${req.params.barcode}`);
  try {
    const product = await Product.findOne({ 
      barcode: req.params.barcode, 
    });
    if (!product) return res.status(404).send('المنتج غير متوفر');
    res.json(product);
  } catch (error) {
    console.error('خطأ في استرجاع المنتجات', error);
    res.status(500).send('خطأ في السيرفر');
  }
});

// Route to add a product to inventory
router.post('/add', async (req, res) => {
  const { barcode, name, description, price, quantity, category } = req.body; 

  const existingProduct = await Product.findOne({ barcode });
if (existingProduct) {
    return res.status(400).json({ message: 'هذا المنتج متوفر بالفعل' });
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
    });

    // Save the product to the database
    await newProduct.save();
    res.status(201).json({ message: 'تم اضافة المنتج الي المخزن بنجاح', product: newProduct });
  } catch (error) {
    console.error('خطأ في اضافة المنتج', error);
    res.status(500).send('خطأ في السيرفر');
  }
});

// Route to search for products by category, query
router.get('/', async (req, res) => {
  const { category, query } = req.query; 
  const filter = {};


  try {

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
    console.error('خطأ في استرجاع المنتجات', error);
    res.status(500).send('خطأ في السيرفر');
  }
});

// Backend route to decrease product quantity by barcode
router.put('/:barcode/decrease', async (req, res) => {
  const { barcode } = req.params;
  const { quantity } = req.body; 

  try {
    const product = await Product.findOneAndUpdate(
      { barcode }, // Include branchId in the filter
      { $inc: { quantity: -quantity } }, // Decrease quantity by specified amount
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'المنتج غير متوفر' });
    }

    res.json({ message: 'تم تحديث كيمة المنتج', product });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تخديث كمية المنتج', error });
  }
});

// Route to update a product by barcode
router.put('/:barcode', async (req, res) => {
  const { barcode } = req.params;
  const { ...updatedData } = req.body; 

  try {
    const product = await Product.findOneAndUpdate(
      { barcode }, 
      updatedData, 
      { new: true } 
    );

    if (!product) {
      return res.status(404).json({ message: 'المنتج غير متوفر' });
    }

    res.json({ message: 'تم تحديث المنتج بنجاح', product });
  } catch (error) {
    console.error('خطأ في تحديث المنتج', error);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});


// Route to delete a product by barcode 
router.delete('/:barcode', async (req, res) => {
  const { barcode } = req.params; // Get the barcode from the URL

  try {
    // Find and delete the product
    const deletedProduct = await Product.findOneAndDelete({
      barcode
    });

    if (!deletedProduct) {
      return res.status(404).json({ message: 'المنتج غير متوفر' });
    }

    res.json({ message: 'تم حذف المنتج بنجاح', product: deletedProduct });
  } catch (error) {
    console.error('خطأ في حذف المنتج', error);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

// Route to update a product by ID 
router.put('/id/:id', async (req, res) => {
  const { id } = req.params; // Get the product ID from the URL
  const { ...updatedData } = req.body; 

  try {
    const product = await Product.findOneAndUpdate(
      { _id: id }, 
      updatedData, 
      { new: true } 
    );

    if (!product) {
      return res.status(404).json({ message: 'المنتج غير متوفر' });
    }

    res.json({ message: 'تم تحديث المنتج بنجاح', product });
  } catch (error) {
    console.error('خطأ في تحديث المنتج', error);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});


module.exports = router;
