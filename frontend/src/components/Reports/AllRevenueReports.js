import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import { useNavigate } from 'react-router-dom';
import '../../styles/AllRevenueReports.css';

function AllRevenueReports() {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false); // حالة التحميل
    const [noReports, setNoReports] = useState(false); // حالة عدم وجود تقارير
    const reportsPerPage = 5; // استخدم فقط القيمة الثابتة هنا
    const role = localStorage.getItem('role'); // Get role from localStorage

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllReports = async () => {
            setIsLoading(true); // بدء التحميل
            try {
                const response = await axios.get('https://tarek-store-backend.onrender.com/api/revenue-reports', {
                    params: { page: currentPage, limit: reportsPerPage },
                });

                // Sort reports by createdAt (newest to oldest)
                const sortedReports = response.data.reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // Update reports by adding the new report to the beginning
                setReports(sortedReports || []);
                setTotalPages(response.data.totalPages || 1);
                setNoReports(sortedReports.length === 0); // التحقق إذا لم توجد تقارير
            } catch (err) {
                setError('Error fetching revenue reports');
            } finally {
                setIsLoading(false); // إنهاء التحميل
            }
        };

        fetchAllReports();
    }, [currentPage, reportsPerPage]);

    const handleViewReport = (reportId) => {
        navigate(`/revenue-report/${reportId}`);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <>
            <Navbar isAdmin={role === 'admin'} />
            <div className="all-revenue-reports-container">
                <h1 className="all-revenue-reports-title">جميع تقارير الإيرادات</h1>
                {error && <div className="all-revenue-reports-error-message">{error}</div>}

                {isLoading ? (
                    <p>جاري تحميل التقارير...</p> // عرض رسالة التحميل
                ) : noReports ? (
                    <p>لا توجد تقارير لعرضها</p> // عرض رسالة إذا لم توجد تقارير
                ) : (
                    <div className="all-revenue-reports-table-header">
                        <table className="all-revenue-reports-table">
                            <thead>
                                <tr>
                                    <th>عنوان التقرير</th>
                                    <th>من تاريخ</th>
                                    <th>إلى تاريخ</th>
                                    <th>الفرع</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report, index) => (
                                    <tr key={index}>
                                        <td>{report.reportTitle}</td>
                                        <td>{new Date(report.startDate).toLocaleDateString()}</td>
                                        <td>{new Date(report.endDate).toLocaleDateString()}</td>
                                        <td>{report.branchId ? report.branchId.name : 'جميع الفروع'}</td>
                                        <td>
                                            <button onClick={() => handleViewReport(report._id)} className="all-revenue-reports-view-btn">
                                                عرض التقرير
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="all-revenue-reports-pagination">
                    <button onClick={handlePreviousPage} disabled={currentPage === 1} className="all-revenue-reports-pagination-btn">
                        السابق
                    </button>
                    <span className="all-revenue-reports-pagination-info">صفحة {currentPage} من {totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="all-revenue-reports-pagination-btn">
                        التالي
                    </button>
                </div>
            </div>
        </>
    );
}

export default AllRevenueReports;
