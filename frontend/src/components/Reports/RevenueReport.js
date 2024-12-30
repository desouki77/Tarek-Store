import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  
import Navbar from '../Navbar';
import '../../styles/RevenueReport.css';

function RevenueReport() {
    const [reportData, setReportData] = useState([]); 
    const [branches, setBranches] = useState([]); 
    const [selectedBranch, setSelectedBranch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const role = localStorage.getItem('role'); 
    const navigate = useNavigate();  

    const transactionTypeMap = {
        'sales': 'المبيعات',
        'input': 'المدخلات',
        'output': 'المخرجات',
        'recharge': 'الشحن',
        'maintenance': 'الصيانة',
        'supplier_payment': 'سداد الموردين',
        'customer_payment': 'سداد العملاء',
        'purchasing': 'الشراء',
        'returns': 'المرتجعات',
        'output_staff': 'مسحوبات موظفين',
    };

    const transactionOrder = [
        'sales', 'input', 'recharge', 'maintenance', 'customer_payment',
        'purchasing', 'output', 'supplier_payment', 'returns', 'output_staff'
    ];

    const getTransactionTypeClass = (type) => {
        const greenTypes = ['maintenance', 'input', 'recharge', 'sales', 'customer_payment'];
        const redTypes = ['supplier_payment', 'output', 'returns', 'purchasing', 'output_staff'];

        if (greenTypes.includes(type)) {
            return 'revenue-reports-green-text';
        } else if (redTypes.includes(type)) {
            return 'revenue-reports-red-text';
        }
        return ''; 
    };

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await axios.get('https://tarek-store-backend.onrender.com/api/branches');
                setBranches(response.data || []);
            } catch (err) {
                setError('Error fetching branches');
            }
        };
        fetchBranches();
    }, []);

    useEffect(() => {
        if (!startDate || !endDate) return; 
        const fetchRevenueReport = async () => {
            try {
                const response = await axios.get('https://tarek-store-backend.onrender.com/api/transactions/generate-revenue-report', {
                    params: { startDate, endDate, branchId: selectedBranch },
                });
                setReportData(response.data.report || []);
            } catch (err) {
                setError('Error fetching revenue report');
            }
        };
        fetchRevenueReport();
    }, [startDate, endDate, selectedBranch]);

    const sortDataByTransactionOrder = (data) => {
        return data.sort((a, b) => {
            const indexA = transactionOrder.indexOf(a.type);
            const indexB = transactionOrder.indexOf(b.type);
            return indexA - indexB;
        });
    };

    const calculateTotalProfit = () => {
        const positiveRevenue = reportData.filter(item => ['maintenance', 'input', 'recharge', 'sales', 'customer_payment'].includes(item.type));
        const negativeRevenue = reportData.filter(item => ['supplier_payment', 'output', 'returns', 'purchasing', 'output_staff'].includes(item.type));

        const totalPositiveRevenue = positiveRevenue.reduce((sum, item) => sum + item.totalRevenue, 0);
        const totalNegativeRevenue = negativeRevenue.reduce((sum, item) => sum + item.totalRevenue, 0);

        return totalPositiveRevenue - totalNegativeRevenue;
    };

    const sortedReportData = sortDataByTransactionOrder(reportData);

    const handleSaveReport = async () => {
        const report = {
            startDate,
            endDate,
            branchId: selectedBranch,
            currentMonthReport: sortedReportData,
        };
        
        try {
            await axios.post('https://tarek-store-backend.onrender.com/api/save-revenue-report', report);
            alert('تم حفظ التقرير بنجاح');
        } catch (err) {
            alert('حدث خطأ أثناء حفظ التقرير');
        }
    };

    return (
        <>
            <Navbar isAdmin={role === 'admin'} />
            <div className="revenue-reports-container">
                <h1>انشاء تقرير الإيرادات</h1>
                {error && <div className="revenue-reports-error-message">{error}</div>}
                <div>
                    <label htmlFor="branch">اختر الفرع:</label>
                    <select
                        id="branch"
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                        <option value="">جميع الفروع</option>
                        {branches.map((branch) => (
                            <option key={branch._id} value={branch._id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>
    
                <div>
                    <label>من تاريخ:</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <label>إلى تاريخ:</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
    
                {/* الجدول سيظهر فقط إذا تم تحديد تاريخ البداية والنهاية */}
                {startDate && endDate && (
                    <table className="revenue-reports-table">
                        <thead>
                            <tr>
                                <th>نوع المعاملة</th>
                                <th>إيرادات (جنيه)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(sortedReportData) && sortedReportData.length > 0 ? (
                                sortedReportData.map((item, index) => (
                                    <tr key={index}>
                                        <td className={getTransactionTypeClass(item.type)}>
                                            {transactionTypeMap[item.type] || item.type}
                                        </td>
                                        <td className={getTransactionTypeClass(item.type)}>
                                            {item.totalRevenue} جنيه
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2">لا توجد بيانات لعرضها</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
    
                {startDate && endDate && (
                    <div className="revenue-reports-total-profit">
                        <h3>إجمالي الأرباح: {calculateTotalProfit()} جنيه</h3>
                    </div>
                )}

{startDate && endDate && (
                <button onClick={handleSaveReport}>حفظ التقرير</button>
            )}
    
                <button className="revenue-reports-button" onClick={() => navigate('/all-revenue-reports')}>جميع التقارير</button>
            </div>
        </>
    );
    
}

export default RevenueReport;
