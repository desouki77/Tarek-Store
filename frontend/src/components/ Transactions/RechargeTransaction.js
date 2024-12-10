import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/Transactions.css";

const RechargeTransaction = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');
  const branchId = localStorage.getItem('branchId');
  const role = localStorage.getItem('role');
  const type = localStorage.getItem('transactionType');
  const isAdmin = role === 'admin';

  const fetchUserData = async (userId) => {
    try {
      const [userResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/${userId}`),
      ]);
      console.log("Fetched userName:", userResponse.data.username); // Log to check user data
      return { 
        userName: userResponse.data.username, 
      };
    } catch (error) {
      console.error("Error fetching user", error);
      return { userName: 'Unknown' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!userId || !branchId) {
        console.error("User ID or branch ID is not set in localStorage");
        return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
        // إرسال العملية إلى الـ API
        const response = await axios.post('http://localhost:5000/api/transactions/recharge', {
            branchId: branchId,
            user: userId,
            type: type,
            description,
            amount: parseFloat(amount),
            date: new Date(),
        });

        // استرجاع بيانات المستخدم الجديد
        const { userName } = await fetchUserData(userId);

        // تحديث حالة العمليات بالعملية الجديدة مع اسم المستخدم
        const newTransaction = { ...response.data, userName };
        setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]);

        // إعادة تعيين الحقول
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
  
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString(); // Start of today
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString(); // End of today
  
      if (!branchId) {
        console.error('Branch ID is not available.');
        setIsLoading(false);
        return;
      }
  
      try {
        const response = await axios.get('http://localhost:5000/api/transactions/recharge', {
          params: { branchId, startDate, endDate },
        });
  
        // Fetch user and branch data in parallel for all transactions
        const transactionsWithUserData = await Promise.all(
          response.data.transactions.map(async (transaction) => {
            const { userName, branchName } = await fetchUserData(transaction.user, transaction.branch);
            return { ...transaction, userName, branchName };
          })
        );

        setTransactions(transactionsWithUserData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTransactions();
  }, [branchId]);
  
  const goToAllTransactions = () => {
    navigate('/all-transactions');
  };

  return (
    <>
      <Navbar isAdmin={isAdmin} />
    
      <div className='input-transaction'>
        <h2>الشحن</h2>
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

export default RechargeTransaction;
