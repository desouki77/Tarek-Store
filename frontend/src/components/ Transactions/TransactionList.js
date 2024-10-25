import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../../styles/TransactionList.css';

const TransactionList = () => {
    const { type } = useParams(); // Get the transaction type from the URL
    const [transactions, setTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        // Fetch transactions of the given type
        const fetchTransactions = async () => {
            try {
                const res = await axios.get(`/api/transactions?type=${type}&page=${currentPage}`);
                setTransactions(res.data.transactions);
                setTotalPages(res.data.totalPages);
            } catch (err) {
                console.error('Error fetching transactions:', err);
            }
        };

        fetchTransactions();
    }, [type, currentPage]);

    return (
        <div className="transaction-list">
            <table className="transaction-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Client/Supplier</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction._id}>
                            <td>{new Date(transaction.date).toLocaleDateString()}</td>
                            <td>{transaction.amount}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.client?.name || transaction.supplier?.name || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button 
                        key={i} 
                        className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TransactionList;
