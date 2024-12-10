import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import '../../styles/AllTransactions.css';

const AllTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // Current page state
    const [totalPages, setTotalPages] = useState(1); // Total pages
    const role = localStorage.getItem('role');
    const branchId = localStorage.getItem('branchId');
    const transactionType = localStorage.getItem('transactionType'); // Dynamically fetch the type
    const isAdmin = role === 'admin';
    const limit = 10; // Limit for transactions per page

    const fetchUserData = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
            return response.data.username;
        } catch (error) {
            console.error("Error fetching user data:", error);
            return 'غير معروف'; // Default if user data fetch fails
        }
    };

    const fetchAllTransactions = async (page = 1) => {
        if (!branchId) {
            setError('Branch ID is missing.');
            return;
        }

        if (!transactionType) {
            setError('Transaction type is missing.');
            return;
        }

        setLoading(true); // Start loading
        try {
            let url = `http://localhost:5000/api/transactions/${transactionType}?branchId=${branchId}&page=${page}&limit=${limit}`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;

            const response = await axios.get(url);

            if (response.data.transactions.length === 0 && page === 1) {
                setTransactions([]);
                setTotalPages(1);
                setError('');
            } else {
                const transactionsWithUserData = await Promise.all(
                    response.data.transactions.map(async (transaction) => {
                        const userName = await fetchUserData(transaction.user);
                        return { ...transaction, userName };
                    })
                );

                setTransactions(transactionsWithUserData);
                setTotalPages(response.data.totalPages || 1); // Update total pages from API
                setError('');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setError('Failed to retrieve transactions. Please try again.');
            setTransactions([]);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    useEffect(() => {
        fetchAllTransactions(currentPage);
    }, [startDate, endDate, currentPage]); // Reload when currentPage changes

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

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

                {loading ? (
                    <p className="alltransaction-loading">يتم تحميل المعاملات...</p>
                ) : transactions.length > 0 ? (
                    <>
                        <table className="alltransaction-table">
                            <thead>
                                <tr>
                                    <th>الوصف</th>
                                    <th>المبلغ</th>
                                    <th>التاريخ</th>
                                    <th>الوقت</th>
                                    <th>المستخدم</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction._id}>
                                        <td>{transaction.description}</td>
                                        <td>{transaction.amount}</td>
                                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                                        <td>{new Date(transaction.date).toLocaleTimeString()}</td>
                                        <td>{transaction.userName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-button"
                            >
                                السابق
                            </button>
                            <span className="pagination-info">
                                صفحة {currentPage} من {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="pagination-button"
                            >
                                التالي
                            </button>
                        </div>
                    </>
                ) : (
                    !error && <p className="alltransaction-no-data">لا توجد معاملات لعرضها.</p>
                )}
            </div>
        </>
    );
};

export default AllTransactions;
