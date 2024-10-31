// Example Express route to save the order
const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Assuming you have an Order model

router.post('/orders', async (req, res) => {
    try {
        const orderData = req.body; // Extract order data from the request body
        const newOrder = new Order(orderData); // Create a new order instance
        await newOrder.save(); // Save the order to the database
        res.status(201).json({ message: 'Order saved successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save order', error });
    }
});


router.get('/orders', async (req, res) => {
    try {
        // Fetch all orders sorted by createdAt in descending order
        const orders = await Order.find().sort({ createdAt: -1 }); // Sort by createdAt in descending order

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// GET /api/orders/latest - Get the latest orders
router.get('/orders/latest', async (req, res) => {
    try {
        // Fetch the latest orders by sorting in descending order based on createdAt
        const latestOrders = await Order.find().sort({ createdAt: -1 }).limit(1); // Fetch the last 5 orders

        if (latestOrders.length === 0) {
            return res.status(404).json({ message: 'No orders found.' });
        }

        res.json(latestOrders);
    } catch (error) {
        console.error('Error fetching the latest orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/orders/:orderId - Get a specific order by ID
router.get('/orders/:orderId', async (req, res) => {
    console.log('Fetching order by ID:', req.params.orderId); // Add this line
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
