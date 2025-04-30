import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ProductInvoicesList.css";
import Navbar from './Navbar';

const role = localStorage.getItem('role');
const isAdmin = role === 'admin';

const ProductInvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");
  const branchId = localStorage.getItem("branchId") || null;
  const limit = 30;
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4321";


  useEffect(() => {
    fetchInvoices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, branchId, invoiceStatusFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/productinvoice`, {
        params: {
          page,
          limit,
          branchId,
          search: searchQuery.trim(),
          startDate: startDate || null,
          endDate: endDate || null,
        },
      });

      setInvoices(response.data.invoices);
      setTotalInvoices(response.data.totalInvoices);
      setTotalPages(Math.ceil(response.data.totalInvoices / limit));
      
      // Apply status filter
      if (invoiceStatusFilter === 'all') {
        setFilteredInvoices(response.data.invoices);
      } else {
        setFilteredInvoices(response.data.invoices.filter(
          invoice => invoice.invoiceStatus === invoiceStatusFilter
        ));
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchInvoices();
  };

  const handleFilterChange = (status) => {
    setInvoiceStatusFilter(status);
    setPage(1);
    
    if (status === 'all') {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(invoices.filter(invoice => invoice.invoiceStatus === status));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Convert numbers to Arabic numerals
  const toArabicNumbers = (num) => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/\d/g, (digit) => arabicNumerals[digit]);
  };

  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <div className="productInvoice-container">
        <h2 className="productInvoice-title">قائمة فواتير المنتجات للفرع</h2>

        <div className="productInvoice-searchContainer">
          <input
            type="text"
            placeholder="امسح الباركود هنا..."
            className="productInvoice-searchInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          
          <div className="productInvoice-dateContainer">
            <label className="dateLabel">من</label>
            <input
              type="date"
              className="productInvoice-dateInput"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label className="dateLabel">الي</label>
            <input
              type="date"
              className="productInvoice-dateInput"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <button className="productInvoice-searchButton" onClick={handleSearch}>بحث</button>
        </div>

        {/* أزرار الفلترة */}
        <div className="productInvoice-buttons">
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

        {loading ? (
          <p className="productInvoice-loading">جاري تحميل فواتير منتجات الفرع...</p>
        ) : filteredInvoices.length === 0 ? (
          <p className="productInvoice-noData">لا يوجد فواتير منتجات لدي الفرع</p>
        ) : (
          <>
            <div className="productInvoice-table-container"> 
              <table className="productInvoice-table">
                <thead>
                  <tr>
                    <th>المنتج</th>
                    <th>الباركود</th>
                    <th>المورد</th>
                    <th>السعر</th>
                    <th>المدفوع</th>
                    <th>المتبقي</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td>{invoice.productName}</td>
                      <td>{invoice.productBarcode}</td>
                      <td>{invoice.supplier?.name || "N/A"}</td>
                      <td>{toArabicNumbers(invoice.purchasePrice)} ج.م</td>
                      <td>{toArabicNumbers(invoice.amountPaid)} ج.م</td>
                      <td>{toArabicNumbers(invoice.moneyOwed)} ج.م</td>
                      <td className={invoice.invoiceStatus === "خالص" ? "productInvoice-statusPaid" : "productInvoice-statusDue"}>
                        {invoice.invoiceStatus}
                      </td>
                      <td>{new Date(invoice.createdAt).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="productInvoice-pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="productInvoice-pagination-button"
              >
                السابق
              </button>
              
              <span className="productInvoice-page-info">
                الصفحة {toArabicNumbers(page)} من {toArabicNumbers(totalPages)}
              </span>
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="productInvoice-pagination-button"
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

export default ProductInvoicesList;