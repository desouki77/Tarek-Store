// backend/routes/clientRoutes.js
const express = require('express');
const Client = require('../models/Client');

const router = express.Router();

// Add or update client based on phoneNumber
router.post('/add', async (req, res) => {
    try {
        const { name, phoneNumber, amountRequired } = req.body;

        // تحويل المبلغ المتبقي إلى قيمة موجبة إذا كان سالبًا
        const validAmountRequired = Math.abs(amountRequired);

        // البحث عن العميل الحالي باستخدام رقم الهاتف
        let client = await Client.findOne({ phoneNumber });

        if (client) {
            return res.status(400).json({ message: 'رقم الموبايل موجود بالفعل' });
        } else {
            // إذا لم يكن العميل موجودًا، أضف عميل جديد
            client = new Client({ name, phoneNumber, amountRequired: validAmountRequired });
            await client.save();
            return res.status(201).json({ message: 'تم إضافة العميل بنجاح' });
        }
    } catch (error) {
        console.error('خطأ في إضافة أو تحديث العميل', error);
        res.status(500).json({ error: 'خطأ في إضافة أو تحديث العميل' });
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

// مسار البحث عن عميل باستخدام رقم الهاتف
router.get('/:phone', async (req, res) => {
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
            phoneNumber: client.phoneNumber,
        });
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء جلب بيانات العميل' });
    }
});

module.exports = router;
