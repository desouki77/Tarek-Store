import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import axios from 'axios';

const InputTransaction = () => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    // Retrieve user ID and branch ID from localStorage
    const userId = localStorage.getItem('userId');
    const branchId = localStorage.getItem('branchId');
    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';

    // Debugging logs to check retrieved IDs
    console.log('User ID:', userId);
    console.log('Branch ID:', branchId);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId || !branchId) {
            console.error("User ID or branch ID is not set in localStorage");
            return; // Prevent submission if userId or branchId is not set
        }

        try {
            const response = await axios.post('http://localhost:5000/api/transactions', {
                user: userId, // Use the user ID from local storage
                type: 'input',
                description,
                amount: parseFloat(amount),
                branch: branchId, // Use the branch ID from local storage
                date: new Date(),
            });

            setTransactions([response.data, ...transactions]); // Add new transaction to the top
            setDescription('');
            setAmount('');
        } catch (error) {
            console.error("Error adding transaction:", error.response ? error.response.data : error.message);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/transactions', {
                params: {
                    page: currentPage,
                    limit: 3,
                    type: 'input',
                },
            });
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [currentPage]);

    return (
        <div>
            <Navbar isAdmin={isAdmin} />
            <h2>مدخلات</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="الوصف"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="المبلغ"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
                <button type="submit">إضافة</button>
            </form>

            <h3>المعاملات اليوم</h3>
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

            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                السابق
            </button>
            <button onClick={() => setCurrentPage((prev) => prev + 1)}>
                التالي
            </button>

            <button onClick={() => window.location.href = '/all-transactions'}>
                عرض الكل
            </button>
        </div>
    );
};

export default InputTransaction;
