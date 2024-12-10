import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import '../../styles/SellingTransaction.css';
import { useNavigate } from 'react-router-dom';

const SellingTransaction = () => {
    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';
    const branchId = localStorage.getItem('branchId');

    const navigate = useNavigate();
    const barcodeInputRef = useRef(null); // Ref for the barcode input field
    const [products, setProducts] = useState([]);
    const [orderData, setOrderData] = useState({
        barcode: '',
        itemName: '',
        itemDescription: '',
        price: 0,
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [orders, setOrders] = useState([]); // To store the fetched orders of the day

    // Fetch today's orders when the component mounts
    useEffect(() => {
        if (barcodeInputRef.current) {
            barcodeInputRef.current.focus(); // Automatically focus on the barcode input
        }

        const fetchOrders = async () => {
            const today = new Date();
            const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString(); // Start of today
            const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString(); // End of today

            try {
                const response = await axios.get('http://localhost:5000/api/day_orders', {
                    params: { branchId, startDate, endDate },
                });
                setOrders(response.data.orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, [branchId]);

    const handleInputChange = (e) => {
        setOrderData((prevData) => ({
            ...prevData,
            barcode: e.target.value,
        }));
        setErrorMessage(''); // Clear error while typing
    };

    const handleBarcodeInput = async (e) => {
        if (e.key === 'Enter') {
            const scannedBarcode = orderData.barcode.trim();

            if (!/^\d*$/.test(scannedBarcode)) {
                setErrorMessage('Barcode must be numeric.');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/api/products/${scannedBarcode}`, {
                    params: { branchId },
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
            } finally {
                if (barcodeInputRef.current) {
                    barcodeInputRef.current.focus(); // Refocus for the next action
                }
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
            setProducts([]);
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
        navigate(`/order-receipt/${orderId}`);
    };

    return (
        <>
            <Navbar isAdmin={isAdmin} />
            <div className="selling-transaction-container">
                <input
                    type="text"
                    className="selling-transaction-barcode-input"
                    ref={barcodeInputRef}
                    value={orderData.barcode}
                    onChange={handleInputChange}
                    onKeyDown={handleBarcodeInput}
                    placeholder="باركود"
                    required
                />
                {errorMessage && <p className="selling-transaction-error-message">{errorMessage}</p>}

                {products.length > 0 && (
                    <>
                        <table className="selling-transaction-product-table">
                            <thead>
                                <tr>
                                    <th>باركود</th>
                                    <th>اسم المنتج</th>
                                    <th>وصف</th>
                                    <th>السعر</th>
                                    <th>عمليات</th>
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
                                            <button
                                                onClick={() => removeProduct(index)}
                                                className="selling-transaction-remove-btn"
                                            >
                                                مسح
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="selling-transaction-total-amount">اجمالي المبلغ: {totalAmount} EGP</div>
                        <button onClick={handleCheckout} className="selling-transaction-checkout-btn">
                            اتمام البيع
                        </button>
                    </>
                )}

             

                {/* Display Orders of the Day */}
                <h2>الفواتير اليومية</h2>
                {orders.length > 0 ? (
                    <table className="selling-transaction-orders-table">
                        <thead>
                            <tr>
                                <th>رقم الفاتورة</th>
                                <th>المبلغ الكلي</th>
                                <th>التاريخ والوقت</th>
                                <th>إيصال</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>{order.paid} EGP</td>
                                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                                    <td>
                                        <button
                                            onClick={() => viewOrderDetails(order._id)}
                                            className="selling-transaction-receipt-btn"
                                        >
                                            عرض الإيصال
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>لا توجد فواتير اليوم</p> // No orders for the day
                )}

                <div>
                    <button
                        onClick={() => (window.location.href = '/all-orders')}
                        className="selling-transaction-all-orders-btn"
                    >
                        جميع الفواتير
                    </button>
                </div>
            </div>
        </>
    );
};

export default SellingTransaction;
