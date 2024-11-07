import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams from react-router-dom
import axios from 'axios';
import Navbar from '../Navbar';


const OrderReceipt = () => {

    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';

    const { orderId } = useParams(); // Get the orderId from the URL parameters
    const [orderData, setOrderData] = useState(null);

    const [welcomeData, setWelcomeData] = useState({
        storeName: "Tarek Phones",
        branchName: "Default Branch",
        salesName: "Default Sales",
    });

    const [checkoutItems, setCheckoutItems] = useState([]);

    useEffect(() => {

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
        };

        fetchUserData();

        const items = sessionStorage.getItem('checkoutItems');
        if (items) {
            setCheckoutItems(JSON.parse(items));
        }

        // Fetch the order data from the API using the provided orderId
        const fetchOrderData = async () => {
            if (!orderId) return; // Exit if orderId is not defined

            try {
               
                const response = await axios.get(`http://localhost:5000/api/orders/${orderId}?branchId=${branchId}`);
                setOrderData(response.data);
            } catch (error) {
                console.error('Error fetching order data:', error);
            }
        };

        fetchOrderData();
      
    }, [orderId]);

    if (!orderData) return <div>Loading...</div>; // Handle loading state

    const {  discount, paid, remaining, clientName, clientPhone} = orderData;
    const totalAmount = checkoutItems.reduce((total, item) => total + item.price, 0);
    const totalAfterDiscount = totalAmount - Number(discount); // Calculate total after discount

    return (
        <>
         <Navbar isAdmin={isAdmin} />
        
        <div id='order-receipt-container'>
        
            <div id="printable-section">
                <div>
                <p>{welcomeData.storeName}</p>
                  <p>{welcomeData.branchName}</p>
                  <p>{welcomeData.salesName}</p>
                  <p>Date: {orderData.date}</p>
                  <p>Time: {orderData.time}</p>
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
