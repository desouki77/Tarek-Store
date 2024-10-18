// backend/routes/userRoutes.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateJWT  = require('../middlewares/userAuth');


// Register a new user
router.post('/register', async (req, res) => {
    const { username, password, role, branch } = req.body;

    try {

        // Check if the user already exists in the database
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'المستخدم موجود بالفعل' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ username, password: hashedPassword, role, branch });
        await newUser.save();

        // Generate JWT
        const token = jwt.sign({ id: newUser._id, username: newUser.username }, 'your_secret_key', { expiresIn: '1h' });

        res.status(201).json({ message: 'تم تسجيل المستخدم بنجاح', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// User login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
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

        // Generate JWT
        const token = jwt.sign({ id: user._id, username: user.username }, 'your_secret_key', { expiresIn: '1h' });

        // If successful, you can create a token or return user data
        res.status(200).json({ message: 'تم تسجيل الدخول بنجاح', token , user: { id: user._id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Your routes here >>>>
router.get('/protected-route', authenticateJWT, (req, res) => {
    res.status(200).json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
