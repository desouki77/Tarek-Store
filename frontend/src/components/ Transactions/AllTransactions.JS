// components/AllTransactions.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AllTransactions = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchAllTransactions = async () => {
            try {
                const response = await axios.get('/api/transactions', {
                    params: { type: 'input' },
                });
                setTransactions(response.data.transactions);
            } catch (error) {
                console.error("Error fetching all transactions:", error);
            }
        };

        fetchAllTransactions();
    }, []);

    return (
        <div>
            <h2>كل المعاملات</h2>
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
    );
};

export default AllTransactions;
