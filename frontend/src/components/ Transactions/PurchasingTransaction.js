import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/Transactions.css";

const PurchasingTransaction = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const branchId = localStorage.getItem('branchId');
  const role = localStorage.getItem('role');
  const type = localStorage.getItem('transactionType');
  const isAdmin = role === 'admin';
  
  // Suppliers state initialized as an empty array to prevent map errors
  const [suppliers, setSuppliers] = useState([]); 

  const [supplier, setSupplier] = useState({
    name: '',
    phoneNumber: '',
    company: '',
    notes: '',
    moneyOwed: '',
  });
  
  const [selectedSupplier, setSelectedSupplier] = useState(''); 

  // Fetch suppliers from API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('https://tarek-store-backend.onrender.com/api/suppliers');
        if (response.data.suppliers && Array.isArray(response.data.suppliers)) {
          setSuppliers(response.data.suppliers); // استخدم فقط الـ suppliers من الاستجابة
        } else {
          setSuppliers([]); // في حالة عدم وجود الموردين
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        setSuppliers([]); // في حال فشل الاتصال
      }
    };
    fetchSuppliers();
  }, []);

  const fetchUserData = useCallback(async (userId) => {
    try {
      const userResponse = await axios.get(`https://tarek-store-backend.onrender.com/api/users/${userId}`);
      return { userName: userResponse.data.username };
    } catch (error) {
      console.error("Error fetching user", error);
      return { userName: 'Unknown' };
    }
  }, []);

  const fetchTransactions = useCallback(
    async (page) => {
      setIsLoading(true);
      setError(null);

      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      if (!branchId) {
        console.error('Branch ID is not available.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get('https://tarek-store-backend.onrender.com/api/transactions/daypurchasing', {
          params: { branchId, startDate, endDate, page, limit: 5 },
        });

        const transactionsWithUserData = await Promise.all(
          response.data.transactions.map(async (transaction) => {
            const { userName } = await fetchUserData(transaction.user);
            return { ...transaction, userName };
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
    },
    [branchId, fetchUserData]
  );

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [fetchTransactions, currentPage]);

  const goToAllTransactions = () => {
    navigate('/all-transactions');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSupplierChange = (e) => {
    setSelectedSupplier(e.target.value);
    if (e.target.value === 'new') {
      setSupplier({ name: '', phoneNumber: '', company: '', notes: '', moneyOwed: '' });
    }
  };

  const checkSupplierPhoneNumber = async (phoneNumber) => {
    // إزالة المسافات أو الرموز غير الضرورية من الرقم
    const cleanedPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
  
    // إذا كان الرقم فارغًا، نرجع false لأنه لا يمكن التحقق من رقم فارغ
    if (!cleanedPhoneNumber) {
      return false;
    }
  
    try {
      const response = await axios.get(`https://tarek-store-backend.onrender.com/api/suppliers?phoneNumber=${cleanedPhoneNumber}`);
      if (response.data.suppliers.length > 0) {
        return true; // المورد بهذا الرقم موجود بالفعل
      }
      return false; // المورد بهذا الرقم غير موجود
    } catch (error) {
      console.error('Error checking phone number:', error);
      return false;
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
      const finalSupplier = selectedSupplier === 'new' ? supplier : { name: selectedSupplier };

      if (selectedSupplier !== 'new') {
        const phoneExists = await checkSupplierPhoneNumber(supplier.phoneNumber);
        if (phoneExists) {
          setError('المورد بهذا الرقم موجود بالفعل');
          setIsLoading(false);
          return;
        }
      }

      const response = await axios.post('https://tarek-store-backend.onrender.com/api/transactions/purchasing', {
        branchId,
        user: userId,
        type,
        description,
        amount: parseFloat(amount),
        date: new Date(),
        supplier: finalSupplier,
      });

      const newTransaction = response.data;
      setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]);
      setDescription('');
      setAmount('');
      setSupplier({ name: '', phoneNumber: '', company: '', notes: '', moneyOwed: '' });
      setSelectedSupplier('');
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

  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <div className="input-transaction">
        <h1>مشتروات</h1>
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
          <h1>اختيار أو إضافة مورد</h1>
          <select
            value={selectedSupplier}
            onChange={handleSupplierChange}
            className="input-transaction-input"
          >
            <option value="">اختر مورد</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier.name}>
                {supplier.name}
              </option>
            ))}
            <option value="new">إضافة مورد جديد</option>
          </select>

          {selectedSupplier === 'new' && (
            <>
              <input
                type="text"
                id="name"
                name="name"
                value={supplier.name}
                onChange={(e) => setSupplier({ ...supplier, name: e.target.value })}
                className="input-transaction-input"
                placeholder="اسم المورد"
              />
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={supplier.phoneNumber}
                onChange={(e) => setSupplier({ ...supplier, phoneNumber: e.target.value })}
                className="input-transaction-input"
                placeholder="رقم الموبايل"
              />
              <input
                type="text"
                id="company"
                name="company"
                value={supplier.company}
                onChange={(e) => setSupplier({ ...supplier, company: e.target.value })}
                className="input-transaction-input"
                placeholder="الشركة"
              />
              <textarea
                id="notes"
                name="notes"
                value={supplier.notes}
                onChange={(e) => setSupplier({ ...supplier, notes: e.target.value })}
                className="input-transaction-input"
                placeholder="تعليقات"
              ></textarea>
              <input
                type="text"
                id="moneyOwed"
                name="moneyOwed"
                value={supplier.moneyOwed}
                onChange={(e) => setSupplier({ ...supplier, moneyOwed: e.target.value })}
                className="input-transaction-input"
                placeholder="المبلغ المستحق"
              />
            </>
          )}
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
                      <td>{transaction.supplier ? transaction.supplier.name : 'غير متوفر'}</td>
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
                disabled={currentPage === 1}
                className="input-transaction-page-button"
              >
                السابق
              </button>
              <span>الصفحة {currentPage} من {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="input-transaction-page-button"
              >
                التالي
              </button>
            </div>
          </>
        )}

        <button className="input-transaction-all-transactions-button" onClick={goToAllTransactions}>
          عرض الكل
        </button>
      </div>
    </>
  );
};

export default PurchasingTransaction;
