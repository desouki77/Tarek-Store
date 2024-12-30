import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/Transactions.css";

const OutputStaff = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');
  const branchId = localStorage.getItem('branchId');
  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  const fetchUserData = async (userId) => {
    try {
      const userResponse = await axios.get(`https://tarek-store-backend.onrender.com/api/users/${userId}`);
      return userResponse.data.username;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return 'Unknown'; // Return a string directly
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!userId || !branchId) {
      console.error("User ID or branch ID is not set in localStorage");
      return;
    }

     // Check if the bank is open
     const isBankOpen = localStorage.getItem('bankOpen') === 'true';
    
     if (!isBankOpen) {
         alert('الدرج مغلق يرجي الرجوع الي الصفحة الرئيسية لفتح الدرج اولا');
         return;
     }
  
    setIsLoading(true);
    setError(null);

    const BankId = localStorage.getItem('bankID');
    if (!BankId) {
        throw new Error('Bank ID not found in localStorage');
    }

    // جلب المبلغ الحالي من البنك
    const bankResponse = await axios.get(`https://tarek-store-backend.onrender.com/api/bank/${BankId}`);
    if (!bankResponse.data || bankResponse.data.bankAmount === undefined) {
        throw new Error('Invalid bank data received');
    }
    const currentBankAmount = parseFloat(bankResponse.data.bankAmount || 0);

    if (currentBankAmount < Number(amount)) {
      setError('لا يوجد رصيد كافي في الدرج');
      setIsLoading(false);
      return;
  }
  
    try {
      const response = await axios.post('https://tarek-store-backend.onrender.com/api/transactions/output_staff', {
        user: userId,
        type: localStorage.getItem('transactionType'),
        description,
        amount: parseFloat(amount),
        branchId: branchId,
        date: new Date(),
      });
  
      const userName = await fetchUserData(response.data.user);
  
      const newTransaction = { ...response.data, userName };
      setTransactions([newTransaction, ...transactions]);
  
      setDescription('');
      setAmount('');
    } catch (error) {
      console.error("Error adding transaction:", error.response ? error.response.data : error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }

    try {
      // حساب المبلغ المحدث
      const updatedBankAmount = currentBankAmount - Number(amount);
  
      // إرسال البيانات المحدثة إلى الخادم
      const updateResponse = await axios.put(`https://tarek-store-backend.onrender.com/api/bank/${BankId}`, {
          bankAmount: updatedBankAmount,
      });
  
      console.log('Bank amount updated successfully:', updateResponse.data);
  } catch (error) {
      console.error('Error updating bank amount:', error.response?.data || error.message);
  }

  
  };
  



  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
  
      const today = new Date().toISOString().split('T')[0];
  
      try {
        const response = await axios.get('https://tarek-store-backend.onrender.com/api/transactions/output_staff', {
          params: { date: today },
        });
  
        const transactionsWithUserData = await Promise.all(
          response.data.transactions.map(async (transaction) => {
            const userName = await fetchUserData(transaction.user);
            return {
              ...transaction,
              userName,
            };
          })
        );
  
        setTransactions(transactionsWithUserData);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTransactions();
  }, []);
  

  const goToAllTransactions = () => {
    navigate('/all-transactions');
  };

  return (
    <>
      <Navbar isAdmin={isAdmin} />
    
      <div className='input-transaction'>
        <h2> مسحوبات موظفين</h2>
        <form className="input-transaction-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="الوصف"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="input-transaction-input"
          />
          <input
            type="number"
            placeholder="المبلغ"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="input-transaction-input"
          />
          <button type="submit" className="input-transaction-button">
            اضافة
          </button>
        </form>

        {error && <div className="input-transaction-error">{error}</div>}

        {isLoading ? (
          <div className="input-transaction-loading-message">جاري تحميل المعاملات...</div>
        ) : transactions.length === 0 ? (
          <div className="input-transaction-no-data-message">لا توجد معاملات اليوم.</div>
        ) : (
          <>
            <h3>المعاملات اليوم</h3>
            <table className="input-transaction-table">
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
          </>
        )}

        <button className="input-transaction-all-transactions-button" onClick={goToAllTransactions}>
          عرض الكل
        </button>
      </div>
    </>
  );
};

export default OutputStaff;
