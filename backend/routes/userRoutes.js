// backend/routes/userRoutes.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateJWT = require('../middlewares/userAuth');
const Branch = require('../models/Branch'); // Adjust the path according to your project structure



// Register a new user (without branchId)
router.post('/register', async (req, res) => {
    const { username, password, phone , role , salary} = req.body; // Removed branchId

    try {
        // Check if the user already exists in the database
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'المستخدم موجود بالفعل' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user without branchId
        const newUser = new User({ username, password: hashedPassword, phone ,role , salary});
        await newUser.save();

        // Generate JWT
        const token = jwt.sign({ id: newUser._id, username: newUser.username, role: newUser.role }, 'your_secret_key', { expiresIn: '1h' });

        res.status(201).json({ message: 'تم تسجيل المستخدم بنجاح', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// User login (with branchId)
router.post('/login', async (req, res) => {
    const { username, password, branchId } = req.body; // Added branchId
  
    try {
        // Check if branchId is valid (assuming you have a Branch model)
        const validBranch = await Branch.findById(branchId); // Make sure to import the Branch model
        if (!validBranch) {
            return res.status(400).json({ message: 'رقم الفرع غير صالح' }); // Invalid branch ID
        }
  
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'اسم المستخدم أو كلمة المرور غير صالحة' });
        }
  
        // Compare the hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'كلمة المرور غير صالحة' });
        }
  
        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role, branchId }, // Include branchId in token
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expiration
        );
  
        // Respond with user data, including branchId from the request
        res.status(200).json({
            message: 'تم تسجيل الدخول بنجاح',
            token,
            user: { id: user._id, username: user.username, role: user.role, branchId }, // Include branchId in response
        });
    } catch (error) {
        console.error('Login error:', error); // Log the error
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Fetch username by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ username: user.username });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Your routes here >>>>
router.get('/protected-route', authenticateJWT, (req, res) => {
    res.status(200).json({ message: 'This is a protected route', user: req.user });
});

// New route to get all users
router.get('/', async (req, res) => {
    try {
        // Fetch users with the 'sales' role only
        const salesUsers = await User.find({ role: 'sales' });

        // Check if no sales users were found
        if (salesUsers.length === 0) {
            return res.status(404).json({ message: 'No sales users found' });
        }

        // Send the filtered users as a response
        res.status(200).json(salesUsers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch sales users', error: error.message });
    }
});

// backend/routes/userRoutes.js
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get the user ID from the URL parameter

        // Find and delete the user by their ID
        const deletedUser = await User.findByIdAndDelete(id);

        // If no user is found, return a 404 status
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return a success message
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
});

// Update user's salary after deduction
router.put('/:id/updateSalary', async (req, res) => {
    const { id } = req.params;
    const { deduction } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Convert salary to a number and apply the deduction
        const currentSalary = parseFloat(user.salary) || 0;
        const updatedSalary = currentSalary - deduction;

        // Update the user's salary in the database
        user.salary = updatedSalary.toString();
        await user.save();

        res.status(200).json({ message: 'Salary updated successfully', updatedSalary });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update salary', error: error.message });
    }
});


module.exports = router;
