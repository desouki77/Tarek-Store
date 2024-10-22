// components/TransactionList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('/api/transactions', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming you're storing token in localStorage
                    },
                });
                setTransactions(response.data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        fetchTransactions();
    }, []);

    return (
        <ul>
            {transactions.map((transaction) => (
                <li key={transaction._id}>
                    {transaction.type} - {transaction.amount} - {transaction.description}
                </li>
            ))}
        </ul>
    );
};

export default TransactionList;
