import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import '../../styles/SellingTransaction.css';
import { useNavigate } from 'react-router-dom';

const SellingTransaction = () => {
    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';
    const branchId = localStorage.getItem('branchId');
    const API_URL = process.env.REACT_APP_API_URL;

    const navigate = useNavigate();
    const barcodeInputRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [orderData, setOrderData] = useState({
        barcode: '',
        itemName: '',
        itemDescription: '',
        purchasePrice: 0,
    });
    const [selectedSn, setSelectedSn] = useState({}); // Track selected SNs for each product
    const [errorMessage, setErrorMessage] = useState('');
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const limit = 5;

    useEffect(() => {
        if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
        }

        const fetchOrders = async () => {
            setLoading(true);
            const today = new Date();
            const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
            const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();

            try {
                const response = await axios.get(`http://localhost:4321/api/day_orders`, {
                    params: { branchId, startDate, endDate, limit, page: currentPage },
                });
                setOrders(response.data.orders);
                setTotalPages(response.data.totalPages);
                setCurrentPage(response.data.currentPage);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [branchId, currentPage, API_URL]);

    const handleInputChange = (e) => {
        setOrderData((prevData) => ({
            ...prevData,
            barcode: e.target.value,
        }));
        setErrorMessage('');
    };

    const handleBarcodeInput = async (e) => {
        if (e.key === 'Enter') {
            const scannedBarcode = orderData.barcode.trim();

            if (!/^\d*$/.test(scannedBarcode)) {
                setErrorMessage('الباركود يجب أن يكون رقمًا');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:4321/api/products/${scannedBarcode}`, {
                    params: { branchId },
                });

                if (response.data) {
                    const productData = response.data;

                    if (productData.quantity > 0) {
                        const product = {
                            barcode: scannedBarcode,
                            name: productData.name,
                            description: productData.description || '',
                            purchasePrice: productData.purchasePrice,
                            sellingPrice: productData.sellingPrice,
                            sn: productData.sn || [], // Include SN array
                            selectedSn: '' // Initialize selected SN
                        };

                        // Initialize selected SN for this product
                        setSelectedSn(prev => ({
                            ...prev,
                            [scannedBarcode]: productData.sn?.[0] || ''
                        }));

                        setProducts((prevProducts) => [...prevProducts, product]);
                        setOrderData({ barcode: '', itemName: '', itemDescription: '', sellingPrice: 0 });
                        setErrorMessage('');
                    } else {
                        setErrorMessage('لا توجد كمية كافية لهذا المنتج في المخزن');
                    }
                } else {
                    setErrorMessage('خطأ في الباركود، برجاء المحاولة مرة أخرى');
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setErrorMessage('منتج غير موجود، برجاء مراجعة الباركود');
                } else {
                    setErrorMessage('هناك خطأ، برجاء المحاولة مرة أخرى');
                }
            } finally {
                if (barcodeInputRef.current) {
                    barcodeInputRef.current.focus();
                }
            }
        }
    };

    const handleSnChange = (barcode, value) => {
        setSelectedSn(prev => ({
            ...prev,
            [barcode]: value
        }));
    };

    const totalAmount = products.reduce((total, product) => total + product.sellingPrice, 0);

    const handleCheckout = () => {
        const isBankOpen = localStorage.getItem('bankOpen') === 'true';

        if (!isBankOpen) {
            alert('الدرج مغلق، يرجى الرجوع إلى الصفحة الرئيسية لفتح الدرج أولاً');
            return;
        }

        if (!products || products.length === 0) {
            alert('برجاء إضافة منتج');
            return;
        }

    // Prepare products with selected SN
    const productsWithSn = products.map(product => {
        // Get the selected SN and ensure it's a string
        const selectedSnValue = selectedSn[product.barcode];
        const snValue = Array.isArray(selectedSnValue) ? selectedSnValue[0] : selectedSnValue;

        return {
            ...product,
            sn: snValue || null, // Store as string or null
            selectedSn: snValue || null // Also keep in selectedSn for consistency
        };
    });

    sessionStorage.setItem('checkoutItems', JSON.stringify(productsWithSn));
        setProducts([]);
        setSelectedSn({});
        navigate('/checkout');
    };

    const removeProduct = (index) => {
        const productToRemove = products[index];
        setProducts((prevProducts) => prevProducts.filter((_, i) => i !== index));
        
        // Remove the selected SN for this product
        setSelectedSn(prev => {
            const newSelectedSn = {...prev};
            delete newSelectedSn[productToRemove.barcode];
            return newSelectedSn;
        });
    };

    const viewOrderDetails = (orderId) => {
        navigate(`/order-receipt/${orderId}`);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
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
                        <div className="selling-transaction-products-container">
                            <table className="selling-transaction-product-table">
                                <thead>
                                    <tr>
                                        <th>باركود</th>
                                        <th>اسم المنتج</th>
                                        <th>سعر الشراء</th>
                                        <th>سعر البيع</th>
                                        <th>السريال</th>
                                        <th>عمليات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => (
                                        <tr key={index}>
                                            <td>{product.barcode}</td>
                                            <td>{product.name}</td>
                                            <td>{product.purchasePrice} EGP</td>
                                            <td>{product.sellingPrice} EGP</td>
                                            <td>
                                                {product.sn && product.sn.length > 0 ? (
                                                    <select
                                                        value={selectedSn[product.barcode] || ''}
                                                        onChange={(e) => handleSnChange(product.barcode, e.target.value)}
                                                    >
                                                        <option value="">اختر السريال</option>
                                                        {product.sn.map((sn, i) => (
                                                            <option key={i} value={sn}>{sn}</option>
                                                        ))}
                                                    </select>
                                                ) : 'لا يوجد'}
                                            </td>
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
                        </div>

                        <div className="selling-transaction-total-amount">اجمالي المبلغ: {totalAmount} EGP</div>
                        <button onClick={handleCheckout} className="selling-transaction-checkout-btn">
                            اتمام البيع
                        </button>
                    </>
                )}

                <h2>الفواتير اليومية</h2>
                {loading ? (
                    <p>جاري تحميل فواتير اليوم...</p>
                ) : orders.length > 0 ? (
                    <>
                        <div className="selling-transaction-orders-container">
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
                        </div>

                        <div className="selling-transaction-pagination-container">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="selling-transaction-pagination-btn"
                                disabled={currentPage === 1}
                            >
                                السابق
                            </button>

                            <span className="selling-transaction-pagination-info">
                                صفحة {currentPage} من {totalPages}
                            </span>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="selling-transaction-pagination-btn"
                            >
                                التالي
                            </button>
                        </div>
                    </>
                ) : (
                    <p>لا توجد فواتير اليوم</p>
                )}

                <button
                    onClick={() => navigate('/all-orders')}
                    className="selling-transaction-all-orders-btn"
                >
                    جميع الفواتير
                </button>
            </div>
        </>
    );
};

export default SellingTransaction;