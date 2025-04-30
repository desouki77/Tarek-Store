// backend/routes/suppliers.js
const express = require('express');
const Supplier = require('../models/Supplier');

const router = express.Router();

// Create a new supplier
router.post('/add', async (req, res) => {
    const { name, phoneNumber, company ,moneyOwed } = req.body;

    try {
        const newSupplier = new Supplier({ name, phoneNumber, company ,moneyOwed });
        await newSupplier.save();
        res.status(201).json({ message: 'تم اضافة المورد بنجاح', supplier: newSupplier });
    } catch (error) {
        res.status(400).json({ message: 'خطاء في اضافة المورد', error });
    }
});

router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
      const suppliers = await Supplier.find()
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .sort({ createdAt: -1 });

      const totalSuppliers = await Supplier.countDocuments();

      // ✅ Calculate total money owed from all suppliers (regardless of pagination)
      const allSuppliers = await Supplier.find();
      const totalMoneyOwedAll = allSuppliers.reduce((acc, sup) => acc + (parseFloat(sup.moneyOwed) || 0), 0);

      res.json({
          suppliers,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSuppliers / limit),
          totalSuppliers,
          totalMoneyOwedAll, // ✅ send to frontend
      });
  } catch (error) {
      res.status(500).json({ message: 'خطأ في استرجاع الموردين', error });
  }
});


// DELETE a supplier by ID
router.delete('/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'المورد غير موجود' });
        }
        res.json({ message: 'تم مسح المورد بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'خطأ في مسح المورد' });
    }
});

// Replace both PUT routes with this single, consolidated route:
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { moneyOwed } = req.body;

    // Validate input
    if (isNaN(moneyOwed)) {
      return res.status(400).json({ message: 'moneyOwed must be a number' });
    }

    // Convert to number to ensure proper type
    const newMoneyOwed = Number(moneyOwed);

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { $set: { moneyOwed: newMoneyOwed } },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.status(200).json({ 
      message: 'Supplier updated successfully',
      supplier: {
        ...supplier.toObject(),
        moneyOwed: newMoneyOwed // Ensure response shows updated value
      }
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

  // جلب بيانات المورد بناءً على الـ ID
router.get('/:id', async (req, res) => {
  try {
      const supplier = await Supplier.findById(req.params.id);
      if (!supplier) {
          return res.status(404).json({ message: 'المورد غير موجود' });
      }
      res.json(supplier);
  } catch (error) {
      console.error('خطأ في جلب بيانات المورد:', error);
      res.status(500).json({ message: 'حدث خطأ ما في السيرفر' });
  }
});

router.get("invoices/:id", async (req, res) => {
  try {
      const { supplierId } = req.params;

      // Validate supplierId before querying
      if (!mongoose.Types.ObjectId.isValid(supplierId)) {
          return res.status(400).json({ error: "Invalid supplier ID format" });
      }

      const invoices = await ProductInvoice.find({ supplier: supplierId }).populate("supplier");
      
      res.json(invoices);
  } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

  

module.exports = router;
