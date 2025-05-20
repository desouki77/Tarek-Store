const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Assuming you have an Order model
const validateBranchId = require('../middlewares/validateBranch');
const { getTopSellingProducts } = require('../controllers/orderController'); // تأكد من المسار الصحيح
const mongoose = require('mongoose');
const Product = require('../models/Product'); 



// Add this new route before your profit-report route
router.get('/branch-capital', async (req, res) => {
    try {
        const { branchId } = req.query;

        if (!branchId) {
            return res.status(400).json({ message: 'معرف الفرع مطلوب' });
        }

        // Calculate branch capital
        const capitalFilter = branchId !== 'all' ? { branchId } : {};
        const products = await Product.find(capitalFilter);

        const branchCapital = {
            productCount: 0,
            totalQuantity: 0,
            totalAssets: 0,
            totalProfitMargin: 0
        };

        products.forEach(product => {
            const quantity = product.quantity || 0;
            const purchasePrice = product.purchasePrice || 0;
            const sellingPrice = product.sellingPrice || 0;
            
            branchCapital.productCount += 1;
            branchCapital.totalQuantity += quantity;
            branchCapital.totalAssets += purchasePrice * quantity;
            branchCapital.totalProfitMargin += (sellingPrice - purchasePrice) * quantity;
        });

        res.json({
            branchCapital,
            message: "تم حساب رأس المال بنجاح"
        });

    } catch (error) {
        console.error('خطأ في حساب رأس المال:', error);
        res.status(500).json({ 
            message: 'حدث خطأ أثناء حساب رأس المال',
            error: error.message
        });
    }
});

router.get('/profit-report', async (req, res) => {
    try {
        const { branchId, startDate, endDate } = req.query;

        if (!branchId) {
            return res.status(400).json({ message: 'معرف الفرع مطلوب' });
        }

        // Validate dates
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'يجب تحديد تاريخ البداية والنهاية' });
        }

        // Create base date filter for orders
        const orderFilter = { 
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            }
        };

        // Add branch filter to orders if not "all"
        if (branchId !== 'all') {
            orderFilter.branchId = branchId;
        }

        // 1. Get sales data first
        const orders = await Order.find(orderFilter);

        let actualProfit = 0;
        let totalSales = 0;
        let totalItemsSold = 0;

        orders.forEach(order => {
            if (Array.isArray(order.checkoutItems)) {
                order.checkoutItems.forEach(item => {
                    const profitPerItem = (item.sellingPrice || 0) - (item.purchasePrice || 0);
                    actualProfit += profitPerItem * (item.quantity || 1);
                    totalSales += (item.sellingPrice || 0) * (item.quantity || 1);
                    totalItemsSold += item.quantity || 1;
                });
            }
        });

        // 2. Get inventory snapshot at start of period
        const inventoryFilter = {
            $or: [
                { createdAt: { $lt: new Date(startDate) } },
                { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } }
            ]
        };

        // Add branch filter to inventory if not "all"
        if (branchId !== 'all') {
            inventoryFilter.branchId = branchId;
        }

        const inventoryAtStart = await Product.find(inventoryFilter);

        // Calculate available inventory at start of period
        const totalAvailableAtStart = inventoryAtStart.reduce((sum, product) => {
            // Only include products created before the period start
            if (product.createdAt < new Date(startDate)) {
                return sum + (product.quantity || 0);
            }
            return sum;
        }, 0);

        // Calculate branch capital
        const capitalFilter = branchId !== 'all' ? { branchId } : {};
        const products = await Product.find(capitalFilter);

        const branchCapital = {
            productCount: 0,
            totalQuantity: 0,
            totalAssets: 0,
            totalProfitMargin: 0
        };

        products.forEach(product => {
            const quantity = product.quantity || 0;
            const purchasePrice = product.purchasePrice || 0;
            const sellingPrice = product.sellingPrice || 0;
            
            branchCapital.productCount += 1;
            branchCapital.totalQuantity += quantity;
            branchCapital.totalAssets += purchasePrice * quantity;
            branchCapital.totalProfitMargin += (sellingPrice - purchasePrice) * quantity;
        });

        // Calculate rates
        const profitRate = totalSales > 0 ? (actualProfit / totalSales) * 100 : 0;
        const sellThroughRate = totalAvailableAtStart > 0 
            ? (totalItemsSold / totalAvailableAtStart) * 100 
            : 0;

        res.json({
            actualProfit,
            totalSales,
            totalItemsSold,
            totalAvailableItems: totalAvailableAtStart,
            profitRate,
            sellThroughRate,
            branchCapital,
            dateRange: {
                start: startDate,
                end: endDate
            },
            message: "تم توليد التقرير بنجاح"
        });

    } catch (error) {
        console.error('خطأ في توليد تقرير الأرباح:', error);
        res.status(500).json({ 
            message: 'حدث خطأ أثناء توليد التقرير',
            error: error.message
        });
    }
});


// POST /orders - Create a new order
router.post('/orders', validateBranchId, async (req, res) => {
    try {
        const { branchId, checkoutItems, discount, paid, remaining, clientName, clientPhone, date, time } = req.body;

        if (!branchId) {
            return res.status(400).json({ message: 'branchId is required' });
        }

        // Process checkout items to ensure SN is properly formatted
        const processedItems = checkoutItems.map(item => {
            // Convert SN array to string if needed
            let snValue = item.sn;
            if (Array.isArray(item.sn)) {
                snValue = item.sn[0]; // Take the first SN if it's an array
            }
            
            return {
                barcode: item.barcode,
                name: item.name,
                sellingPrice: item.sellingPrice,
                quantity: item.quantity || 1,
                sn: snValue || null, // Ensure it's either a string or null
                purchasePrice: item.purchasePrice || 0
            };
        });

        const newOrder = new Order({
            branchId,
            checkoutItems: processedItems,
            discount: discount || 0,
            paid,
            remaining: remaining || 0,
            clientName: clientName || '',
            clientPhone: clientPhone || '',
            date,
            time,
        });

        await newOrder.save();
        res.status(201).json({ message: 'Order saved successfully!', order: newOrder });
        
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



// GET /orders/:orderId
router.get('/orders/:orderId', validateBranchId, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { branchId } = req.query;

        if (!branchId) {
            return res.status(400).json({ 
                success: false,
                message: 'branchId is required' 
            });
        }

        const order = await Order.findOne({ _id: orderId, branchId })
                              .lean(); // Convert to plain object

        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found' 
            });
        }

        res.json({ 
            success: true,
            data: order 
        });
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
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
