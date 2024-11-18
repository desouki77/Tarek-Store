import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import "../styles/Sales.css";
import Loader from "./Loader";

const Sales = () => {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const role = localStorage.getItem('role'); // Get role from localStorage

    useEffect(() => {
        if (role === 'admin') { // Fetch data only if the user is an admin
            const fetchSalesData = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/api/users');
                    console.log(response.data);  // Log the response
                    setSalesData(response.data); // Set the data to salesData state
                } catch (err) {
                    console.error('Error fetching data:', err);  // Log the error
                    setError('Failed to fetch sales data');
                } finally {
                    setLoading(false);
                }
            };
            fetchSalesData();
        } else {
            setLoading(false); // No need to fetch data if not an admin
        }
    }, [role]); // Make sure the effect runs when role changes

    // Handle delete
    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/users/${id}`)
            // Remove the deleted user from the state
            if (response.status === 200) {
                const updatedSalesData = salesData.filter(sale => sale._id !== id);
                setSalesData(updatedSalesData);
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Failed to delete the user');
        }
    };
    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <>
        <Navbar isAdmin={role === 'admin'} /> 
        
        <div className="sales-container">
            <h2>موظفين المبيعات</h2>
            <table className="sales-table">
                <thead>
                    <tr>
                        <th>اسم موظف المبيات</th>
                        <th>رقم الموبايل</th>
                        <th>تاريخ التسجيل</th>
                        <th>عمليات</th>
                    </tr>
                </thead>
                <tbody>
                    {salesData.map(sale => (
                        <tr key={sale._id}> 
                            <td>{sale.username}</td>
                            <td>{sale.phone}</td>
                            <td>{sale.createdAt}</td>
                            <td>
                                <button
                                    onClick={() => handleDelete(sale._id)}
                                    className="sales-delete-btn"
                                >
                                    مسح
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    );
};

export default Sales;
