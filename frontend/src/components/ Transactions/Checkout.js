import React, { useEffect, useState } from 'react';
import '../../styles/Checkout.css'; // Ensure you import the CSS file
import axios from 'axios';
import Loader from '../Loader';
import { useNavigate } from 'react-router-dom'; // استيراد useNavigate

const Checkout = () => {
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [discount, setDiscount] = useState(''); // Default to an empty string
    const [paid, setPaid] = useState(''); // Default to an empty string
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());


    const [welcomeData, setWelcomeData] = useState({
        storeName: "Tarek Phones",
        branchName: "Default Branch",
        salesName: "Default Sales",
        date: new Date().toLocaleDateString(),
    });

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // استخدام useNavigate للتوجيه

    useEffect(() => {
        
        const items = sessionStorage.getItem('checkoutItems');
        if (items) {
            setCheckoutItems(JSON.parse(items));
        }

        // Set up a timer to update the current time every second
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        const userId = localStorage.getItem("userId");
        const branchId = localStorage.getItem("branchId");

        const fetchUserData = async () => {
            try {
                // Fetch user data
                const userResponse = await axios.get(`https://tarek-store-backend.onrender.com/api/users/${userId}`);
                const branchResponse = await axios.get(`https://tarek-store-backend.onrender.com/api/branches/${branchId}`);

                setWelcomeData(prevData => ({
                    ...prevData,
                    salesName: userResponse.data.username,
                    branchName: branchResponse.data.name
                }));
            } catch (error) {
                console.error("Error fetching user or branch data:", error);
            } 
            finally {
                setLoading(false);
            }
        };

        fetchUserData();
        // Clean up the interval on component unmount
        return () => clearInterval(timer);
    }, []);

    const totalAmount = checkoutItems.reduce((total, item) => total + item.price, 0);
    const totalAfterDiscount = totalAmount - (Number(discount) || 0); // Calculate total after discount
    const remaining = Math.abs((Number(paid) || 0) - totalAfterDiscount); // استخدام Math.abs لجعل المبلغ المتبقي موجبًا
    
     

    const handleSubmit = async () => {
        // Retrieve the branchId from local storage
        const branchId = localStorage.getItem('branchId');
    
        // Check if branchId exists, if not, show an alert and return
        if (!branchId) {
            alert('Branch ID is missing.');
            return;
        }
    
        // Check if the remaining amount is not zero and if client details are missing
        if (remaining !== 0 && (!clientName || !clientPhone)) {
            alert("هناك باقي!! برجاء ادخال اسم ورقم العميل");
            return;
        }
    
        if (remaining !== 0 && clientName && clientPhone) {
            try {
                const existingClientResponse = await axios.get(`https://tarek-store-backend.onrender.com/api/clients/${clientPhone}`);
        
                if (existingClientResponse.data) {
                    // إذا كان العميل موجودًا، قم بتحديث المبلغ المتبقي
                    await axios.put('https://tarek-store-backend.onrender.com/api/clients/update-amount', {
                        clientPhone,
                        remainingAmount: remaining, // إضافة المبلغ المتبقي
                    });
                    console.log('تم تحديث المبلغ بنجاح');
                } else {
                    // إذا لم يكن العميل موجودًا، أضفه
                    await axios.post('https://tarek-store-backend.onrender.com/api/clients/add', {
                        name: clientName,
                        phoneNumber: clientPhone,
                        amountRequired: remaining,
                    });
                    console.log('تم إضافة العميل بنجاح');
                }
            } catch (error) {
                console.error('Error checking/adding client:', error.response?.data?.message || error.message);
            }
        }
    
        // Prepare order data
        const orderData = {
            branchId: branchId, 
            checkoutItems,
            discount: Number(discount) || 0,
            paid: Number(paid) || 0,
            remaining: (Number(paid) || 0) - totalAfterDiscount,
            clientName,
            clientPhone,
            date: new Date().toLocaleDateString(),
            time: currentTime,
        };
    
        if (!paid) {
            alert("برجاء ادخال مبلغ الدفع!!");
            return;
        }
    
        try {
            // Create the order and decrease product quantities in one go
            const response = await axios.post('https://tarek-store-backend.onrender.com/api/orders', orderData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            // Update quantities for the products in the order
            for (const item of checkoutItems) {
                try {
                    const response = await axios.put(`https://tarek-store-backend.onrender.com/api/products/${item.barcode}/decrease`, {
                        quantity: 1, 
                        branchId: branchId,
                    });
                    console.log('Quantity updated successfully:', response.data);
                } catch (error) {
                    console.error('Error decreasing quantity:', error.response?.data || error.message);
                }
            }
    
            console.log(response.data.message);

            try {
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
            
                // حساب المبلغ المحدث
                const updatedBankAmount = currentBankAmount + Number(paid);
            
                // إرسال البيانات المحدثة إلى الخادم
                const updateResponse = await axios.put(`https://tarek-store-backend.onrender.com/api/bank/${BankId}`, {
                    bankAmount: updatedBankAmount,
                });
            
                console.log('Bank amount updated successfully:', updateResponse.data);
            } catch (error) {
                console.error('Error updating bank amount:', error.response?.data || error.message);
            }
            
    
            // Clear session storage and reset state
            sessionStorage.removeItem('checkoutItems');
            setCheckoutItems([]);
            setDiscount('');
            setPaid('');
            setClientName('');
            setClientPhone('');
    
            // الانتقال إلى صفحة البيع بعد إتمام الدفع
            navigate('/transactions/selling');
        } catch (error) {
            console.error('Error:', error.response ? error.response.data.message : error.message);
        }
    };
    
    const handlePhoneChange = async (phone) => {
        setClientPhone(phone); // تحديث رقم الهاتف المدخل
    
        // التحقق إذا كان الحقل فارغًا لتجنب الاستدعاءات غير الضرورية
        if (!phone || phone.trim() === "") {
            setClientName(''); // إعادة تعيين اسم العميل إذا كان الهاتف فارغًا
            return;
        }
    
        try {
            // استدعاء API لجلب بيانات العميل
            const response = await axios.get(`https://tarek-store-backend.onrender.com/api/clients/${phone}`);
            if (response.data) {
                setClientName(response.data.name || ""); // تحديث اسم العميل فقط
            } else {
                setClientName(''); // إعادة تعيين اسم العميل إذا لم يُعثر على بيانات
            }
        } catch (error) {
            setClientName(''); // إعادة تعيين اسم العميل في حالة حدوث خطأ
            console.error("Error fetching client data:", error.response?.data?.message || error.message);
        }
    };
    
    
    
    

    const handlePrint = () => {
        window.print(); // Open the print dialog
    };

    if (loading) {
        return <Loader />; // You can customize this loading message or add a spinner
    }

    return (
        <div id='checkout-container'>
            <h1>اتمام البيع</h1>
            <div id="printable-section">
                {/* Print-only information at the top */}
                <div className="print-only">
                <p>{welcomeData.storeName}</p>
                  <p>{welcomeData.branchName}</p>
                  <p>{welcomeData.salesName}</p>
                  <p>Date: {welcomeData.date}</p>
                  <p>Time: {currentTime}</p>
                </div>

                {/* Items that will be printed */}
                <table>
                    <thead>
                        <tr>
                            <th>الباركود</th>
                            <th>اسم المنتج</th>
                            <th>السعر</th>
                        </tr>
                    </thead>
                    <tbody>
                        {checkoutItems.map((item, index) => (
                            <tr key={index}>
                                <td>{item.barcode}</td>
                                <td>{item.name}</td>
                                <td>{item.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total and financial details, without client information */}
                <div className="print-only">
                    <p>إجمالي المبلغ: {totalAmount}</p>
                    <p>الخصم: {discount}</p>
                    <p>إجمالي المبلغ بعد الخصم: {totalAfterDiscount}</p> {/* Added total after discount */}
                    <p>المبلغ المدفوع: {paid}</p>
                    <p>المتبقي: {remaining}</p>
                </div>
            </div>

            {/* Hidden Inputs and Buttons for print view */}
            <div className="input-section">
                <p>إجمالي المبلغ: {totalAmount}</p>

                <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="الخصم"
                />
                <input
                    type="number"
                    value={paid}
                    onChange={(e) => setPaid(e.target.value)}
                    placeholder="المبلغ المدفوع"
                />
                <p>إجمالي المبلغ بعد الخصم: {totalAfterDiscount}</p>
                <p>المتبقي: {remaining}</p>
                <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="اسم العميل"
                />
                <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="رقم هاتف العميل"
                />
                <button onClick={handlePrint}>طباعة الإيصال</button>
                <button onClick={handleSubmit}>تقديم الطلب</button>
            </div>
        </div>
    );
};

export default Checkout;
