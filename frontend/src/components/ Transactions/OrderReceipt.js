import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams from react-router-dom
import axios from 'axios';
import Navbar from '../Navbar';


const OrderReceipt = () => {

    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';

    const { orderId } = useParams(); // Get the orderId from the URL parameters
    const [orderData, setOrderData] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        // Fetch the order data from the API using the provided orderId
        const fetchOrderData = async () => {
            if (!orderId) return; // Exit if orderId is not defined

            try {
                const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
                setOrderData(response.data);
            } catch (error) {
                console.error('Error fetching order data:', error);
            }
        };

        fetchOrderData();

        // Set up a timer to update the current time every second
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        // Clean up the interval on component unmount
        return () => clearInterval(timer);
    }, [orderId]);

    if (!orderData) return <div>Loading...</div>; // Handle loading state

    const { checkoutItems, discount, paid, remaining, clientName, clientPhone, date } = orderData;

    return (
        <>
         <Navbar isAdmin={isAdmin} />
        
        <div id='order-receipt-container'>
        
            <div id="printable-section">
                <div>
                    <p>Tarek Phones</p> {/* Added Store Name */}
                    <p>{localStorage.getItem("branchName") || "فرع افتراضي"}</p>
                    <p>البائع: {localStorage.getItem("salesName") || "بائع افتراضي"}</p>
                    <p>التاريخ: {date || new Date().toLocaleDateString()}</p>
                    <p>الوقت: {currentTime}</p>
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
                        {checkoutItems.map((item, index) => (
                            <tr key={index}>
                                <td>{item.barcode}</td>
                                <td>{item.name}</td>
                                <td>{item.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div>
                    <p>إجمالي المبلغ: {orderData.totalAmount}</p>
                    <p>الخصم: {discount}</p>
                    <p>إجمالي المبلغ بعد الخصم: {orderData.totalAfterDiscount}</p>
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
