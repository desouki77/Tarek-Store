// backend/routes/clientRoutes.js
const express = require('express');
const Client = require('../models/Client');
const mongoose = require('mongoose'); // Add this line at the top

const router = express.Router();

// routes/clients.js
router.post('/add', async (req, res) => {
    try {
        const { name, phoneNumber, amountRequired } = req.body;
        const validAmountRequired = Math.abs(amountRequired);

        // Check if client exists
        let client = await Client.findOne({ phoneNumber });

        if (client) {
            // Update existing client's amountRequired by adding the new amount
            client.amountRequired += validAmountRequired;
            await client.save();
            return res.json({ 
                message: 'تم تحديث المبلغ المتبقي للعميل بنجاح',
                client 
            });
        } else {
            // Create new client
            client = new Client({ 
                name, 
                phoneNumber, 
                amountRequired: validAmountRequired 
            });
            await client.save();
            return res.status(201).json({ 
                message: 'تم إضافة العميل بنجاح',
                client 
            });
        }
    } catch (error) {
        console.error('Error in client add/update:', error);
        res.status(500).json({ 
            error: 'حدث خطأ أثناء معالجة العميل' 
        });
    }
});

// Get a paginated list of clients
router.get('/', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const clients = await Client.find()
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 }); // Sort by creation date
        const totalClients = await Client.countDocuments();

        res.status(200).json({
            clients,
            currentPage: Number(page),
            totalPages: Math.ceil(totalClients / limit),
        });
    } catch (error) {
        console.error('خطأ في استراجع العملاء', error);
        res.status(500).json({ error: 'خطأ في استرجاع العملاء' });
    }
});

// Get clients who owe money (amountRequired > 0)
router.get('/with-debt', async (req, res) => {
    try {
        const clientsWithDebt = await Client.find({ amountRequired: { $gt: 0 } }).sort({ createdAt: -1 });
        res.status(200).json({ clients: clientsWithDebt });
    } catch (error) {
        console.error('Error fetching clients with debt:', error);
        res.status(500).json({ error: 'فشل في استرجاع العملاء المدينين' });
    }
});


// Get total amount required from all clients
router.get('/total-amount', async (req, res) => {
    try {
        const result = await Client.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amountRequired" }
                }
            }
        ]);
        const totalAmount = result[0]?.totalAmount || 0;
        res.status(200).json({ totalAmount });
    } catch (error) {
        console.error('Error calculating total amount', error);
        res.status(500).json({ error: 'Error calculating total amount' });
    }
});


// Update client's amountRequired
router.put('/dec-amount', async (req, res) => {
    try {
        const { clientId, amountPaid } = req.body;
        
        // Validate input
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ success: false, message: 'Invalid client ID format' });
        }

        console.log('Updating client with ID:', clientId, 'Amount paid:', amountPaid);
        
        const client = await Client.findById(clientId);
        if (!client) {
            console.log('Client not found with ID:', clientId);
            return res.status(404).json({ success: false, message: 'Client not found' });
        }
        
        console.log('Current amountRequired:', client.amountRequired);
        client.amountRequired = Math.max(0, client.amountRequired - amountPaid);
        await client.save();
        
        console.log('Updated amountRequired:', client.amountRequired);
        res.json({ 
            success: true,
            message: 'Client amount updated successfully', 
            client 
        });
    } catch (error) {
        console.error('Error updating client amount:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating client amount', 
            error: error.message 
        });
    }
});

// Delete a client by ID
router.delete('/:id', async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) {
            return res.status(404).json({ error: 'العميل غير موجود' });
        }
        res.status(200).json({ message: 'تم مسح العميل بنجاح' });
    } catch (error) {
        console.error('خطأ في مسح العميل', error);
        res.status(500).json({ error: 'خطأ في مسح العميل' });
    }
});

// Put this route BEFORE the '/:phone' route
router.get('/id/:id', async (req, res) => {
    try {
        const clientId = req.params.id;
        console.log('Fetching client with ID:', clientId);
        
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID format' });
        }

        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        res.json({ 
            success: true,
            client: {
                _id: client._id,
                name: client.name,
                amountRequired: client.amountRequired,
                phoneNumber: client.phoneNumber
            }
        });
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching client', 
            error: error.message 
        });
    }
});

// مسار البحث عن عميل باستخدام رقم الهاتف
router.get('/phone/:phone', async (req, res) => {
    const { phone } = req.params;

    try {
        // البحث عن العميل في قاعدة البيانات
        const client = await Client.findOne({ phoneNumber: phone });

        if (!client) {
            return res.status(404).json({ message: 'العميل غير موجود' });
        }

        // إذا تم العثور على العميل، أعد بياناته
        res.json({
            name: client.name,
            amountRequired: client.amountRequired, 
        });
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء جلب بيانات العميل' });
    }
});

router.put('/inc-amount', async (req, res) => {
    const { clientPhone, remainingAmount } = req.body;

    if (!clientPhone || !remainingAmount) {
        return res.status(400).json({ message: "الرجاء توفير رقم الهاتف والمبلغ المتبقي" });
    }

    try {
        const client = await Client.findOne({ phoneNumber: clientPhone });

        if (!client) {
            return res.status(404).json({ message: "العميل غير موجود" });
        }

        // إضافة المبلغ المتبقي إلى المبلغ المطلوب
        client.amountRequired += remainingAmount;

        // حفظ التحديث في قاعدة البيانات
        await client.save();

        return res.status(200).json({ message: "تم تحديث المبلغ بنجاح", client });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "حدث خطأ أثناء التحديث" });
    }
});



module.exports = router;


