// Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Dashboard.css'

function Dashboard() {
    const role = localStorage.getItem('role'); // Get role from localStorage
    const isAdmin = role === 'admin'; // Determine if the user is an admin
    const navigate = useNavigate(); // useNavigate hook for navigation

    // Handler to navigate to specific transaction pages
    const handleTransactionClick = (transactionType) => {
        navigate(`/transactions/${transactionType}`);
    };

    return ( 
        <>
          <Navbar isAdmin={isAdmin} /> {/* Pass isAdmin to Navbar */}
        <div className="dashboard-container">
            <h1 className="dashboard-title">المعاملات</h1>

            {/* Buttons for different transaction types */}
            <div className="transaction-buttons">
                <button className="transaction-button" onClick={() => handleTransactionClick('selling')}>بيع</button>
                <button className="transaction-button" onClick={() => handleTransactionClick('input')}>مدخلات</button>
                <button className="transaction-button" onClick={() => handleTransactionClick('output')}>مخرجات</button>
                <button className="transaction-button" onClick={() => handleTransactionClick('recharge')}>شحن</button>
                <button className="transaction-button" onClick={() => handleTransactionClick('maintenance')}>صيانة</button>
                <button className="transaction-button" onClick={() => handleTransactionClick('customer_payment')}> سداد عملاء</button>
                <button className="transaction-button" onClick={() => handleTransactionClick('supplier_payment')}> سداد موردين</button>
                <button className="transaction-button" onClick={() => handleTransactionClick('purchasing')}> مشتروات</button>
                <button className="transaction-button" onClick={() => handleTransactionClick('returns')}> مرتجعات</button>
            </div>

            {isAdmin && ( // Check if the user is an admin
                <div className="admin-controls">
                
                </div>
            )}
            {role === 'sales' && ( // Check if the user is a sales role
                <div className="sales-dashboard">
                 
                </div>
            )}
        </div>
        </>
    );
}

export default Dashboard;
