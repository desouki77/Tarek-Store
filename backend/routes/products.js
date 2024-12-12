// routes/products.js
const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const Supplier = require('../models/Supplier');


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

router.post('/add', async (req, res) => {
  const { barcode, name, sn, description, color, price, quantity, mainCategory, subCategory, thirdCategory, condition, supplier, branchId } = req.body;

  try {
    // Check if the product already exists in the same branch
    const existingProduct = await Product.findOne({ barcode, branchId });
    if (existingProduct) {
      return res.status(400).json({ message: 'هذا المنتج موجود بالفعل في هذا الفرع' });
    }

    // Check if the supplier exists
    let existingSupplier = await Supplier.findOne({ name: supplier });
    if (!existingSupplier) {
      // Create a new supplier if it doesn't exist
      existingSupplier = new Supplier({ name: supplier, phoneNumber: '', company: '', notes: '' });
      await existingSupplier.save();
    }

    // Create the product
    const newProduct = new Product({
      barcode,
      name,
      sn,
      description,
      color,
      price,
      quantity,
      mainCategory,
      subCategory,
      thirdCategory,
      condition,
      supplier: existingSupplier.name,
      branchId, // Associate product with branch
    });

    await newProduct.save();

    res.status(201).json({ message: 'تم اضافة المنتج بنجاح', product: newProduct });
  } catch (error) {
    console.error('خطأ في اضافة المنتج', error);
    res.status(500).send('خطأ في السيرفر');
  }
});



router.get('/', async (req, res) => {
  const { branchId, mainCategory, subCategory, thirdCategory, condition, query, barcode } = req.query;

  const filter = { branchId }; // تصفية حسب الفرع

  if (mainCategory) {
    filter.mainCategory = { $regex: `^${mainCategory}`, $options: 'i' };
  }
  if (subCategory) {
    filter.subCategory = { $regex: `^${subCategory}`, $options: 'i' };
  }
  if (thirdCategory) {
    filter.thirdCategory = { $regex: `^${thirdCategory}`, $options: 'i' };
  }
  if (condition) {
    filter.condition = { $regex: `^${condition}`, $options: 'i' };
  }
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { barcode: { $regex: query, $options: 'i' } }, // Allow search by barcode as part of the query
    ];
  }

  try {
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('حدث خطأ أثناء استرجاع المنتجات');
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
