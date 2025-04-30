import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/SupplierInvoices.css';

const SupplierInvoices = () => {
    const { supplierId } = useParams();
    // eslint-disable-next-line no-unused-vars
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [supplierName, setSupplierName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    // eslint-disable-next-line no-unused-vars
    const [totalInvoices, setTotalInvoices] = useState(0);
    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const limit = 30;

    const API_URL = process.env.REACT_APP_API_URL;
    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch invoices with pagination
                const response = await axios.get(`${API_URL}/api/productinvoice/supplier/${supplierId}`, {
                    params: {
                        page,
                        limit,
                        startDate: startDate || null,
                        endDate: endDate || null
                    }
                });

                setInvoices(response.data.invoices);
                setTotalInvoices(response.data.totalInvoices);
                setTotalPages(response.data.totalPages);

                // Apply status filter
                if (invoiceStatusFilter === 'all') {
                    setFilteredInvoices(response.data.invoices);
                } else {
                    setFilteredInvoices(response.data.invoices.filter(
                        invoice => invoice.invoiceStatus === invoiceStatusFilter
                    ));
                }

                // Fetch supplier name
                const storedSupplierId = localStorage.getItem('supplierId'); 
                if (storedSupplierId) {
                    const supplierResponse = await axios.get(`${API_URL}/api/suppliers/${storedSupplierId}`);
                    setSupplierName(supplierResponse.data.name);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [supplierId, page, invoiceStatusFilter, startDate, endDate, API_URL]);

    const handleFilterChange = (status) => {
        setInvoiceStatusFilter(status);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleDateFilter = () => {
        setPage(1);
    };

    // Convert numbers to Arabic numerals
    const toArabicNumbers = (num) => {
        const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return num.toString().replace(/\d/g, (digit) => arabicNumerals[digit]);
    };

    return (
        <>
            <Navbar isAdmin={isAdmin} />
            <div className="supplierinvoice-container">
                <h2 className="supplierinvoice-title">فواتير المورد: {supplierName || 'جاري التحميل...'}</h2>

                {/* Date Filter */}
                <div className="supplierinvoice-date-filter">
                    <label>من:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        onBlur={handleDateFilter}
                    />
                    <label>إلى:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        onBlur={handleDateFilter}
                    />
                </div>

                {/* Filter Buttons */}
                <div className="supplierinvoice-buttons">
                    <button 
                        className={`filter-btn ${invoiceStatusFilter === 'خالص' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('خالص')}
                    >
                        عرض الفواتير خالص
                    </button>
                    <button 
                        className={`filter-btn ${invoiceStatusFilter === 'غير خالص' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('غير خالص')}
                    >
                        عرض الفواتير غير خالص
                    </button>
                    <button 
                        className={`reset-btn ${invoiceStatusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        عرض كل الفواتير
                    </button>
                </div>

                {isLoading ? (
                    <p className="supplierinvoice-loading">جاري تحميل الفواتير...</p>
                ) : filteredInvoices.length === 0 ? (
                    <p className="supplierinvoice-noData">لا توجد فواتير متاحة.</p>
                ) : (
                    <>
                        <div className="supplierinvoice-table-container">
                            <table className="supplierinvoice-table">
                                <thead>
                                    <tr>
                                        <th>اسم المنتج</th>
                                        <th>الباركود</th>
                                        <th>سعر الشراء</th>
                                        <th>المبلغ المدفوع</th>
                                        <th>المتبقي</th>
                                        <th>حالة الفاتورة</th>
                                        <th>الفرع</th>
                                        <th>التاريخ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvoices.map((invoice) => (
                                        <tr key={invoice._id}>
                                            <td>{invoice.productName}</td>
                                            <td>{invoice.productBarcode}</td>
                                            <td>{toArabicNumbers(invoice.purchasePrice)} ج.م</td>
                                            <td>{toArabicNumbers(invoice.amountPaid)} ج.م</td>
                                            <td>{toArabicNumbers(invoice.remaining)} ج.م</td>
                                            <td className={`supplierinvoice-status ${invoice.invoiceStatus === 'خالص' ? 'paid' : 'unpaid'}`}>
                                                {invoice.invoiceStatus}
                                            </td>
                                            <td>{invoice.branch}</td>
                                            <td>{new Date(invoice.createdAt).toLocaleDateString('ar-EG')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="supplierinvoice-pagination">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="supplierinvoice-pagination-button"
                            >
                                السابق
                            </button>
                            
                            <span className="supplierinvoice-page-info">
                                الصفحة {toArabicNumbers(page)} من {toArabicNumbers(totalPages)}
                            </span>
                            
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="supplierinvoice-pagination-button"
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

export default SupplierInvoices;