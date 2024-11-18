import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import '../../styles/AllOrders.css';
import Loader from '../Loader';

const AllOrders = () => {
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
                let url = `http://localhost:5000/api/orders?branchId=${branchId}&page=${currentPage}&limit=20`;
    
                // Add date filters if provided
                if (startDate && endDate) {
                    url += `&startDate=${startDate}&endDate=${endDate}`;
                }

    
                console.log("Fetching orders with URL:", url); // Debugging URL
                const response = await axios.get(url);
    
                // Debug the response to ensure you get totalPages
                console.log("Response from API:", response.data); // Check the structure of the response
    
                setAllOrders(response.data.orders);
                setTotalPages(response.data.totalPages); // Access pagination data directly
            } catch (error) {
                console.error('Error fetching all orders:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchAllOrders();
    }, [startDate, endDate, currentPage]); // Re-run effect when page or filters change
     // Re-run effect when page or filters change
     // Re-run effect when page or filters change

    if (loading) return <Loader />;

    const viewOrderDetails = (orderId) => {
        window.location.href = `/order-receipt/${orderId}`;
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
                    <label style={{marginTop:"12px"}}>من يوم:</label>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="all-orders-date-input"
                    />
                    <label style={{marginTop:"12px"}}>الي يوم:</label>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="all-orders-date-input"
                    />
                </div>

                {/* Table Container */}
                <div className="all-orders-table-container">
                    <table className="all-orders-table">
                        <thead>
                            <tr>
                                <th>رقم الفاتورة</th>
                                <th>اجمالي المبلغ</th>
                                <th>التاريخ والوقت</th>
                                <th>الفواتير </th>
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

                {/* Pagination Controls */}
                <div className="all-orders-pagination">
                    <button 
                        className="all-orders-pagination-button"
                        disabled={currentPage === 1} 
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Prev
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button 
                        className="all-orders-pagination-button"
                        disabled={currentPage === totalPages} 
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
};

export default AllOrders;
