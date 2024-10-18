const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');


dotenv.config();  // Load environment variables from .env file

const app = express();

// Middleware
app.use(express.json());  // To parse JSON requests
app.use(cors());          // Enable CORS for frontend requests

// Connect Databas
connectDB();



// Sample Route
app.get('/', (req, res) => {
    res.send('مرحباً بك في تطبيق الطارق');
});

// Use routes
app.use('/api/users', userRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
