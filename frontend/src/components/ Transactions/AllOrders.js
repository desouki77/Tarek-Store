import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import '../../styles/AllOrders.css'

const AllOrders = () => {

    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';

    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const fetchAllOrders = async () => {
            setLoading(true);
            try {
                const branchId = localStorage.getItem('branchId');
                let url = `http://localhost:5000/api/orders?branchId=${branchId}`;

                // Add date filters if provided
                if (startDate && endDate) {
                    url += `&startDate=${startDate}&endDate=${endDate}`;
                }

                console.log("Fetching orders with URL:", url); // Debugging URL
                const response = await axios.get(url);
                setAllOrders(response.data);
            } catch (error) {
                console.error('Error fetching all orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllOrders();
    }, [startDate, endDate]); // Re-run effect when date changes

    if (loading) return <p>Loading...</p>;

    const viewOrderDetails = (orderId) => {
        window.location.href = `/order-receipt/${orderId}`;
    };

    return (
        <>
            <Navbar isAdmin={isAdmin} />
            <div>
                <h1>All Orders</h1>
                
                {/* Date Filter */}
                <div className="date-filter">
                    <label>Start Date:</label>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="date-input"
                    />
                    <label>End Date:</label>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="date-input"
                    />
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Total Amount</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allOrders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id}</td>
                                <td>{order.paid ? `${order.paid} EGP` : 'N/A'}</td>
                                <td>{new Date(order.createdAt).toLocaleString()}</td>
                                <td>
                                    <button onClick={() => viewOrderDetails(order._id)}>View Receipt</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default AllOrders;
