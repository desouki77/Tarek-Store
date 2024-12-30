import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // استيراد useNavigate
import Navbar from '../Navbar';
import '../../styles/AllOrders.css';
import Loader from '../Loader';

const AllOrders = () => {
    const navigate = useNavigate(); // تعريف navigate

    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';

    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchAllOrders = async () => {
            setLoading(true);
            try {
                const branchId = localStorage.getItem('branchId');
                let url = `https://tarek-store-backend.onrender.com/api/orders?branchId=${branchId}&page=${currentPage}&limit=20`;

                // Add date filters if provided
                if (startDate && endDate) {
                    url += `&startDate=${startDate}&endDate=${endDate}`;
                }

                const response = await axios.get(url);
                setAllOrders(response.data.orders);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error('Error fetching all orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllOrders();
    }, [startDate, endDate, currentPage]);

    if (loading) return <Loader />;

    const viewOrderDetails = (orderId) => {
        navigate(`/order-receipt/${orderId}`);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <Navbar isAdmin={isAdmin} />
            <div className="all-orders-container">
                <h1>جميع الفواتير لدي الفرع</h1>

                {/* Date Filter */}
                <div className="all-orders-date-filter">
                    <label style={{ marginTop: "12px" }}>من يوم:</label>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="all-orders-date-input"
                    />
                    <label style={{ marginTop: "12px" }}>الي يوم:</label>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="all-orders-date-input"
                    />
                </div>

                {/* Conditional Rendering of Table and Pagination */}
                {allOrders.length > 0 ? (
                    <>
                        <div className="all-orders-table-container">
                            <table className="all-orders-table">
                                <thead>
                                    <tr>
                                        <th>رقم الفاتورة</th>
                                        <th>اجمالي المبلغ</th>
                                        <th>التاريخ والوقت</th>
                                        <th>الفواتير</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allOrders.map((order) => (
                                        <tr key={order._id}>
                                            <td>{order._id}</td>
                                            <td>{order.paid ? `${order.paid} EGP` : 'N/A'}</td>
                                            <td>{new Date(order.createdAt).toLocaleString()}</td>
                                            <td>
                                                <button 
                                                    onClick={() => viewOrderDetails(order._id)} 
                                                    className="all-orders-button"
                                                >
                                                    عرض الفاتورة
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="all-orders-pagination">
                            <button 
                                className="all-orders-pagination-button"
                                disabled={currentPage === 1} 
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                السابق
                            </button>
                            <span>الصفحة {currentPage} من {totalPages}</span>
                            <button 
                                className="all-orders-pagination-button"
                                disabled={currentPage === totalPages} 
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                التالي
                            </button>
                        </div>
                    </>
                ) : (
                    <p style={{ textAlign: "center", marginTop: "20px" }}>لا توجد فواتير حاليا</p>
                )}
            </div>
        </>
    );
};

export default AllOrders;
