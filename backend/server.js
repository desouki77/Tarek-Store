const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const products = require('./routes/products');
const order = require('./routes/order');
const branch = require('./routes/branch');
const bankRoutes = require('./routes/bank');
const suppliersRoutes = require('./routes/suppliers');
const ClientsRoutes = require('./routes/clients');
const salesReport = require('./routes/salesReport');
const revenueReport = require('./routes/revenueReport');

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(express.json()); // To parse JSON requests
app.use(cors()); // Enable CORS for frontend requests

// Connect Database
connectDB();

// Sample Route
app.get('/', (req, res) => {
    res.send('مرحبا بك في تطبيق الطارق باك اند');
});

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/products', products);
app.use('/api', order);
app.use('/api/branches', branch);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/clients', ClientsRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api', salesReport);
app.use('/api', revenueReport);

// Serve static files from React app
app.use(express.static(path.join(__dirname, '/frontend/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/frontend/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
