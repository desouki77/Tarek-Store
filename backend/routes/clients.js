// backend/routes/clientRoutes.js
const express = require('express');
const Client = require('../models/Client');

const router = express.Router();

// Add a new client
router.post('/add', async (req, res) => {
    try {
        const { name, phoneNumber, notes } = req.body;
        const newClient = new Client({ name, phoneNumber, notes });
        await newClient.save();
        res.status(201).json({ message: 'تم اضافة العميل بنجاح' });
    } catch (error) {
        console.error('خطأ في اضافة العميل', error);
        res.status(500).json({ error: 'خطأ في اضافة العميل' });
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

module.exports = router;
