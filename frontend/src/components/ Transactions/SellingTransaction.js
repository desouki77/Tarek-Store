// components/SellingTransaction.js
import React, { useState } from 'react';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList'; // Assuming you have a TransactionList component
import Navbar from '../Navbar';

const SellingTransaction = () => {

    const role = localStorage.getItem('role'); // Get role from localStorage
    const isAdmin = role === 'admin'; // Determine if the user is an admin
    
    const [showForm, setShowForm] = useState(false); // State to toggle form visibility

    const handleNewTransactionClick = () => {
        setShowForm(!showForm); // Toggle form visibility
    };

    return (
        <div>
                        <Navbar isAdmin={isAdmin} /> {/* Pass isAdmin to Navbar */}

            <h2>معاملات بيع</h2>
 

            <TransactionList transactionType="selling" /> {/* Pass the transaction type to list */}

            <button onClick={handleNewTransactionClick} className="new-transaction-button">
                {showForm ? "إخفاء نموذج المعاملة الجديدة" : "نموذج معاملة جديدة"}
            </button>
            
            {showForm && <TransactionForm />} {/* Conditionally render TransactionForm */}
        </div>
    );
};

export default SellingTransaction;
