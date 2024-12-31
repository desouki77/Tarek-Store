import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import '../../styles/AllSalesReports.css'; // Importing the CSS file

function AllSalesReports() {
    const [reports, setReports] = useState([]);
    const [branches, setBranches] = useState([]); // تخزين الفروع
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // الصفحة الحالية
    const [totalPages, setTotalPages] = useState(1); // عدد الصفحات الكلي
    const [isLoading, setIsLoading] = useState(false); // حالة التحميل
    const [noReports, setNoReports] = useState(false); // حالة عدم وجود تقارير
    const role = localStorage.getItem('role'); // Get role from localStorage

    // جلب الفروع من الـ API
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await axios.get('https://tarek-store-backend.onrender.com/api/branches'); // API لجلب الفروع
                setBranches(response.data); // تخزين الفروع في الحالة
            } catch (err) {
                setError('Error fetching branches');
            }
        };
        fetchBranches();
    }, []);

    // جلب التقارير مع التصفية حسب الصفحة
    useEffect(() => {
        const fetchReports = async () => {
            setIsLoading(true); // بدء التحميل
            try {
                const response = await axios.get('https://tarek-store-backend.onrender.com/api/get-all-reports', {
                    params: {
                        page: currentPage,
                        limit: 6, // يمكنك تغيير العدد حسب الحاجة
                    },
                });
                setReports(response.data.reports); // تخزين التقارير
                setTotalPages(response.data.totalPages); // تخزين عدد الصفحات الكلي
                setNoReports(response.data.reports.length === 0); // التحقق إذا لم توجد تقارير
            } catch (err) {
                setError('Error fetching reports');
            } finally {
                setIsLoading(false); // إنهاء التحميل
            }
        };
        fetchReports();
    }, [currentPage]);

    // دالة للحصول على اسم الفرع بناءً على branchId
    const getBranchName = (branchId) => {
        if (!branchId) return 'جميع الفروع'; // إذا كان الفرع غير معرف أو فارغ نعرض "جميع الفروع"
        const branch = branches.find((b) => b._id === branchId);
        return branch ? branch.name : 'غير معروف';
    };

    // دوال التنقل بين الصفحات
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <>
            <Navbar isAdmin={role === 'admin'} />
            
            <div className="all-sales-reports-container">
                <h1>جميع التقارير</h1>
                {error && <div className="error-message">{error}</div>}
                
                {isLoading ? (
                    <p>جاري تحميل التقارير...</p> // عرض رسالة التحميل
                ) : noReports ? (
                    <p>لا توجد تقارير محفوظة</p> // عرض رسالة إذا لم توجد تقارير
                ) : (
                    <>
                        <div className="all-sales-reports-table-container">
                            <table className="sales-reports-table">
                                <thead>
                                    <tr>
                                        <th>اسم التقرير</th>
                                        <th>اسم الفرع</th> {/* إضافة عمود لاسم الفرع */}
                                        <th>إجمالي المبيعات</th>
                                        <th>عدد المنتجات المباعة</th>
                                        <th>إجمالي الخصومات</th>
                                        <th>عدد الطلبات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report._id}>
                                            <td>{report.reportName}</td>
                                            <td>{getBranchName(report.branchId)}</td> {/* استخدام الدالة للحصول على اسم الفرع */}
                                            <td>{report.totalSales} جنيه</td>
                                            <td>{report.totalItemsSold}</td>
                                            <td>{report.totalDiscounts} جنيه</td>
                                            <td>{report.orderCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="all-sales-respor-pagination">
                            <button 
                                className="all-sales-respor-pagination-btn"
                                onClick={handlePreviousPage} 
                                disabled={currentPage === 1}
                            >
                                السابق
                            </button>
                            <span className="all-sales-respor-pagination-info">
                                صفحة {currentPage} من {totalPages}
                            </span>
                            <button 
                                className="all-sales-respor-pagination-btn"
                                onClick={handleNextPage} 
                                disabled={currentPage === totalPages}
                            >
                                التالي
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default AllSalesReports;
