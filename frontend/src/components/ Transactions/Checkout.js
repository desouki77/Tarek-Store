import React, { useEffect, useState } from 'react';
import '../../styles/Checkout.css';
import axios from 'axios';
import Loader from '../Loader';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [discount, setDiscount] = useState('');
    const [paid, setPaid] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4321";
    const [welcomeData, setWelcomeData] = useState({
        storeName: "Tarek Phones",
        branchName: "Default Branch",
        salesName: "Default Sales",
        date: new Date().toLocaleDateString(),
    });

    const navigate = useNavigate();

    useEffect(() => {
        const items = sessionStorage.getItem('checkoutItems');
        if (items) {
            setCheckoutItems(JSON.parse(items));
        }

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const branchId = localStorage.getItem("branchId");
                
                const userResponse = await axios.get(`${API_URL}/api/users/${userId}`);
                const branchResponse = await axios.get(`${API_URL}/api/branches/${branchId}`);

                setWelcomeData(prevData => ({
                    ...prevData,
                    salesName: userResponse.data.username,
                    branchName: branchResponse.data.name
                }));
            } catch (error) {
                console.error("Error fetching user or branch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        return () => clearInterval(timer);
    }, [API_URL]);

    const totalAmount = checkoutItems.reduce((total, item) => total + item.sellingPrice, 0);
    const totalAfterDiscount = totalAmount - (Number(discount) || 0);
    const remaining = Math.abs((Number(paid) || 0) - totalAfterDiscount);

    const handleClientCreation = async () => {
        try {
            const response = await axios.post(`${API_URL}/api/clients/add`, {
                name: clientName,
                phoneNumber: clientPhone,
                amountRequired: remaining
            });
            
            if (response.status === 400) {
                // If client exists, try updating instead
                await axios.put(`${API_URL}/api/clients/inc-amount`, {
                    clientPhone,
                    remainingAmount: remaining
                });
            }
            return true;
        } catch (error) {
            console.error('Error handling client:', error);
            if (error.response?.status === 400) {
                // Client exists, try updating
                try {
                    await axios.put(`${API_URL}/api/clients/update-amount`, {
                        clientPhone,
                        remainingAmount: remaining
                    });
                    return true;
                } catch (updateError) {
                    console.error('Error updating client:', updateError);
                    throw updateError;
                }
            }
            throw error;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const branchId = localStorage.getItem('branchId');
    
        if (!branchId) {
            setAlertMessage('Branch ID is missing.');
            setShowAlert(true);
            setLoading(false);
            return;
        }
    
        if (!paid) {
            setAlertMessage("برجاء ادخال مبلغ الدفع!!");
            setShowAlert(true);
            setLoading(false);
            return;
        }
    
        if (remaining !== 0 && (!clientName || !clientPhone)) {
            setAlertMessage("هناك باقي!! برجاء ادخال اسم ورقم العميل");
            setShowAlert(true);
            setLoading(false);
            return;
        }

        try {
            // Handle client creation if there's remaining amount
            if (remaining !== 0 && clientName && clientPhone) {
                await handleClientCreation();
            }

            // Prepare order data
            const orderData = {
                branchId,
                checkoutItems: checkoutItems.map(item => ({
                    barcode: item.barcode,
                    name: item.name,
                    sellingPrice: item.sellingPrice,
                    quantity: 1,
                    sn: item.sn || item.selectedSn || null,
                    purchasePrice: item.purchasePrice || 0
                })),
                discount: Number(discount) || 0,
                paid: Number(paid) || 0,
                remaining,
                clientName,
                clientPhone,
                date: new Date().toLocaleDateString(),
                time: currentTime,
            };

            // Create the order
            await axios.post(`${API_URL}/api/orders`, orderData);

            // Update product quantities
            for (const item of checkoutItems) {
                try {
                    if (item.sn && item.selectedSn) {
                        await axios.put(`${API_URL}/api/products/${item.barcode}/remove-sn`, {
                            sn: item.selectedSn,
                            branchId,
                        });
                    } else {
                        await axios.put(`${API_URL}/api/products/${item.barcode}/decrease`, {
                            quantity: 1, 
                            branchId,
                        });
                    }
                } catch (error) {
                    console.error('Error updating product:', error);
                }
            }

            // Update bank amount
            try {
                const BankId = localStorage.getItem('bankID');
                if (BankId) {
                    const bankResponse = await axios.get(`${API_URL}/api/bank/${BankId}`);
                    const updatedBankAmount = parseFloat(bankResponse.data.bankAmount || 0) + Number(paid);
                    await axios.put(`${API_URL}/api/bank/${BankId}`, {
                        bankAmount: updatedBankAmount,
                    });
                }
            } catch (error) {
                console.error('Error updating bank amount:', error);
            }

            // Clear and redirect
            sessionStorage.removeItem('checkoutItems');
            navigate('/transactions/selling');
        } catch (error) {
            console.error('Error:', error);
            setAlertMessage("حدث خطأ أثناء معالجة الطلب");
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = async (phone) => {
        setClientPhone(phone);
        if (!phone || phone.trim() === "") {
            setClientName('');
            return;
        }
        try {
            const response = await axios.get(`${API_URL}/api/clients/phone/${phone}`);
            setClientName(response.data?.name || "");
        } catch (error) {
            setClientName('');
            console.error("Error fetching client data:", error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div id='checkout-container'>
            {showAlert && (
                <div className="alert-modal">
                    <div className="alert-content">
                        <p>{alertMessage}</p>
                        <button onClick={() => setShowAlert(false)}>موافق</button>
                    </div>
                </div>
            )}

            <h1>اتمام البيع</h1>
            <div id="printable-section">
                <div className="print-only">
                    <p>{welcomeData.storeName}</p>
                    <p>{welcomeData.branchName}</p>
                    <p>{welcomeData.salesName}</p>
                    <p>Date: {welcomeData.date}</p>
                    <p>Time: {currentTime}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>الباركود</th>
                            <th>اسم المنتج</th>
                            <th>السريال</th>
                            <th>السعر</th>
                        </tr>
                    </thead>
                    <tbody>
                        {checkoutItems.map((item, index) => (
                            <tr key={index}>
                                <td>{item.barcode}</td>
                                <td>{item.name}</td>
                                <td>{item.sn || item.selectedSn || 'لا يوجد'}</td>
                                <td>{item.sellingPrice}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="print-only">
                    <p>إجمالي المبلغ: {totalAmount}</p>
                    <p>الخصم: {discount}</p>
                    <p>إجمالي المبلغ بعد الخصم: {totalAfterDiscount}</p>
                    <p>المبلغ المدفوع: {paid}</p>
                    <p>المتبقي: {remaining}</p>
                </div>
            </div>

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
                    value={clientPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="رقم هاتف العميل اولآ"
                />
                <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="اسم العميل"
                />

                <button onClick={handlePrint}>طباعة الإيصال</button>
                <button onClick={handleSubmit}>تقديم الطلب</button>
            </div>
        </div>
    );
};

export default Checkout;