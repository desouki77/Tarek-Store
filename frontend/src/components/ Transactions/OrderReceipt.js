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
                const userResponse = await axios.get(`https://tarek-store-backend.onrender.com/api/users/${userId}`);
                const branchResponse = await axios.get(`https://tarek-store-backend.onrender.com/api/branches/${branchId}`);
                
                setWelcomeData(prevData => ({
                    ...prevData,
                    salesName: userResponse.data.username,
                    branchName: branchResponse.data.name
                }));
            } catch (error) {
                console.error("Error fetching user or branch data:", error);
                setError('Failed to fetch user or branch information');
            }
            finally {
                setLoading(false); // Set loading to false after data is fetched
            }
            
        };

        const fetchOrderData = async () => {
            if (!orderId) return;

            try {
                const response = await axios.get(`https://tarek-store-backend.onrender.com/api/orders/${orderId}?branchId=${branchId}`);
                console.log('Order data:', response.data); // Log order data
                setOrderData(response.data);
            } catch (error) {
                console.error('Error fetching order data:', error);
                setError('Failed to retrieve order data.');
            }
        };

        fetchUserData();
        fetchOrderData();
    }, [orderId]);

    if (error) return <div>{error}</div>;
    if (loading) return <Loader />;

    // Updated to use checkoutItems instead of items
    const { discount = 0, paid = 0, remaining = 0, clientName = "", clientPhone = "", checkoutItems = [], date = "", time = "" } = orderData;
    const totalAmount = checkoutItems.reduce((total, item) => total + (item.price || 0), 0);
    const totalAfterDiscount = totalAmount - Number(discount);

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

                    <table className='order-items-table'>
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

                    <div className='order-receipt-summary'>
                        <p>إجمالي المبلغ: {totalAmount}</p>
                        <p>الخصم: {discount}</p>
                        <p>إجمالي المبلغ بعد الخصم: {totalAfterDiscount}</p>
                        <p>المبلغ المدفوع: {paid}</p>
                        <p>المتبقي: {remaining}</p>
                        <p>اسم العميل: {clientName}</p>
                        <p>رقم هاتف العميل: {clientPhone}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderReceipt;
