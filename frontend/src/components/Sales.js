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
    const limit = 7; // Number of items per page
    const role = localStorage.getItem('role'); // Get role from localStorage

    const fetchSalesData = useCallback(async (page) => {
        if (role !== 'admin') {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('https://tarek-store-backend.onrender.com/api/users', {
                params: { page, limit },
            });

            setSalesData(response.data.users || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('لا يوجد موظفين! برجاء تسجيل موظف جديد');
        } finally {
            setLoading(false);
        }
    }, [role, limit]);

    useEffect(() => {
        fetchSalesData(currentPage);
    }, [fetchSalesData, currentPage]);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('هل أنت متأكد أنك تريد حذف هذا الموظف؟'); // Confirmation in Arabic
        if(confirmDelete) {
        try {
            const response = await axios.delete(`https://tarek-store-backend.onrender.com/api/users/${id}`);
            if (response.status === 200) {
                const updatedSalesData = salesData.filter(sale => sale._id !== id);
                setSalesData(updatedSalesData);
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Failed to delete the user');
        }
    }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <>
            <Navbar isAdmin={role === 'admin'} />
            <div className="sales-container">
                <h2>موظفين المبيعات</h2>
                {loading ? (
                    <Loader />
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : salesData.length === 0 ? (
                    <p>لا يوجد موظفين</p>
                ) : (
                    <>
                    <div className="sales-table-container">
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
                    </div>
                        <div className="sales-pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="sales-pagination-button"
                            >
                                السابق
                            </button>
                            <span>الصفحة {currentPage} من {totalPages}</span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="sales-pagination-button"
                            >
                                التالي
                            </button>
                        </div>
                       
                    </>
                )}
            </div>
        </>
    );
};

export default Sales;
