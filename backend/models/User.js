// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'sales'], // Define roles
        required: true,
    },
    phone:{
        type: String,
        required: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch', // Reference to the Branch model
        required: false, // This could be optional if some users are not assigned to a branch
    },
    salary: {
        type: Number,
        required: false,
        default: 0, // Default salary if not provided
    }
    
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
