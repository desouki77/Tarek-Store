const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const products = require('./routes/products');
const order = require('./routes/order');


dotenv.config();  // Load environment variables from .env file

const app = express();

// Middleware
app.use(express.json());  // To parse JSON requests
app.use(cors());          // Enable CORS for frontend requests

// Connect Databas
connectDB();


// Sample Route
app.get('/', (req, res) => {
    res.send('مرحبا بك في تطبيق الطارق باك اند');
});

// Use Routes
app.use('/api/users', userRoutes);

// Tranactions Routes
app.use('/api/transactions', transactionRoutes);

// Products Routes
app.use('/api/products', products);

// Order Routes
app.use('/api' , order);

const branchRoutes = require('./routes/branchRoutes'); // Adjust the path
app.use('/api/branches', branchRoutes);





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
