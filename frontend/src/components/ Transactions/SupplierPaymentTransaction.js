import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/Transactions.css";

const SupplierPaymentTransaction = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const branchId = localStorage.getItem('branchId');
  const role = localStorage.getItem('role');
  const type = localStorage.getItem('transactionType');
  const isAdmin = role === 'admin';
  
  const API_URL = process.env.REACT_APP_API_URL;

  const [suppliers, setSuppliers] = useState([]); 
  const [selectedSupplier, setSelectedSupplier] = useState(''); 
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [paymentType, setPaymentType] = useState('full');
  const [partialAmount, setPartialAmount] = useState(0);
  const [moneyOwed, setMoneyOwed] = useState(0);

  // Fetch suppliers from API
  useEffect(() => {
    const fetchSuppliers = async () => {
      let allSuppliers = [];
      let page = 1;
      const limit = 10; // Same limit as in the backend
  
      try {
        while (true) {
          const response = await axios.get(`${API_URL}/api/suppliers`, {
            params: { page, limit }
          });
  
          if (response.data.suppliers && Array.isArray(response.data.suppliers)) {
            allSuppliers = [...allSuppliers, ...response.data.suppliers];
          }
  
          // If we have fetched all suppliers, exit the loop
          if (page >= response.data.totalPages) {
            break;
          }
  
          page += 1; // Move to the next page
        }
  
        setSuppliers(allSuppliers); // Set the suppliers to state
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };
  
    fetchSuppliers();
  }, [API_URL]);

  const fetchUserData = useCallback(async (userId) => {
    try {
      const userResponse = await axios.get(`${API_URL}/api/users/${userId}`);
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
      const response = await axios.get(`${API_URL}/api/transactions/daysupplier_payment`, {
        params: { branchId, startDate, endDate, page, limit: 5 },
      });

      const transactionsWithUserData = await Promise.all(
        response.data.transactions.map(async (transaction) => {
          const { userName } = await fetchUserData(transaction.user);
          return {
            ...transaction,
            userName,
            supplierName: transaction.supplier?.name || 'غير متوفر',
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

  const handleSupplierChange = async (e) => {
    const supplierId = e.target.value;
    setSelectedSupplier(supplierId);
    setInvoices([]);
    setSelectedInvoice('');
    setMoneyOwed(0);
  
    if (!supplierId) return;
  
    setIsLoadingInvoices(true);
    try {
      const response = await axios.get(`${API_URL}/api/productinvoice/supplier/${supplierId}`);
      console.log("Invoices API response:", response.data); // Debug log
      
      if (response.data.invoices) {
        const unpaidInvoices = response.data.invoices.filter(
          invoice => invoice.invoiceStatus === "غير خالص"
        );
        
        // Verify moneyOwed exists in each invoice
        const verifiedInvoices = unpaidInvoices.map(invoice => ({
          ...invoice,
          moneyOwed: invoice.moneyOwed || invoice.purchasePrice - invoice.amountPaid || 0
        }));
        
        setInvoices(verifiedInvoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const handleInvoiceChange = (e) => {
    const selectedId = e.target.value;
    setSelectedInvoice(selectedId);
    
    const selectedInvoice = invoices.find(inv => inv._id === selectedId);
    if (selectedInvoice) {
      console.log("Selected invoice data:", selectedInvoice); // Debug log
      setMoneyOwed(selectedInvoice.moneyOwed || 0);
    } else {
      setMoneyOwed(0);
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

    const isRandomPayment = !selectedInvoice;
    let paymentAmount;

    if (!isRandomPayment) {
      const selectedInv = invoices.find((inv) => inv._id === selectedInvoice);
      if (!selectedInv) {
        setError('الفاتورة المحددة غير موجودة');
        setIsLoading(false);
        return;
      }
      
      paymentAmount = paymentType === 'full' ? selectedInv.moneyOwed : Number(partialAmount);

      if (paymentType === 'partial' && (isNaN(paymentAmount) || paymentAmount <= 0 || paymentAmount > selectedInv.moneyOwed)) {
        setError('المبلغ الجزئي غير صحيح');
        setIsLoading(false);
        return;
      }
    } else {
      paymentAmount = parseFloat(amount);
      if (isNaN(paymentAmount)) {
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
      const bankResponse = await axios.get(`${API_URL}/api/bank/${BankId}`);
      const currentBankAmount = parseFloat(bankResponse.data.bankAmount || 0);

      if (currentBankAmount < paymentAmount) {
        setError('لا يوجد رصيد كافي في الدرج');
        setIsLoading(false);
        return;
      }

      const payload = {
        branchId,
        amount: paymentAmount,
        user: userId,
        type,
        date: new Date(),
        supplier: selectedSupplier,
        invoiceId: selectedInvoice || null,
      };

      if (!isRandomPayment) {
        const selectedInv = invoices.find((inv) => inv._id === selectedInvoice);
        if (selectedInv) {
          payload.description = `دفع فاتورة ${selectedInv.productName}، ${paymentType === 'full' ? 'خالص' : 'غير خالص'}`;
        }
      } else {
        payload.description = description || 'سداد مورد عشوائي';
      }

      const response = await axios.post(`${API_URL}/api/transactions/supplier_payment`, payload);
      setTransactions((prev) => [response.data, ...prev]);

      if (!isRandomPayment) {
        await axios.put(`${API_URL}/api/productinvoice/update-moneyowed`, {
          invoiceId: selectedInvoice,
          paymentType,
          partialAmount: paymentType === 'partial' ? paymentAmount : null,
        });

        const supplierInvoicesResponse = await axios.get(`${API_URL}/api/productinvoice/supplier/${selectedSupplier}`);
        setInvoices(supplierInvoicesResponse.data.invoices.filter(inv => inv.invoiceStatus === "غير خالص"));
      }

      // Update bank amount
      await axios.put(`${API_URL}/api/bank/${BankId}`, {
        bankAmount: currentBankAmount - paymentAmount,
      });

      // Reset form
      setDescription('');
      setAmount('');
      setSelectedSupplier('');
      setSelectedInvoice('');
      setPartialAmount(0);
      setMoneyOwed(0);
      window.location.reload();

    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <div className="input-transaction">
        <form className="input-transaction-form" onSubmit={handleSubmit}>
          <h1>اختيار المورد</h1>
          <select
            value={selectedSupplier}
            onChange={handleSupplierChange}
            className="input-transaction-input select-dropdown"
            disabled={isLoading}
          >
            <option value="">اختر مورد</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>

          {isLoadingInvoices && <div>جاري تحميل الفواتير...</div>}

          {selectedSupplier && invoices.length > 0 && (
            <>
              <h2>اختيار الفاتورة</h2>
              <select 
                value={selectedInvoice} 
                onChange={handleInvoiceChange} 
                className="input-transaction-input"
                disabled={isLoading}
              >
                <option value="">اختر الفاتورة</option>
                {invoices.map((invoice) => (
                  <option key={invoice._id} value={invoice._id}>
    {invoice.productName} - المتبقي: {invoice.moneyOwed || 0} جنيه
    </option>
                ))}
              </select>
            </>
          )}

          {selectedInvoice && (
            <>
    <h2>مبلغ الفاتورة: {moneyOwed !== undefined ? `${moneyOwed} جنيه` : "جاري التحميل..."}</h2>
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

          <h1>سداد مورد عشوائي</h1>
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
                    <th>المورد</th>
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
                      <td>{transaction.supplierName}</td>
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
                // eslint-disable-next-line no-undef
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="input-transaction-page-button"
              >
                السابق
              </button>
              <span>الصفحة {currentPage} من {totalPages}</span>
              <button
                // eslint-disable-next-line no-undef
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

export default SupplierPaymentTransaction;