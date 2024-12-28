import React, { useEffect, useState } from 'react';
import '../../styles/Checkout.css'; // Ensure you import the CSS file
import axios from 'axios';
import Loader from '../Loader';



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
                const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`);
                const branchResponse = await axios.get(`http://localhost:5000/api/branches/${branchId}`);

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
    const totalAfterDiscount = totalAmount - Number(discount); // Calculate total after discount
    const remaining = Number(paid) - totalAfterDiscount; // Calculate remaining amount to be paid
     

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
    
        // Create a new client if the remaining amount is not zero and client info is provided
        if (clientName && clientPhone) {
            try {
                // Send a request to the backend to create a new client
                await axios.post('http://localhost:5000/api/clients/add', {
                    name: clientName,
                    phoneNumber: clientPhone,
                    amountRequired: remaining,
                });
                console.log('تم إضافة العميل بنجاح');
            } catch (error) {
                console.error('Error adding client:', error.response ? error.response.data.message : error.message);
                alert('حدث خطأ أثناء إضافة العميل');
                return; // Stop the process if there was an error adding the client
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
            const response = await axios.post('http://localhost:5000/api/orders', orderData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            // Update quantities for the products in the order
            for (const item of checkoutItems) {
                try {
                    const response = await axios.put(`http://localhost:5000/api/products/${item.barcode}/decrease`, {
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
                const bankResponse = await axios.get(`http://localhost:5000/api/bank/${BankId}`);
                if (!bankResponse.data || bankResponse.data.bankAmount === undefined) {
                    throw new Error('Invalid bank data received');
                }
                const currentBankAmount = parseFloat(bankResponse.data.bankAmount || 0);
            
                // حساب المبلغ المحدث
                const updatedBankAmount = currentBankAmount + Number(paid);
            
                // إرسال البيانات المحدثة إلى الخادم
                const updateResponse = await axios.put(`http://localhost:5000/api/bank/${BankId}`, {
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
    
            window.close(); // Close the window after submitting
        } catch (error) {
            console.error('Error:', error.response ? error.response.data.message : error.message);
        }
    };
    
    const handlePhoneChange = async (phone) => {
        setClientPhone(phone);
    
        if (!phone) {
            setClientName('');
            return;
        }
    
        try {
            const response = await axios.get(`http://localhost:5000/api/clients/${phone}`);
            if (response.data) {
                setClientName(response.data.name);
                // تحديث المبلغ المطلوب بناءً على البيانات المسترجعة من الجهة الخلفية
                setPaid(response.data.amountRequired); 
            }
        } catch (error) {
            setClientName('');
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
