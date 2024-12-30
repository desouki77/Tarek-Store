const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

async function getTopSellingProducts({ branchId, skip = 0, limit = 10 }) {
    try {
        // تحويل الحد إلى رقم
        const limitNumber = parseInt(limit, 10);

        if (isNaN(limitNumber)) {
            throw new Error('Invalid limit value');
        }

        let filter = {};

        // تصفية حسب branchId إذا تم توفيره
        if (branchId) {
            filter.branchId = new mongoose.Types.ObjectId(branchId);
        }

        // إظهار تفاصيل الطلبات
        const orders = await Order.aggregate([
            { $match: filter },  // تصفية الطلبات بناءً على الفلاتر
            { $unwind: "$checkoutItems" },  // تفكيك مصفوفة checkoutItems
            {
                $group: {
                    _id: "$checkoutItems.barcode",  // تجميع حسب الباركود
                    totalQuantitySold: { $sum: 1 },  // حساب الكمية المباعة
                }
            },
            { $sort: { totalQuantitySold: -1 } },  // ترتيب حسب الكمية المباعة
            { $skip: skip },  // تخطي حسب الترقيم
            { $limit: limitNumber }  // تحديد الحد الأقصى للنتائج
        ]);


        // جلب تفاصيل المنتجات بناءً على الباركود
        const productDetails = await Product.find({
            barcode: { $in: orders.map(order => order._id) }  // البحث عن المنتجات باستخدام الباركود
        });


        // دمج تفاصيل المنتجات مع البيانات المسترجعة
        const result = orders.map(order => {
            const product = productDetails.find(p => p.barcode === order._id);
            return {
                barcode: order._id,
                totalQuantitySold: order.totalQuantitySold,
                name: product ? product.name : 'غير موجود',
                price: product ? product.price : 0,
            };
        });

        return result;
    } catch (error) {
        throw new Error("Error fetching top selling products: " + error.message);
    }
}

module.exports = { getTopSellingProducts };
