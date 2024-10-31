import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import '../../styles/SellingTransaction.css';

const SellingTransaction = () => {
    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';

    const [products, setProducts] = useState([]);
    const [orderData, setOrderData] = useState({
        barcode: '',
        itemName: '',
        itemDescription: '',
        price: 0,
    });
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 2; // Number of items to display per page
    const [errorMessage, setErrorMessage] = useState('');
    const [lastOrders, setLastOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(0); // Total number of pages
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch all orders on component mount
        const fetchLastOrders = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/api/orders');
                console.log('Last orders response:', response.data);
                if (response.data) {
                    const today = new Date();
                    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const todayEnd = new Date(todayStart);
                    todayEnd.setDate(todayEnd.getDate() + 1); // Move to the next day

                    // Filter orders to get only today's orders
                    const todaysOrders = response.data.filter(order => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate >= todayStart && orderDate < todayEnd;
                    });
                    setLastOrders(todaysOrders);
                    setTotalPages(Math.ceil(todaysOrders.length / itemsPerPage)); // Calculate total pages
                }
            } catch (error) {
                console.error('Error fetching last orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLastOrders();
    }, []);

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
            const response = await axios.get(`http://localhost:5000/api/products/${scannedBarcode}`);
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
        // Check if the barcode input is empty
        if (products.length === 0) {
            setErrorMessage('Please scan at least one product before checking out.');
            return; // Exit the function if no products are added
        }

        try {
            // After submitting the order, fetch all orders again
            sessionStorage.setItem('checkoutItems', JSON.stringify(products));
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
        window.location.href = `/order-receipt/${orderId}`;
    };

    // Calculate the orders to display for the current page
    const startIndex = currentPage * itemsPerPage;
    const currentOrders = lastOrders.slice(startIndex, startIndex + itemsPerPage);
    const isCheckoutDisabled = products.length === 0 || errorMessage !== '';

    
    return (
        <div>
            <Navbar isAdmin={isAdmin} />
            <input
                type="text"
                value={orderData.barcode}
                onChange={handleBarcodeChange}
                placeholder="Scan Barcode"
                required
            />
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <table>
                <thead>
                    <tr>
                        <th>Scanned Barcode</th>
                        <th>اسم المنتج</th>
                        <th>وصف</th>
                        <th>السعر</th>
                        <th>مسح</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={index}>
                            <td>{product.barcode}</td>
                            <td>{product.name}</td>
                            <td>{product.description}</td>
                            <td>{product.price}</td>
                            <td><button onClick={() => removeProduct(index)}>مسح</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <p>Total Amount: {totalAmount}</p>
                <button onClick={handleCheckout} disabled={isCheckoutDisabled}>Checkout</button>
            </div>

            {/* Display All Last Orders as a Table with Pagination */}
            {loading ? (
                <p>Loading...</p>
            ) : (
                lastOrders.length > 0 && (
                    <div className="last-orders" style={{ marginTop: '2rem' }}>
                        <h2>Last Orders Details</h2>
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
                                {currentOrders.map((order) => (
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

                        {/* Pagination Controls */}
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
                        <button onClick={() => window.location.href = '/all-orders'}>View All Orders</button>

                    </div>
                )
            )}
        </div>
    );
};

export default SellingTransaction;
