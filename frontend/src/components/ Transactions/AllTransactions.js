// components/AllTransactions.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';

const AllTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';

    useEffect(() => {
        const fetchAllTransactions = async () => {
            try {
                // Retrieve the transaction type dynamically from local storage
                const transactionType = localStorage.getItem('transactionType');
                
                // Build the URL dynamically with date filters if present
                let url = `http://localhost:5000/api/transactions/${transactionType}`;
                
                if (startDate && endDate) {
                    url += `?startDate=${startDate}&endDate=${endDate}`;
                }

                const response = await axios.get(url);
                setTransactions(response.data.transactions);
            } catch (error) {
                console.error("Error fetching all transactions:", error);
            }
        };

        fetchAllTransactions();
    }, [startDate, endDate]); // Re-run the effect when dates change

    return (
        <>
            <Navbar isAdmin={isAdmin} />
            <div>
                <h2>كل المعاملات</h2>

                {/* Date Filter Section */}
                <div className="date-filter">
                    <label>Start Date:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <label>End Date:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>الوصف</th>
                            <th>المبلغ</th>
                            <th>التاريخ</th>
                            <th>الوقت</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction._id}>
                                <td>{transaction.description}</td>
                                <td>{transaction.amount}</td>
                                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                                <td>{new Date(transaction.date).toLocaleTimeString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default AllTransactions;
