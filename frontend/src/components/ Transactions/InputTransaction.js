import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/InputTransaction.css"

const InputTransaction = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');
  const branchId = localStorage.getItem('branchId');
  const role = localStorage.getItem('role');
  const type = localStorage.getItem('transactionType');
  const isAdmin = role === 'admin';

  console.log('User ID:', userId);
  console.log('Branch ID:', branchId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !branchId) {
      console.error("User ID or branch ID is not set in localStorage");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/transactions', {
        user: userId,
        type: type,
        description,
        amount: parseFloat(amount),
        branch: branchId,
        date: new Date(),
      });

      setTransactions([response.data, ...transactions]);
      setDescription('');
      setAmount('');
    } catch (error) {
      console.error("Error adding transaction:", error.response ? error.response.data : error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
  
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
  
      try {
        const response = await axios.get('http://localhost:5000/api/transactions/input', {
          params: {
            page: currentPage,
            limit: 5,
            type: 'input',
            date: today,  // Pass the current date as a parameter
          },
        });
  
        setTransactions(response.data.transactions);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTransactions();
  }, [currentPage]);

  const goToAllTransactions = () => {
    navigate('/all-transactions');
  };

  return (
    <>
      <Navbar isAdmin={isAdmin} />
    
      <div className='input-transaction'>
        <h2>مدخلات</h2>
        <form className="transaction-form" onSubmit={handleSubmit}>
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
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'إضافة'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        <h3>المعاملات اليوم</h3>
        <table className="transaction-table">
          <thead>
            <tr>
              <th>الوصف</th>
              <th>المبلغ</th>
              <th>التاريخ</th>
              <th>الوقت</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4">Loading...</td></tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{transaction.description}</td>
                  <td>{transaction.amount}</td>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>{new Date(transaction.date).toLocaleTimeString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination-buttons">
          <button 
            className="pagination-button" 
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1 || isLoading}
          >
            السابق
          </button>
          <button 
            className="pagination-button" 
            onClick={() => setCurrentPage((prev) => prev + 1)} 
            disabled={currentPage === totalPages || isLoading}
          >
            التالي
          </button>
        </div>

        <button className="all-transactions-button" onClick={goToAllTransactions}>
          عرض الكل
        </button>
      </div>
    </>
  );
};

export default InputTransaction;
