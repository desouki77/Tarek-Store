// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token'); // Check if token exists
    const isAuthenticated = !!token; // Convert token to boolean

    return isAuthenticated ? children : <Navigate to="/login" />; // Redirect if not authenticated
};

export default ProtectedRoute;
