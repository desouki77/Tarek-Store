import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import '../../styles/AllTransactions.css';

const AllTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const role = localStorage.getItem('role');
    const branchId = localStorage.getItem('branchId');
    const transactionType = localStorage.getItem('transactionType'); // Dynamically fetch the type
    const isAdmin = role === 'admin';

    useEffect(() => {
        const fetchAllTransactions = async () => {
            if (!branchId) {
                setError('Branch ID is missing.');
                return;
            }

            if (!transactionType) {
                setError('Transaction type is missing.');
                return;
            }

            try {
                let url = `http://localhost:5000/api/transactions/${transactionType}?branchId=${branchId}`;
                if (startDate) url += `&startDate=${startDate}`;
                if (endDate) url += `&endDate=${endDate}`;

                const response = await axios.get(url);
                if (response.data.transactions.length === 0) {
                    setTransactions([]);
                    setError('No transactions found for the selected date range.');
                } else {
                    setTransactions(response.data.transactions);
                    setError('');
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setError('Failed to retrieve transactions. Please try again.');
                setTransactions([]);
            }
        };

        fetchAllTransactions();
    }, [startDate, endDate, branchId, transactionType]);

    return (
        <>
            <Navbar isAdmin={isAdmin} />
            <div className="alltransaction-container">
                <h2 className="alltransaction-title">كل المعاملات - {transactionType}</h2>

                {error && <p className="alltransaction-error">{error}</p>}

                <div className="alltransaction-date-filter">
                    <label className="alltransaction-label">تاريخ البداية:</label>
                    <input
                        className="alltransaction-input"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <label className="alltransaction-label">تاريخ النهاية:</label>
                    <input
                        className="alltransaction-input"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                {transactions.length > 0 ? (
                    <table className="alltransaction-table">
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
                ) : (
                    !error && <p className="alltransaction-no-data">لا توجد معاملات لعرضها.</p>
                )}
            </div>
        </>
    );
};

export default AllTransactions;
