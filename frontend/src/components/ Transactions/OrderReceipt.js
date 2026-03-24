import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
import Loader from '../Loader';
import "../../styles/OrderReceipt.css"

const OrderReceipt = () => {
    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';
    const { orderId } = useParams();
    const [orderData, setOrderData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [welcomeData, setWelcomeData] = useState({
        storeName: "Tarek Phones",
        branchName: "Default Branch",
        salesName: "Default Sales",
    });
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const branchId = localStorage.getItem("branchId");

        if (!userId || !branchId) {
            setError('User ID or Branch ID is missing');
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                const userResponse = await axios.get(`http://localhost:4321/api/users/${userId}`);
                const branchResponse = await axios.get(`http://localhost:4321/api/branches/${branchId}`);
                
                setWelcomeData(prevData => ({
                    ...prevData,
                    salesName: userResponse.data.username,
                    branchName: branchResponse.data.name
                }));
            } catch (error) {
                console.error("Error fetching user or branch data:", error);
                setError('Failed to fetch user or branch information');
            }
        };

        const fetchOrderData = async () => {
            if (!orderId) return;

            try {
                const response = await axios.get(`http://localhost:4321/api/orders/${orderId}?branchId=${branchId}`);
                if (response.data) {
                    setOrderData(response.data.data);
                } else {
                    setError('Order not found');
                }
            } catch (error) {
                console.error('Error fetching order data:', error);
                setError('Failed to retrieve order data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
        fetchOrderData();
    }, [orderId, API_URL]);

    if (error) return <div className="error-message">{error}</div>;
    if (loading || !orderData) return <Loader />;

    // Safely destructure with default values
    const { 
        discount = 0, 
        paid = 0, 
        remaining = 0, 
        clientName = "", 
        clientPhone = "", 
        checkoutItems = [], 
        date = "", 
        time = "" 
    } = orderData;
    
    const totalAmount = checkoutItems.reduce((total, item) => total + (item.sellingPrice || 0), 0);
    const totalAfterDiscount = totalAmount - (Number(discount) || 0);

    return (
        <>
            <Navbar isAdmin={isAdmin} />
            <div className='order-receipt-container'>
                <div className='order-receipt-printable'>
                    <div className='order-receipt-header'>
                        <p className='store-name'>{welcomeData.storeName}</p>
                        <p className='branch-name'>{welcomeData.branchName}</p>
                        <p className='sales-name'>{welcomeData.salesName}</p>
                        <p className='order-date'>Date: {date}</p>
                        <p className='order-time'>Time: {time}</p>
                    </div>

                    {checkoutItems.length > 0 ? (
                        <>
                            <table className='order-items-table'>
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
                                            <td>{item.sn || 'لا يوجد'}</td>
                                            <td>{item.sellingPrice || 'Not Available'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className='order-receipt-summary'>
                                <div className='summary-row'>
                                    <span>إجمالي المبلغ:</span>
                                    <span>{totalAmount} EGP</span>
                                </div>
                                <div className='summary-row'>
                                    <span>الخصم:</span>
                                    <span>{discount} EGP</span>
                                </div>
                                <div className='summary-row'>
                                    <span>إجمالي المبلغ بعد الخصم:</span>
                                    <span>{totalAfterDiscount} EGP</span>
                                </div>
                                <div className='summary-row'>
                                    <span>المبلغ المدفوع:</span>
                                    <span>{paid} EGP</span>
                                </div>
                                <div className='summary-row'>
                                    <span>المتبقي:</span>
                                    <span>{remaining} EGP</span>
                                </div>
                                {clientName && (
                                    <div className='summary-row'>
                                        <span>اسم العميل:</span>
                                        <span>{clientName}</span>
                                    </div>
                                )}
                                {clientPhone && (
                                    <div className='summary-row'>
                                        <span>رقم هاتف العميل:</span>
                                        <span>{clientPhone}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className='no-items-message'>لا توجد عناصر في هذه الفاتورة</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default OrderReceipt;