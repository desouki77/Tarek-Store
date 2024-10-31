// AllOrders.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';


const AllOrders = () => {

    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';

    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAllOrders = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/api/orders');
                setAllOrders(response.data);
            } catch (error) {
                console.error('Error fetching all orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllOrders();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <>
        <Navbar isAdmin={isAdmin} />
        
        <div>
            <h1>All Orders</h1>
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Total Amount</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {allOrders.map((order) => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.paid ? `${order.paid} EGP` : 'N/A'}</td>
                            <td>{new Date(order.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    );
};

export default AllOrders;
