const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const products = require('./routes/products');
const order = require('./routes/order');
const branch = require('./routes/branch'); // Adjust the path
const bank = require('./routes/bank');
const suppliersRoutes = require('./routes/suppliers');
const ClientsRoutes = require('./routes/clients');
const bankRoutes = require('./routes/bank');
const salesReport = require('./routes/salesReport');








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

// Branches Routes
app.use('/api/branches', branch);

// Suppliers Routes
app.use('/api/suppliers', suppliersRoutes);

// Client Routes
app.use('/api/clients', ClientsRoutes);

// Bank Routes
app.use('/api/bank', bankRoutes);

// Sales Report Routes
app.use('/api', salesReport);







const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
