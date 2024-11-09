import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';

const OrderReceipt = () => {
    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';

    const { orderId } = useParams();
    const [orderData, setOrderData] = useState(null);
    const [error, setError] = useState(null);
    const [welcomeData, setWelcomeData] = useState({
        storeName: "Tarek Phones",
        branchName: "Default Branch",
        salesName: "Default Sales",
    });

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const branchId = localStorage.getItem("branchId");

        console.log('orderId:', orderId, 'branchId:', branchId); // Check values

        const fetchUserData = async () => {
            try {
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
        };

        fetchUserData();

        const fetchOrderData = async () => {
            if (!orderId) return;

            try {
                const response = await axios.get(`http://localhost:5000/api/orders/${orderId}?branchId=${branchId}`);
                console.log('Order data:', response.data); // Log order data
                setOrderData(response.data);
            } catch (error) {
                console.error('Error fetching order data:', error);
                setError('Failed to retrieve order data.');
            }
        };

        fetchOrderData();
    }, [orderId]);

    if (error) return <div>{error}</div>;
    if (!orderData) return <div>Loading...</div>;

    const { discount = 0, paid = 0, remaining = 0, clientName = "", clientPhone = "", items = [], date = "", time = "" } = orderData;
    const totalAmount = items.reduce((total, item) => total + item.price, 0);
    const totalAfterDiscount = totalAmount - Number(discount);

    return (
        <>
            <Navbar isAdmin={isAdmin} />

            <div id='order-receipt-container'>
                <div id="printable-section">
                    <div>
                        <p>{welcomeData.storeName}</p>
                        <p>{welcomeData.branchName}</p>
                        <p>{welcomeData.salesName}</p>
                        <p>Date: {date}</p>
                        <p>Time: {time}</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>الباركود</th>
                                <th>اسم المنتج</th>
                                <th>السعر</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.barcode}</td>
                                    <td>{item.name}</td>
                                    <td>{item.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div>
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
