import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import "../styles/Sales.css";
import Loader from "./Loader";

const Sales = () => {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10; // Number of items per page
    const role = localStorage.getItem('role'); // Get role from localStorage

    const fetchSalesData = useCallback(async (page) => {
        if (role !== 'admin') {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('http://localhost:5000/api/users', {
                params: { page, limit },
            });

            setSalesData(response.data.users); // Assuming API returns an array of users in `users`
            setTotalPages(response.data.totalPages); // Assuming API provides total pages
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to fetch sales data');
        } finally {
            setLoading(false);
        }
    }, [role, limit]);

    useEffect(() => {
        fetchSalesData(currentPage);
    }, [fetchSalesData, currentPage]);

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/users/${id}`);
            if (response.status === 200) {
                const updatedSalesData = salesData.filter(sale => sale._id !== id);
                setSalesData(updatedSalesData);
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Failed to delete the user');
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
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
                            <th>اسم موظف المبيعات</th>
                            <th>رقم الموبايل</th>
                            <th>المرتب</th>
                            <th>تاريخ التسجيل</th>
                            <th>حذف</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesData.map(sale => (
                            <tr key={sale._id}>
                                <td>{sale.username}</td>
                                <td>{sale.phone}</td>
                                <td>{sale.salary}</td>
                                <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        onClick={() => handleDelete(sale._id)}
                                        className="sales-delete-btn"
                                    >
                                        حذف
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        السابق
                    </button>
                    <span>الصفحة {currentPage} من {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        التالي
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sales;
