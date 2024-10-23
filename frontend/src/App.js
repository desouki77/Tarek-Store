import React, { useState, useEffect } from 'react';
import {  Route, Routes, useLocation } from 'react-router-dom';
import './styles/App.css';
import Loader from './components/Loader'; // Import the Loader component

import Dashboard from './components/Dashboard';
import Login from './components/Login';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Registration from './components/Registration';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './components/Welcome';

function App() {
  const [loading, setLoading] = useState(false); // Track loading state
  const location = useLocation(); // Get the current location

  // Show the loader during page transitions
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500); // Simulate a delay for loader
    return () => clearTimeout(timer); // Cleanup the timer
  }, [location]); // Re-run effect when location changes
  
  return (
    <>
      
        {loading && <Loader />} {/* Show loader if loading is true */}
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/transactionForm" element={<TransactionForm />} />
          <Route path="/transactionList" element={<TransactionList />} />
        </Routes>
      
    </>
  );
}

export default App;
