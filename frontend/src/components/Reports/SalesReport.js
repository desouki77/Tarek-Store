import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // استيراد useNavigate للتنقل بين الصفحات
import '../../styles/SalesReport.css';
import Navbar from '../Navbar';

function SalesReport() {
    const [reportData, setReportData] = useState(null);
    const [branchId, setBranchId] = useState(''); // قيمة فارغة تعني أنه سيتم عرض تقرير لجميع الفروع
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [branches, setBranches] = useState([]); // لتخزين الفروع
    const role = localStorage.getItem('role'); // Get role from localStorage
    const navigate = useNavigate(); // إنشاء دالة التنقل

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

    // استخدام useCallback لتحسين الأداء
    const fetchSalesReport = useCallback(async () => {
        try {
            const response = await axios.get('https://tarek-store-backend.onrender.com/api/sales-report', {
                params: { branchId, startDate, endDate },
            });
            setReportData(response.data);
        } catch (err) {
            setError('Error fetching sales report');
        }
    }, [branchId, startDate, endDate]);

    useEffect(() => {
        if (startDate && endDate) {
            fetchSalesReport();
        }
    }, [fetchSalesReport, branchId, startDate, endDate]);

    const handleBranchChange = (e) => {
        setBranchId(e.target.value);
    };

    const handleDateRangeChange = (e) => {
        const { name, value } = e.target;
        if (name === 'startDate') {
            setStartDate(value);
        } else {
            setEndDate(value);
        }
    };




    // دالة لحفظ التقرير في قاعدة البيانات
    const saveReportToDatabase = async () => {
        const startDateObj = new Date(startDate);
        const reportDay = startDateObj.getDate();
        const reportMonth = startDateObj.getMonth() + 1;
        const reportYear = startDateObj.getFullYear();
        
        const reportName = `تقرير مبيعات ${reportDay}-${reportMonth}-${reportYear}`;
        
        const branch = branches.find(b => b._id === branchId);
        const branchName = branch ? branch.name : 'جميع الفروع';
    
        try {
            // إذا لم يتم تحديد فرع، نرسل null بدلًا من قيمة فارغة
            await axios.post('https://tarek-store-backend.onrender.com/api/save-sales-report', {
                reportName,
                totalSales: reportData.totalSales,
                totalItemsSold: reportData.totalItemsSold,
                totalDiscounts: reportData.totalDiscounts,
                orderCount: reportData.orderCount,
                branchId: branchId || null,  // ارسال null إذا لم يتم تحديد فرع
                branchName, 
                startDate,
                endDate,
            });
            alert('تم حفظ التقرير بنجاح');
        } catch (err) {
            console.error('Error saving report:', err);
            alert('حدث خطأ أثناء حفظ التقرير');
        }
    };
    

    // دالة التنقل إلى صفحة جميع التقارير
    const navigateToAllReports = () => {
        navigate('/all-sales-reports');
    };

    return (
        <>
        <Navbar isAdmin={role === 'admin'} />

        <div className="sales-report-container">
            <h1>انشاء تقرير المبيعات</h1>
            <div className="filters">
                <label htmlFor="branch">فرع:</label>
                <select
                    id="branch"
                    value={branchId}
                    onChange={handleBranchChange}
                >
                    <option value="">جميع الفروع</option> {/* خيار لجميع الفروع */}
                    {branches.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                            {branch.name}
                        </option>
                    ))}
                </select>

                <label htmlFor="startDate">من:</label>
                <input
                    type="date"
                    name="startDate"
                    value={startDate}
                    onChange={handleDateRangeChange}
                />

                <label htmlFor="endDate">إلى:</label>
                <input
                    type="date"
                    name="endDate"
                    value={endDate}
                    onChange={handleDateRangeChange}
                />
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* عرض التقرير فقط إذا كانت الحقول صحيحة */}
            {reportData && (
                <div className="report-summary">
                    <div className="report-item">
                        <strong>إجمالي المبيعات:</strong> {reportData.totalSales} جنيه
                    </div>
                    <div className="report-item">
                        <strong>عدد المنتجات المباعة:</strong> {reportData.totalItemsSold}
                    </div>
                    <div className="report-item">
                        <strong>إجمالي الخصومات:</strong> {reportData.totalDiscounts} جنيه
                    </div>
                    <div className="report-item">
                        <strong>عدد الطلبات:</strong> {reportData.orderCount}
                    </div>
                    {/* إضافة زر حفظ التقرير */}
                    <button onClick={saveReportToDatabase}>حفظ التقرير</button>
                </div>
            )}

            {/* زر للتنقل إلى صفحة جميع التقارير */}
            <button className="view-all-reports-btn" onClick={navigateToAllReports}>
                جميع التقارير
            </button>
        </div>
        </>
    );
}

export default SalesReport;
