const express = require('express');
const router = express.Router();
const Category = require('../models/Catrgory');
const mongoose = require('mongoose');
const Product = require('../models/Product'); // Add this line with other imports

// return main categories
router.get('/main', async (req, res) => {
    try {
        const mainCategories = await Category.find({ parent: null }); // Fetch categories with no parent
        res.json(mainCategories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching main categories', error: error.message });
    }
});


// return subcategories
router.get('/sub/:mainCategoryId', async (req, res) => {
    try {
        const { mainCategoryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(mainCategoryId)) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }

        const subCategories = await Category.find({ parent: mainCategoryId });
        res.json(subCategories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subcategories', error: error.message });
    }
});

// return third categories
router.get('/third/:subCategoryId', async (req, res) => {
    try {
        const { subCategoryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
            return res.status(400).json({ message: 'Invalid subcategory ID' });
        }

        const thirdCategories = await Category.find({ parent: subCategoryId });
        res.json(thirdCategories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching third-level categories', error: error.message });
    }
});

  

// Add a new category
router.post('/add', async (req, res) => {
    try {
        const { name, parent, level } = req.body;

        if (parent && !mongoose.Types.ObjectId.isValid(parent)) {
            return res.status(400).json({ message: 'Invalid parent category ID' });
        }

        const newCategory = new Category({ name, parent: parent || null, level });
        await newCategory.save();
        res.json({ message: 'Category added', category: newCategory });
    } catch (error) {
        res.status(500).json({ message: 'Error adding category', error: error.message });
    }
});

  

// Delete a category ( this endpoint will use in the future )
router.delete('/delete/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        
        // Check if this category has subcategories
        const subcategories = await Category.find({ parent: categoryId });
        
        if (subcategories.length > 0) {
            return res.status(400).json({ message: 'Cannot delete category with subcategories' });
        }

        await Category.findByIdAndDelete(categoryId);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
});




// Get stock report by category level
router.get('/stock-report/:branchId', async (req, res) => {
    try {
        const { branchId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(branchId)) {
            return res.status(400).json({ message: 'Invalid branch ID' });
        }

        const mainCategories = await Category.find({ parent: null });
        const report = await Promise.all(mainCategories.map(async (mainCat) => {
            const [mainCount, mainQuantity] = await Promise.all([
                Product.countDocuments({ mainCategory: mainCat._id, branchId }),
                getTotalQuantity(mainCat._id, 'mainCategory', branchId)
            ]);

            const subCategories = await Category.find({ parent: mainCat._id });
            const subCategoriesWithCounts = await Promise.all(subCategories.map(async (subCat) => {
                const [subCount, subQuantity] = await Promise.all([
                    Product.countDocuments({ subCategory: subCat._id, branchId }),
                    getTotalQuantity(subCat._id, 'subCategory', branchId)
                ]);

                const thirdCategories = await Category.find({ parent: subCat._id });
                const thirdCategoriesWithCounts = await Promise.all(thirdCategories.map(async (thirdCat) => {
                    const [thirdCount, thirdQuantity] = await Promise.all([
                        Product.countDocuments({ thirdCategory: thirdCat._id, branchId }),
                        getTotalQuantity(thirdCat._id, 'thirdCategory', branchId)
                    ]);
                    
                    return {
                        ...thirdCat.toObject(),
                        productCount: thirdCount,
                        totalQuantity: thirdQuantity
                    };
                }));

                return {
                    ...subCat.toObject(),
                    productCount: subCount,
                    totalQuantity: subQuantity,
                    thirdCategories: thirdCategoriesWithCounts
                };
            }));

            return {
                ...mainCat.toObject(),
                productCount: mainCount,
                totalQuantity: mainQuantity,
                subCategories: subCategoriesWithCounts
            };
        }));

        res.json(report);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error generating stock report', 
            error: error.message 
        });
    }
});

// Helper function to calculate total quantity for a category
async function getTotalQuantity(categoryId, categoryType, branchId) {
    const products = await Product.find({ 
        [categoryType]: categoryId,
        branchId 
    });
    return products.reduce((sum, product) => sum + product.quantity, 0);
}


  

module.exports = router;
