// routes/products.js
const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');


// Route to get a product by barcode 
router.get('/:barcode' , async (req, res) => {
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

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({ message: 'معرف الفرع غير صالح' });
    }

    if (!barcode || !name || !price || !quantity || !mainCategory || !branchId) {
      return res.status(400).json({ message: 'الرجاء تعبئة جميع الحقول المطلوبة' });
    }
    
    
    // Check if the product already exists in the same branch
    const existingProduct = await Product.findOne({ barcode, branchId });
    if (existingProduct) {
      return res.status(400).json({ message: 'هذا المنتج موجود بالفعل في هذا الفرع' });
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
      supplier,
      branchId, // Associate product with branch
    });

    try {
      await newProduct.save();
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'الباركود مستخدم من قبل.' });
      }
      throw error;
    }    

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

// في ملف الـ routes الخاص بالمنتجات (مثال: products.js)
router.put('/:productId/increment', async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body; // الكمية التي سيتم زيادتها

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    // زيادة الكمية بمقدار `quantity`
    product.quantity += quantity;
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'هناك خطأ في زيادة الكمية' });
  }
});

// في ملف الـ routes الخاص بالمنتجات (مثال: products.js)
router.put('/:productId/decrement', async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body; // الكمية التي سيتم إنقاصها

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    // التأكد من أن الكمية الجديدة لا تكون أقل من الصفر
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'الكمية غير كافية' });
    }

    // إنقاص الكمية بمقدار `quantity`
    product.quantity -= quantity;
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'هناك خطأ في إنقاص الكمية' });
  }
});




module.exports = router;
