const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const validateBranchId = require('../middlewares/validateBranch');
const Supplier = require('../models/Supplier'); // تأكد من استيراد نموذج المورد



// Create a transaction with a specific type (e.g., "input")
router.post('/input', validateBranchId, async (req, res) => {
    const { branchId, description, amount, user, type, date } = req.body;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    const transaction = new Transaction({
        description,
        amount,
        user,
        type: 'input',
        branchId,  // Using branchId from the request body
        date
    });

    try {
        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.get('/dayinput', validateBranchId, async (req, res) => {
    const { branchId, startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    try {
        const startOfDay = startDate ? new Date(startDate) : new Date();
        const endOfDay = endDate ? new Date(endDate) : new Date();

        if (!startDate) startOfDay.setHours(0, 0, 0, 0);
        if (!endDate) endOfDay.setHours(23, 59, 59, 999);

        const query = {
            type: 'input',
            branchId: branchId,
            date: { $gte: startOfDay, $lte: endOfDay },
        };

        const skip = (page - 1) * limit; // Calculate how many documents to skip

        // Find transactions with pagination
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit)); // Limit the number of documents

        const totalTransactions = await Transaction.countDocuments(query); // Total count for pagination
        const totalPages = Math.ceil(totalTransactions / limit);

        res.json({
            transactions,
            totalTransactions,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});

router.get('/input', validateBranchId, async (req, res) => {
    const { branchId, startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    try {
        const query = {
            type: 'input',
            branchId: branchId,
        };
        
        if (startDate || endDate) {
            const startOfDay = startDate ? new Date(startDate) : new Date();
            const endOfDay = endDate ? new Date(endDate) : new Date();
        
            if (!startDate) startOfDay.setHours(0, 0, 0, 0);
            if (!endDate) endOfDay.setHours(23, 59, 59, 999);
        
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }
        

        const skip = (page - 1) * limit; // Calculate how many documents to skip

        // Find transactions with pagination
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit)); // Limit the number of documents

        const totalTransactions = await Transaction.countDocuments(query); // Total count for pagination
        const totalPages = Math.ceil(totalTransactions / limit);

        res.json({
            transactions,
            totalTransactions,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});


// Create a transaction with a specific type (e.g., "output")
router.post('/output', validateBranchId, async (req, res) => {
    const { branchId, description, amount, user, type, date } = req.body;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    const transaction = new Transaction({
        description,
        amount,
        user,
        type: 'output',
        branchId,  // Using branchId from the request body
        date
    });

    try {
        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.get('/dayoutput', validateBranchId, async (req, res) => {
    const { branchId, startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    try {
        const startOfDay = startDate ? new Date(startDate) : new Date();
        const endOfDay = endDate ? new Date(endDate) : new Date();

        if (!startDate) startOfDay.setHours(0, 0, 0, 0);
        if (!endDate) endOfDay.setHours(23, 59, 59, 999);

        const query = {
            type: 'output',
            branchId: branchId,
            date: { $gte: startOfDay, $lte: endOfDay },
        };

        const skip = (page - 1) * limit; // Calculate how many documents to skip

        // Find transactions with pagination
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit)); // Limit the number of documents

        const totalTransactions = await Transaction.countDocuments(query); // Total count for pagination
        const totalPages = Math.ceil(totalTransactions / limit);

        res.json({
            transactions,
            totalTransactions,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});

router.get('/output', validateBranchId, async (req, res) => {
    const { branchId, startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    try {
        const query = {
            type: 'output',
            branchId: branchId,
        };
        
        if (startDate || endDate) {
            const startOfDay = startDate ? new Date(startDate) : new Date();
            const endOfDay = endDate ? new Date(endDate) : new Date();
        
            if (!startDate) startOfDay.setHours(0, 0, 0, 0);
            if (!endDate) endOfDay.setHours(23, 59, 59, 999);
        
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }
        

        const skip = (page - 1) * limit; // Calculate how many documents to skip

        // Find transactions with pagination
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit)); // Limit the number of documents

        const totalTransactions = await Transaction.countDocuments(query); // Total count for pagination
        const totalPages = Math.ceil(totalTransactions / limit);

        res.json({
            transactions,
            totalTransactions,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});




// Create a transaction with a specific type (e.g., "output")
router.post('/recharge', validateBranchId, async (req, res) => {
    const { branchId, description, amount, user, type, date } = req.body;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    const transaction = new Transaction({
        description,
        amount,
        user,
        type: 'recharge',
        branchId,  // Using branchId from the request body
        date
    });

    try {
        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.get('/dayrecharge', validateBranchId, async (req, res) => {
    const { branchId, startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    try {
        const startOfDay = startDate ? new Date(startDate) : new Date();
        const endOfDay = endDate ? new Date(endDate) : new Date();

        if (!startDate) startOfDay.setHours(0, 0, 0, 0);
        if (!endDate) endOfDay.setHours(23, 59, 59, 999);

        const query = {
            type: 'recharge',
            branchId: branchId,
            date: { $gte: startOfDay, $lte: endOfDay },
        };

        const skip = (page - 1) * limit; // Calculate how many documents to skip

        // Find transactions with pagination
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit)); // Limit the number of documents

        const totalTransactions = await Transaction.countDocuments(query); // Total count for pagination
        const totalPages = Math.ceil(totalTransactions / limit);

        res.json({
            transactions,
            totalTransactions,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});

router.get('/recharge', validateBranchId, async (req, res) => {
    const { branchId, startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    try {
        const query = {
            type: 'recharge',
            branchId: branchId,
        };
        
        if (startDate || endDate) {
            const startOfDay = startDate ? new Date(startDate) : new Date();
            const endOfDay = endDate ? new Date(endDate) : new Date();
        
            if (!startDate) startOfDay.setHours(0, 0, 0, 0);
            if (!endDate) endOfDay.setHours(23, 59, 59, 999);
        
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }
        

        const skip = (page - 1) * limit; // Calculate how many documents to skip

        // Find transactions with pagination
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit)); // Limit the number of documents

        const totalTransactions = await Transaction.countDocuments(query); // Total count for pagination
        const totalPages = Math.ceil(totalTransactions / limit);

        res.json({
            transactions,
            totalTransactions,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});


// Create a transaction with a specific type (e.g., "output")
router.post('/maintenance', validateBranchId, async (req, res) => {
    const { branchId, description, amount, user, type, date } = req.body;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    const transaction = new Transaction({
        description,
        amount,
        user,
        type: 'maintenance',
        branchId,  // Using branchId from the request body
        date
    });

    try {
        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.get('/daymaintenance', validateBranchId, async (req, res) => {
    const { branchId, startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    try {
        const startOfDay = startDate ? new Date(startDate) : new Date();
        const endOfDay = endDate ? new Date(endDate) : new Date();

        if (!startDate) startOfDay.setHours(0, 0, 0, 0);
        if (!endDate) endOfDay.setHours(23, 59, 59, 999);

        const query = {
            type: 'maintenance',
            branchId: branchId,
            date: { $gte: startOfDay, $lte: endOfDay },
        };

        const skip = (page - 1) * limit; // Calculate how many documents to skip

        // Find transactions with pagination
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit)); // Limit the number of documents

        const totalTransactions = await Transaction.countDocuments(query); // Total count for pagination
        const totalPages = Math.ceil(totalTransactions / limit);

        res.json({
            transactions,
            totalTransactions,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});

router.get('/maintenance', validateBranchId, async (req, res) => {
    const { branchId, startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    try {
        const query = {
            type: 'maintenance',
            branchId: branchId,
        };
        
        if (startDate || endDate) {
            const startOfDay = startDate ? new Date(startDate) : new Date();
            const endOfDay = endDate ? new Date(endDate) : new Date();
        
            if (!startDate) startOfDay.setHours(0, 0, 0, 0);
            if (!endDate) endOfDay.setHours(23, 59, 59, 999);
        
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }
        

        const skip = (page - 1) * limit; // Calculate how many documents to skip

        // Find transactions with pagination
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit)); // Limit the number of documents

        const totalTransactions = await Transaction.countDocuments(query); // Total count for pagination
        const totalPages = Math.ceil(totalTransactions / limit);

        res.json({
            transactions,
            totalTransactions,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});



router.post('/supplier_payment', validateBranchId, async (req, res) => {
    const { branchId, description, amount, user, type, date, supplier } = req.body;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    try {
        let supplierId = null;

        // Validate and fetch supplier if provided
        if (supplier) {
            const existingSupplier = await Supplier.findOne({ name: supplier });

            if (!existingSupplier) {
                return res.status(400).json({ message: 'Supplier not found' });
            }

            // Update the owed amount
            existingSupplier.moneyOwed = Math.max(0, existingSupplier.moneyOwed - amount);
            await existingSupplier.save();

            supplierId = existingSupplier._id; // Get supplier ID
        }

        // Save the transaction
        const transaction = new Transaction({
            branchId,
            description,
            amount,
            user,
            type,
            date,
            supplier: supplierId, // Use supplier ID if available
        });

        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        console.error('Error saving transaction:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});





router.get('/daysupplier_payment', validateBranchId, async (req, res) => {
    const { branchId, startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    try {
        const startOfDay = startDate ? new Date(startDate) : new Date();
        const endOfDay = endDate ? new Date(endDate) : new Date();

        if (!startDate) startOfDay.setHours(0, 0, 0, 0);
        if (!endDate) endOfDay.setHours(23, 59, 59, 999);

        const query = {
            type: 'supplier_payment',
            branchId: branchId,
            date: { $gte: startOfDay, $lte: endOfDay },
        };

        const skip = (page - 1) * limit;

        // العثور على المعاملات مع تضمين بيانات المورد
        const transactions = await Transaction.find(query)
            .populate('supplier', 'name')  // جلب اسم المورد فقط
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalTransactions = await Transaction.countDocuments(query);
        const totalPages = Math.ceil(totalTransactions / limit);

        res.json({
            transactions,
            totalTransactions,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});


router.get('/supplier_payment', validateBranchId, async (req, res) => {
    const { branchId, startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    try {
        const query = {
            type: 'supplier_payment',
            branchId: branchId,
        };
        
        if (startDate || endDate) {
            const startOfDay = startDate ? new Date(startDate) : new Date();
            const endOfDay = endDate ? new Date(endDate) : new Date();
        
            if (!startDate) startOfDay.setHours(0, 0, 0, 0);
            if (!endDate) endOfDay.setHours(23, 59, 59, 999);
        
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const skip = (page - 1) * limit; // Calculate how many documents to skip

        // Find transactions with pagination and populate supplier data
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit)) // Limit the number of documents
            .populate('supplier', 'name'); // Populate supplier field and return only the 'name' field

        const totalTransactions = await Transaction.countDocuments(query); // Total count for pagination
        const totalPages = Math.ceil(totalTransactions / limit);

        // Include supplier information in the response
        const transactionsWithSupplier = transactions.map(transaction => ({
            ...transaction.toObject(),
            supplierName: transaction.supplier ? transaction.supplier.name : 'غير معروف',
        }));

        res.json({
            transactions: transactionsWithSupplier,
            totalTransactions,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});






// Create a transaction with a specific type (e.g., "recharge")
router.post('/customer_payment', async (req, res) => {
    const transaction = new Transaction({
        ...req.body,
        type: 'customer_payment', // Ensure type is set to "recharge" for RechargeTransaction component
    });

    try {
        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/customer_payment', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        // Set the date range based on the provided startDate and endDate, or use today's date range by default
        const startOfDay = startDate ? new Date(startDate) : new Date();
        const endOfDay = endDate ? new Date(endDate) : new Date();

        // Default to the start and end of the current day if no date filters are provided
        if (!startDate) startOfDay.setHours(0, 0, 0, 0);
        if (!endDate) endOfDay.setHours(23, 59, 59, 999);

        const query = {
            type: 'customer_payment',
            date: { $gte: startOfDay, $lte: endOfDay },
        };

        // Return all transactions for the given date range
        const transactions = await Transaction.find(query).sort({ date: -1 });
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});


   
     
  
router.post('/purchasing', validateBranchId, async (req, res) => {
    const { branchId, description, amount, user, type, date, supplier } = req.body;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    try {
        // إذا كان المورد موجودًا في الطلب، تحقق من وجوده في قاعدة البيانات
        if (supplier && supplier.name) {
            // حاول العثور على المورد في قاعدة البيانات
            let existingSupplier = await Supplier.findOne({ name: supplier.name });

            if (!existingSupplier) {
                // إذا لم يكن المورد موجودًا، قم بإنشائه
                existingSupplier = new Supplier({
                    name: supplier.name,
                    phoneNumber: supplier.phoneNumber,
                    company: supplier.company,
                    notes: supplier.notes,
                    moneyOwed: supplier.moneyOwed || 0,
                });
            }

            // تحديث المبلغ المستحق للمورد بطرح المبلغ المدفوع
            existingSupplier.moneyOwed = Math.max(0, existingSupplier.moneyOwed - amount);

            // حفظ المورد بعد التحديث
            await existingSupplier.save();

            // قم بتعيين supplierId إلى معرف المورد الموجود أو الجديد
            supplierId = existingSupplier._id;
        }

        // إنشاء المعاملة باستخدام supplierId
        const transaction = new Transaction({
            description,
            amount,
            user,
            type: 'purchasing',
            branchId,
            date,
            supplier: supplierId, // قم بتمرير supplierId هنا
        });

        // حفظ المعاملة
        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});




router.get('/daypurchasing', validateBranchId, async (req, res) => {
    const { branchId, startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    try {
        const startOfDay = startDate ? new Date(startDate) : new Date();
        const endOfDay = endDate ? new Date(endDate) : new Date();

        if (!startDate) startOfDay.setHours(0, 0, 0, 0);
        if (!endDate) endOfDay.setHours(23, 59, 59, 999);

        const query = {
            type: 'purchasing',
            branchId: branchId,
            date: { $gte: startOfDay, $lte: endOfDay },
        };

        const skip = (page - 1) * limit;

        // العثور على المعاملات مع تضمين بيانات المورد
        const transactions = await Transaction.find(query)
            .populate('supplier', 'name')  // جلب اسم المورد فقط
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalTransactions = await Transaction.countDocuments(query);
        const totalPages = Math.ceil(totalTransactions / limit);

        res.json({
            transactions,
            totalTransactions,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});


router.get('/purchasing', validateBranchId, async (req, res) => {
    const { branchId, startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }

    try {
        const query = {
            type: 'purchasing',
            branchId: branchId,
        };
        
        if (startDate || endDate) {
            const startOfDay = startDate ? new Date(startDate) : new Date();
            const endOfDay = endDate ? new Date(endDate) : new Date();
        
            if (!startDate) startOfDay.setHours(0, 0, 0, 0);
            if (!endDate) endOfDay.setHours(23, 59, 59, 999);
        
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const skip = (page - 1) * limit; // Calculate how many documents to skip

        // Find transactions with pagination and populate supplier data
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit)) // Limit the number of documents
            .populate('supplier', 'name'); // Populate supplier field and return only the 'name' field

        const totalTransactions = await Transaction.countDocuments(query); // Total count for pagination
        const totalPages = Math.ceil(totalTransactions / limit);

        // Include supplier information in the response
        const transactionsWithSupplier = transactions.map(transaction => ({
            ...transaction.toObject(),
            supplierName: transaction.supplier ? transaction.supplier.name : 'غير معروف',
        }));

        res.json({
            transactions: transactionsWithSupplier,
            totalTransactions,
            totalPages,
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});






// Create a transaction with a specific type (e.g., "recharge")
router.post('/returns', async (req, res) => {
    const transaction = new Transaction({
        ...req.body,
        type: 'returns', // Ensure type is set to "recharge" for RechargeTransaction component
    });

    try {
        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/returns', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        // Set the date range based on the provided startDate and endDate, or use today's date range by default
        const startOfDay = startDate ? new Date(startDate) : new Date();
        const endOfDay = endDate ? new Date(endDate) : new Date();

        // Default to the start and end of the current day if no date filters are provided
        if (!startDate) startOfDay.setHours(0, 0, 0, 0);
        if (!endDate) endOfDay.setHours(23, 59, 59, 999);

        const query = {
            type: 'returns',
            date: { $gte: startOfDay, $lte: endOfDay },
        };

        // Return all transactions for the given date range
        const transactions = await Transaction.find(query).sort({ date: -1 });
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});

// Create a transaction with a specific type (e.g., "recharge")
router.post('/output_staff', async (req, res) => {
    const { user, description, amount, branch, date } = req.body;

    try {
        // التحقق من وجود المستخدم
        const existingUser = await User.findById(user);
        if (!existingUser) {
            return res.status(404).json({ error: 'الموظف غير موجود' });
        }

        // التحقق من صحة الراتب
        if (existingUser.salary < amount) {
            return res.status(400).json({ error: 'لا يوجد راتب كافٍ لهذه العملية' });
        }

        // طرح المبلغ من الراتب
        existingUser.salary -= amount;
        await existingUser.save();

        // إنشاء المعاملة
        const transaction = new Transaction({
            user,
            description,
            amount,
            branch,
            date,
            type: 'output_staff', // تعيين نوع العملية
        });

        // حفظ المعاملة في قاعدة البيانات
        const savedTransaction = await transaction.save();

        // إرجاع الاستجابة مع المعاملة المحفوظة
        res.status(201).json(savedTransaction);
    } catch (error) {
        console.error('Error during transaction:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب' });
    }
});

router.get('/output_staff', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        // Set the date range based on the provided startDate and endDate, or use today's date range by default
        const startOfDay = startDate ? new Date(startDate) : new Date();
        const endOfDay = endDate ? new Date(endDate) : new Date();

        // Default to the start and end of the current day if no date filters are provided
        if (!startDate) startOfDay.setHours(0, 0, 0, 0);
        if (!endDate) endOfDay.setHours(23, 59, 59, 999);

        const query = {
            type: 'output_staff',
            date: { $gte: startOfDay, $lte: endOfDay },
        };

        // Return all transactions for the given date range
        const transactions = await Transaction.find(query).sort({ date: -1 });
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});

// Create a transaction with a specific type (e.g., "recharge")
router.post('/warranty', async (req, res) => {
    const transaction = new Transaction({
        ...req.body,
        type: 'warranty', // Ensure type is set to "recharge" for RechargeTransaction component
    });

    try {
        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/warranty', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        // Set the date range based on the provided startDate and endDate, or use today's date range by default
        const startOfDay = startDate ? new Date(startDate) : new Date();
        const endOfDay = endDate ? new Date(endDate) : new Date();

        // Default to the start and end of the current day if no date filters are provided
        if (!startDate) startOfDay.setHours(0, 0, 0, 0);
        if (!endDate) endOfDay.setHours(23, 59, 59, 999);

        const query = {
            type: 'warranty',
            date: { $gte: startOfDay, $lte: endOfDay },
        };

        // Return all transactions for the given date range
        const transactions = await Transaction.find(query).sort({ date: -1 });
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve transactions: " + error.message });
    }
});




module.exports = router;
