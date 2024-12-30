import React, { useState, useEffect, useCallback ,useRef} from 'react';
import Navbar from '../Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../styles/Transactions.css";

const ReturnsTransaction = () => {
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

    const barcodeInputRef = useRef(null); // Ref for the barcode input field
    const descriptionInputRef = useRef(null); // Ref for the description input field
    
    const [products, setProducts] = useState([]);
    const [orderData, setOrderData] = useState({
          barcode: '',
          itemName: '',
          itemDescription: '',
          price: 0,
      });

  const fetchUserData = useCallback(async (userId) => {
    try {
      const userResponse = await axios.get(`https://tarek-store-backend.onrender.com/api/users/${userId}`);
      return { userName: userResponse.data.username };
    } catch (error) {
      console.error("Error fetching user", error);
      return { userName: 'Unknown' };
    }
  }, []);

  const handleInputChange = (e) => {
    setOrderData((prevData) => ({
        ...prevData,
        barcode: e.target.value,
    }));
    setErrorMessage(''); // Clear error while typing
  };

  const handleBarcodeInput = async (e) => {
    if (e.key === 'Enter') {
        const scannedBarcode = orderData.barcode.trim();

        if (!/^\d*$/.test(scannedBarcode)) {
            setErrorMessage('الباركود يجب أن يكون رقمًا');
            return;
        }

        try {
            // استرجاع المنتج باستخدام الباركود فقط
            const response = await axios.get(`https://tarek-store-backend.onrender.com/api/products/${scannedBarcode}`, {
                params: { branchId },
            });

            if (response.data) {
                const productData = response.data;

                // عرض بيانات المنتج الكاملة في الواجهة
                setProducts((prevProducts) => [
                    ...prevProducts,
                    productData,  // إضافة البيانات الكاملة للمنتج
                ]);

                setOrderData((prevData) => ({ ...prevData, barcode: '' }));
                 // الانتقال إلى الخانة التالية بعد إدخال الباركود
          if (descriptionInputRef.current) {
            descriptionInputRef.current.focus();
          }
            } else {
                setErrorMessage('خطأ في الباركود، برجاء المحاولة مرة أخرى');
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setErrorMessage('منتج غير موجود، برجاء مراجعة الباركود');
            } else {
                setErrorMessage('هناك خطأ، برجاء المحاولة مرة أخرى');
            }
        } finally {
            
        }
    }
};


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
        const response = await axios.get('https://tarek-store-backend.onrender.com/api/transactions/dayreturns', {
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
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus(); // Automatically focus on the barcode input
  }
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
  
    if (products.length === 0) {
      setError("يرجى إضافة منتجات قبل إرسال المعاملة.");
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
      // إرسال معرّفات المنتجات فقط (ObjectId)
      const productId = products.map((product) => product._id);  // استخراج الـ ObjectId فقط
      const response = await axios.post('https://tarek-store-backend.onrender.com/api/transactions/returns', {
        branchId,
        user: userId,
        type,
        description,
        amount: parseFloat(amount),
        date: new Date(),
        products: productId,  // إرسال الـ ObjectId فقط
      });

      // هنا ستقوم بزيادة الكمية للمنتج
    for (const product of products) {
      await axios.put(`https://tarek-store-backend.onrender.com/api/products/${product._id}/increment`, {
        branchId,
        quantity: 1, // زيادة الكمية بمقدار 1
      });
    }
  
      const { userName } = await fetchUserData(userId);
      const newTransaction = { ...response.data, userName };
  
      // هنا يمكنك إضافة المنتجات الجديدة مباشرة إلى حالة المنتجات
      setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]);
      
      // تنظيف البيانات بعد المعاملة
      setDescription('');
      setAmount('');
      setProducts([]); // إزالة المنتجات بعد إرسال المعاملة
  
      // إعادة تحميل المعاملات في حالة أن المنتجات الجديدة تظهر في الجدول
      fetchTransactions(currentPage); // تأكد من استرجاع المعاملات بعد إرسال المعاملة.
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
  





  const [errorMessage, setErrorMessage] = useState('');
  
  


const removeProduct = (index) => {
  setProducts((prevProducts) => prevProducts.filter((_, i) => i !== index));
};
  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <div className="input-transaction">
        <h2>مرتجعات</h2>
        <form className="input-transaction-form" onSubmit={handleSubmit}>
        <input
                    type="text"
                    className="input-transaction-input"
                    ref={barcodeInputRef}
                    value={orderData.barcode}
                    onChange={handleInputChange}
                    onKeyDown={handleBarcodeInput}
                    placeholder="باركود"
                />
                {errorMessage && <p className="input-transaction-error">{errorMessage}</p>}

                {products.length > 0 && (
                    <>
                        <div className="input-transaction-table-container">
                        <table className="input-transaction-table">
                            <thead>
                                <tr>
                                    <th>باركود</th>
                                    <th>اسم المنتج</th>
                                    <th>وصف</th>
                                    <th>السعر</th>
                                    <th>عمليات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                    <tr key={index}>
                                        <td>{product.barcode}</td>
                                        <td>{product.name}</td>
                                        <td>{product.description}</td>
                                        <td>{product.price} EGP</td>
                                        <td>
                                            <button
                                                onClick={() => removeProduct(index)}
                                                className="input-transaction-remove-btn"
                                            >
                                                مسح
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>

                       
                    </>
                )}

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
            <div className="input-transaction-table-container">
            <table className="input-transaction-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الوصف</th>
                  <th>المبلغ</th>
                  <th>التاريخ</th>
                  <th>الوقت</th>
                  <th>المستخدم</th>
                </tr>
              </thead>
              <tbody>
              {transactions.map((transaction) => {
  const products = Array.isArray(transaction.products) ? transaction.products : [transaction.products]; // تأكد من أن products هي مصفوفة
  return (
    <tr key={transaction._id}>
      <td>
        {/* عرض اسم المنتج فقط إذا كان موجودًا */}
        {products.length > 0 
  ? products.map(product => product?.name || 'اسم غير موجود').join(', ') 
  : 'لا يوجد منتج'}

      </td>
      <td>{transaction.description}</td>
      <td>{transaction.amount}</td>
      <td>{new Date(transaction.date).toLocaleDateString()}</td>
      <td>{new Date(transaction.date).toLocaleTimeString()}</td>
      <td>{transaction.userName}</td>
    </tr>
  );
})}

              </tbody>
            </table>
            </div>
            <div className="input-transaction-pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className='input-transaction-page-button'
              >
                 السابق 
              </button>
              <span>الصفحة {currentPage} من {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='input-transaction-page-button'
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

export default ReturnsTransaction;
