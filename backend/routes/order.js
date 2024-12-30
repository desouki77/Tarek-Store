const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Assuming you have an Order model
const validateBranchId = require('../middlewares/validateBranch');
const { getTopSellingProducts } = require('../controllers/orderController'); // تأكد من المسار الصحيح


// POST /orders - Create a new order, including branchId
router.post('/orders', validateBranchId, async (req, res) => {
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

// GET /orders - Fetch all orders for a specific branchId with optional date filter and pagination
router.get('/orders', validateBranchId, async (req, res) => {
    try {
        const { branchId, startDate, endDate, page = 1, limit = 20 } = req.query;

        if (!branchId) {
            return res.status(400).json({ message: 'branchId is required' });
        }

        // Construct the filter object
        let filter = { branchId };

        // Add date range filter if provided
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(new Date(startDate).toISOString()), // Start of day in UTC
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString() // End of day in UTC
            };
        } else if (startDate) {
            filter.createdAt = { $gte: new Date(new Date(startDate).toISOString()) };
        } else if (endDate) {
            filter.createdAt = { $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString() };
        }

        const sortOrder = startDate || endDate ? 1 : -1; // Ascending if date filters exist, descending otherwise


        // Calculate the skip value for pagination
        const skip = (page - 1) * limit;

        // Fetch orders with pagination and sorting
        const orders = await Order.find(filter)
            .skip(skip)       // Skip the correct number of orders based on the page
            .limit(parseInt(limit))  // Limit the number of results per page
            .sort({ createdAt: sortOrder }); // Sort by createdAt in descending order

        // Get total number of orders to calculate total pages
        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);

        // Return the paginated results
        res.json({
            orders,
          
                totalOrders,
                totalPages,
                currentPage: parseInt(page),
                pageSize: parseInt(limit),
            
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/day_orders', validateBranchId, async (req, res) => {
    try {
        const { branchId, startDate, endDate, limit = 10, page = 1 } = req.query;

        if (!branchId) {
            return res.status(400).json({ message: 'branchId is required' });
        }

        // Construct the filter object
        let filter = { branchId };

        // Add date range filter if provided
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(new Date(startDate).toISOString()), // Start of day in UTC
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString() // End of day in UTC
            };
        } else if (startDate) {
            filter.createdAt = { $gte: new Date(new Date(startDate).toISOString()) };
        } else if (endDate) {
            filter.createdAt = { $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString() };
        }

        const parsedLimit = parseInt(limit);
        const parsedPage = parseInt(page);

        // Fetch paginated orders
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip((parsedPage - 1) * parsedLimit)
            .limit(parsedLimit);

        // Count total orders for pagination metadata
        const totalOrders = await Order.countDocuments(filter);

        res.json({
            orders,
            totalOrders,
            totalPages: Math.ceil(totalOrders / parsedLimit),
            currentPage: parsedPage,
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// GET /orders/:orderId - Get a specific order by ID, with branchId check
router.get('/orders/:orderId', validateBranchId, async (req, res) => {
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


router.get('/sales-report', async (req, res) => {
    try {
        const { branchId, startDate, endDate } = req.query;

        let filter = {};

        if (branchId) {
            filter.branchId = branchId;
        }

        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(new Date(startDate).toISOString()), // Start of day
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString() // End of day
            };
        }

        // Fetch orders based on the filter
        const orders = await Order.find(filter);

        const totalSales = orders.reduce((sum, order) => sum + order.paid, 0);
        const totalDiscounts = orders.reduce((sum, order) => sum + (order.discount || 0), 0);
        const totalItemsSold = orders.reduce((total, order) => {
            if (Array.isArray(order.checkoutItems)) {
                return total + order.checkoutItems.length;
            }
            return total;
        }, 0);

        const orderCount = orders.length;

        res.json({
            totalSales,
            totalItemsSold,
            totalDiscounts,
            orderCount,
        });
    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/top-selling-products', async (req, res) => {
    try {
        const { branchId, page = 1, limit = 10 } = req.query;  // جلب المعاملات من الاستعلام

        // حساب التخطي (skip) بناءً على الصفحة وعدد العناصر
        const skip = (page - 1) * limit;

        // جلب البيانات مع دعم pagination
        const result = await getTopSellingProducts({
            branchId,
            skip,
            limit
        });


        // إرجاع النتيجة
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching top selling products:", error);
        res.status(500).json({ message: "Error fetching top selling products", error });
    }
});








module.exports = router;
