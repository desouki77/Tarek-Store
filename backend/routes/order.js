const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Assuming you have an Order model
const Branch = require('../models/Branch'); 
const validateBranchId = require('../middlewares/validateBranch');



// POST /orders - Create a new order, including branchId
router.post('/orders',validateBranchId, async (req, res) => {
    try {
        const { branchId, checkoutItems, discount, paid, remaining, clientName, clientPhone, date, time } = req.body;

        if (!branchId) {
            return res.status(400).json({ message: 'branchId is required' });
        }

        const newOrder = new Order({
            branchId,
            checkoutItems,
            discount,
            paid,
            remaining,
            clientName,
            clientPhone,
            date,
            time,
        });

        await newOrder.save();
        res.status(201).json({ message: 'Order saved successfully!' });
    } catch (error) {
        console.error('Failed to save order:', error);
        res.status(500).json({ message: 'Failed to save order', error });
    }
});


// GET /orders - Fetch all orders for a specific branchId
router.get('/orders', validateBranchId, async (req, res) => {
    try {
        const { branchId } = req.query;

        if (!branchId) {
            return res.status(400).json({ message: 'branchId is required' });
        }

        // Fetch all orders for the specified branchID, sorted by createdAt in descending order
        const orders = await Order.find({ branchId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// GET /orders/:orderId - Get a specific order by ID, with branchId check
router.get('/orders/:orderId',validateBranchId, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { branchId } = req.query;

        if (!branchId) {
            return res.status(400).json({ message: 'branchId is required' });
        }

        // Fetch the order by ID and verify it belongs to the specified branchId
        const order = await Order.findOne({ _id: orderId, branchId });

        if (!order) {
            return res.status(404).json({ message: 'Order not found for this branchID' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
