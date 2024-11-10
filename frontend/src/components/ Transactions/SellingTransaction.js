import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import '../../styles/SellingTransaction.css';
import { useNavigate } from 'react-router-dom';

const SellingTransaction = () => {
    const role = localStorage.getItem('role');
    const branchId = localStorage.getItem('branchId');
    const isAdmin = role === 'admin';

    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [orderData, setOrderData] = useState({
        barcode: '',
        itemName: '',
        itemDescription: '',
        price: 0,
    });
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 2;
    const [errorMessage, setErrorMessage] = useState('');
    const [lastOrders, setLastOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLastOrders = async () => {
            setLoading(true);
            try {
                const today = new Date();
                const startDate = today.toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
                const endDate = startDate; // Same as startDate for today
        
                const response = await axios.get(`http://localhost:5000/api/orders?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`);
                
                console.log('Response data:', response.data);
        
                if (response.data && response.data.orders && Array.isArray(response.data.orders)) {
                    const todaysOrders = response.data.orders.filter(order => {
                        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                        return orderDate === startDate;
                    });
                    setLastOrders(todaysOrders);
                    setTotalPages(Math.ceil(todaysOrders.length / itemsPerPage));
                } else {
                    console.error('Orders not found or wrong response structure:', response.data);
                }
            } catch (error) {
                console.error('Error fetching last orders:', error);
            } finally {
                setLoading(false);
            }
        };
        
    
        fetchLastOrders();  // Fetch last orders on initial load
    }, [branchId]);
    

    const handleBarcodeChange = async (e) => {
        const scannedBarcode = e.target.value;
    
        if (!/^\d*$/.test(scannedBarcode)) {
            setErrorMessage('Barcode must be numeric.');
            return;
        }
    
        setOrderData((prevData) => ({
            ...prevData,
            barcode: scannedBarcode,
        }));
    
        if (scannedBarcode === '') {
            setErrorMessage('');
            return;
        }
    
        try {
            const response = await axios.get(`http://localhost:5000/api/products/${scannedBarcode}`, {
                params: { branchId }
            });
    
            if (response.data) {
                const product = {
                    barcode: scannedBarcode,
                    name: response.data.name,
                    description: response.data.description || '',
                    price: response.data.price,
                };
                setProducts((prevProducts) => [...prevProducts, product]);
                setOrderData({ barcode: '', itemName: '', itemDescription: '', price: 0 });
                setErrorMessage('');
            } else {
                setErrorMessage('Invalid barcode. Please try again.');
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setErrorMessage('Product not found. Please check the barcode.');
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
        }
    };

    const totalAmount = products.reduce((total, product) => total + product.price, 0);

    const handleCheckout = async () => {
        if (!products || products.length === 0) {
            alert("برجاء اضافة منتج");
            return;
        }

        try {
            // Clear products after checkout is processed
            setProducts([]);

            // Store the checkout items in sessionStorage
            sessionStorage.setItem('checkoutItems', JSON.stringify(products));

            // Open checkout window
            const checkoutWindow = window.open('/checkout', '_blank');
            if (checkoutWindow) {
                checkoutWindow.opener = null;
            }
        } catch (error) {
            console.error('Error during checkout:', error);
        }
    };

    const removeProduct = (index) => {
        setProducts((prevProducts) => prevProducts.filter((_, i) => i !== index));
    };

    const viewOrderDetails = (orderId) => {
        navigate(`/order-receipt/${orderId}`);
    };

    const startIndex = currentPage * itemsPerPage;
    const currentOrders = lastOrders.slice(startIndex, startIndex + itemsPerPage);

    return (
        <>
        <Navbar isAdmin={isAdmin} />
        <div className="selling-transaction-container">
            <input
                type="text"
                className="barcode-input"
                value={orderData.barcode}
                onChange={handleBarcodeChange}
                placeholder="باركود"
                required
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
    
            <table className="product-table">
                <thead>
                    <tr>
                        <th>باركود</th>
                        <th>اسم المنتج</th>
                        <th>وصف</th>
                        <th>السعر</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={index}>
                            <td>{product.barcode}</td>
                            <td>{product.name}</td>
                            <td>{product.description}</td>
                            <td>{product.price} EGP</td>
                            <td>
                                <button onClick={() => removeProduct(index)} className="remove-btn">
                                    مسح
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
    
            <div className="total-amount">اجمالي المبلغ: {totalAmount} EGP</div>
            <button onClick={handleCheckout} className="checkout-btn">اتمام البيع</button>
    
            {loading && <p>Loading...</p>}
    
            {lastOrders.length > 0 && (
                <div className="last-orders">
                    <h2>مبيعات اليوم</h2>
                    
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>رقم الفاتورة</th>
                                <th>اجمالي المبلغ</th>
                                <th>التاريخ والوقت</th>
                                <th>فواتير</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>{order.paid ? `${order.paid} EGP` : 'N/A'}</td>
                                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                                    <td>
                                        <button onClick={() => viewOrderDetails(order._id)} className="invoice-btn">
                                            الفاتورة
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
    
                    <div className="pagination">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentPage(index)}
                                disabled={currentPage === index}
                                className={`page-button ${currentPage === index ? 'active' : ''}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}
    
            <button onClick={() => window.location.href = '/all-orders'} className="all-orders-btn">
                جميع الفواتير
            </button>
        </div>
        </>
    );
};

export default SellingTransaction;
