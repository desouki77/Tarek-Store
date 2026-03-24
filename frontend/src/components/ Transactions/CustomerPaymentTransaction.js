import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/Transactions.css";

const CustomerPaymentTransaction = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const branchId = localStorage.getItem('branchId');
  const role = localStorage.getItem('role');
  const type = localStorage.getItem('transactionType');
  const isAdmin = role === 'admin';
  const API_URL = process.env.REACT_APP_API_URL;

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [paymentType, setPaymentType] = useState('full');
  const [partialAmount, setPartialAmount] = useState(0);
  const [moneyOwed, setMoneyOwed] = useState(0);

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`http://localhost:4321/api/clients/with-debt`, {
          params: {
            page: 1,
            limit: 100 // or whatever number you need
          }
        });
        if (response.data.clients && Array.isArray(response.data.clients)) {
          setClients(response.data.clients);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError('Failed to load clients list');
      }
    };
    fetchClients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  const fetchUserData = useCallback(async (userId) => {
    try {
      const userResponse = await axios.get(`http://localhost:4321/api/users/${userId}`);
      return { userName: userResponse.data.username };
    } catch (error) {
      console.error("Error fetching user", error);
      return { userName: 'Unknown' };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  const fetchTransactions = useCallback(async (page) => {
    setIsLoading(true);
    setError(null);

    const today = new Date();
    const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    try {
      const response = await axios.get(`http://localhost:4321/api/transactions/daycustomer_payment`, {
        params: { branchId, startDate, endDate, page, limit: 5 },
      });

      const transactionsWithUserData = await Promise.all(
        response.data.transactions.map(async (transaction) => {
          const { userName } = await fetchUserData(transaction.user);
          return {
            ...transaction,
            userName,
            clientName: transaction.client?.name || 'غير متوفر',
          };
        })
      );

      setTransactions(transactionsWithUserData);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL, branchId, fetchUserData]);

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [fetchTransactions, currentPage]);

  const handleClientChange = async (e) => {
    const clientId = e.target.value;
    setSelectedClient(clientId);
    setMoneyOwed(0);
    setError(null); // Reset error state
  
    if (!clientId) return;
  
    setIsLoadingClients(true);
    try {
        console.log('Attempting to fetch client with ID:', clientId); // Debug log
        const response = await axios.get(`http://localhost:4321/api/clients/id/${clientId}`);
        console.log("Client API response:", response.data);
        
        if (response.data.success && response.data.client) {
            setMoneyOwed(response.data.client.amountRequired || 0);
        } else {
            const errorMsg = response.data.message || 'Failed to load client data';
            console.error('Client fetch error:', errorMsg);
            setError(errorMsg);
        }
    } catch (error) {
        console.error('Error fetching client:', error);
        const errorMsg = error.response?.data?.message || 
                        error.message || 
                        'Error fetching client data';
        setError(errorMsg);
        
        // Additional debug info
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
    } finally {
        setIsLoadingClients(false);
    }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!userId || !branchId) {
    console.error("User ID or branch ID is not set");
    return;
  }

  const isBankOpen = localStorage.getItem('bankOpen') === 'true';
  if (!isBankOpen) {
    alert('الدرج مغلق يرجي الرجوع الي الصفحة الرئيسية لفتح الدرج اولا');
    return;
  }

  setIsLoading(true);
  setError(null);

  const isRandomPayment = !selectedClient;
  let paymentAmount;
  let selectedClientData = null;

  if (!isRandomPayment) {
    selectedClientData = clients.find((client) => client._id === selectedClient);
    if (!selectedClientData) {
      setError('العميل المحدد غير موجود');
      setIsLoading(false);
      return;
    }
    
    paymentAmount = paymentType === 'full' ? selectedClientData.amountRequired : Number(partialAmount);

    if (paymentType === 'partial' && (isNaN(paymentAmount) || paymentAmount <= 0 || paymentAmount > selectedClientData.amountRequired)) {
      setError('المبلغ الجزئي غير صحيح');
      setIsLoading(false);
      return;
    }
  } else {
    paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('المبلغ غير صحيح');
      setIsLoading(false);
      return;
    }
  }

  const BankId = localStorage.getItem('bankID');
  if (!BankId) {
    setError('Bank ID not found');
    setIsLoading(false);
    return;
  }

  try {
    const bankResponse = await axios.get(`http://localhost:4321/api/bank/${BankId}`);
    const currentBankAmount = parseFloat(bankResponse.data.bankAmount || 0);

    if (currentBankAmount < paymentAmount) {
      setError('لا يوجد رصيد كافي في الدرج');
      setIsLoading(false);
      return;
    }

    // Create the transaction payload
    const payload = {
      branchId,
      amount: paymentAmount,
      user: userId,
      type,
      date: new Date(),
      client: selectedClient,
      description: isRandomPayment ? description : undefined // Only use custom description for random payments
    };

    // Save the transaction
    const response = await axios.post(`http://localhost:4321/api/transactions/customer_payment`, payload);
    setTransactions((prev) => [response.data, ...prev]);

    if (!isRandomPayment) {
      // Update client's amount
      await axios.put(`http://localhost:4321/api/clients/dec-amount`, {
        clientId: selectedClient,
        amountPaid: paymentAmount,
      });
    }

    // Update bank amount
    await axios.put(`http://localhost:4321/api/bank/${BankId}`, {
      bankAmount: currentBankAmount + paymentAmount,
    });

    // Reset form
    setDescription('');
    setAmount('');
    setSelectedClient('');
    setPartialAmount(0);
    setMoneyOwed(0);
    
    // Refresh transactions
    fetchTransactions(currentPage);

  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    setError(error.response?.data?.message || error.message);
  } finally {
    setIsLoading(false);
  }
};

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <div className="input-transaction">
        <form className="input-transaction-form" onSubmit={handleSubmit}>
          <h1>اختيار العميل</h1>
          <select
            value={selectedClient}
            onChange={handleClientChange}
            className="input-transaction-input"
            disabled={isLoading}
          >
            <option value="">اختر عميل</option>
            {clients.length > 0 ? (
              clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} - المتبقي: {client.amountRequired || 0} جنيه
                </option>
              ))
            ) : (
              <option disabled>لا يوجد عملاء متاحين</option>
            )}
          </select>

          {isLoadingClients && <div>جاري تحميل بيانات العميل...</div>}

          {selectedClient && moneyOwed > 0 && (
            <>
              <h2>المبلغ المطلوب: {moneyOwed} جنيه</h2>
              <h2>نوع الدفع</h2>
              <label>
                <input 
                  type="radio" 
                  value="full" 
                  checked={paymentType === "full"} 
                  onChange={() => setPaymentType("full")}
                  disabled={isLoading}
                />
                دفع كامل
              </label>
              <label>
                <input 
                  type="radio" 
                  value="partial" 
                  checked={paymentType === "partial"} 
                  onChange={() => setPaymentType("partial")}
                  disabled={isLoading}
                />
                دفع جزئي
              </label>

              {paymentType === "partial" && (
                <input
                  type="number"
                  placeholder="المبلغ الجزئي"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(Number(e.target.value))}
                  className="input-transaction-input"
                  disabled={isLoading}
                  min="0"
                  max={moneyOwed}
                />
              )}
            </>
          )}

          <h1>سداد عميل عشوائي</h1>
          <input
            type="number"
            placeholder="المبلغ"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-transaction-input"
            disabled={isLoading}
          />
          <input
            type="text"
            placeholder="الوصف"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-transaction-input"
            disabled={isLoading}
          />

          <button type="submit" className="input-transaction-button" disabled={isLoading}>
            {isLoading ? 'جاري المعالجة...' : 'دفع'}
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
            <div className="input-transaction-table-container">
              <table className="input-transaction-table">
                <thead>
                  <tr>
                    <th>الوصف</th>
                    <th>المبلغ</th>
                    <th>العميل</th>
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
                      <td>{transaction.clientName}</td>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{new Date(transaction.date).toLocaleTimeString()}</td>
                      <td>{transaction.userName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="input-transaction-pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="input-transaction-page-button"
              >
                السابق
              </button>
              <span>الصفحة {currentPage} من {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="input-transaction-page-button"
              >
                التالي
              </button>
            </div>
          </>
        )}

        <button 
          className="input-transaction-all-transactions-button" 
          onClick={() => navigate('/all-transactions')}
          disabled={isLoading}
        >
          عرض الكل
        </button>
      </div>
    </>
  );
};

export default CustomerPaymentTransaction;