import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import products from './routes/products.js';
import order from './routes/order.js';
import branch from './routes/branch.js';
import bankRoutes from './routes/bank.js';
import suppliersRoutes from './routes/suppliers.js';
import ClientsRoutes from './routes/clients.js';
import salesReport from './routes/salesReport.js';
import revenueReport from './routes/revenueReport.js';



dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(express.json()); // To parse JSON requests
app.use(cors()); // Enable CORS for frontend requests

// Connect Database
connectDB();

// Set up the __dirname equivalent in ES Modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);


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
