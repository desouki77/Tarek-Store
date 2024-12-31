import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import { useParams } from 'react-router-dom';
import '../../styles/RevenueReportDetails.css';
import Loader from '../Loader';

function RevenueReportDetails() {
    const { reportId } = useParams();  // الحصول على المعرف من الرابط
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);  // إضافة حالة التحميل


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

    // eslint-disable-next-line no-unused-vars
    const transactionOrder = [
        'sales', 'input', 'recharge', 'maintenance', 'customer_payment',
        'purchasing', 'output', 'supplier_payment', 'returns', 'output_staff'
    ];

    const getTransactionTypeClass = (type) => {
        const greenTypes = ['maintenance', 'input', 'recharge', 'sales', 'customer_payment'];
        const redTypes = ['supplier_payment', 'output', 'returns', 'purchasing', 'output_staff'];

        if (greenTypes.includes(type)) {
            return 'revenue-reports-details-green-text';
        } else if (redTypes.includes(type)) {
            return 'revenue-reports-details-red-text';
        }
        return ''; 
    };

    useEffect(() => {
        const fetchReportDetails = async () => {
            try {
                const response = await axios.get(`https://tarek-store-backend.onrender.com/api/revenue-reports/${reportId}`);
                setReport(response.data);
                setLoading(false)
            } catch (err) {
                setError('Error fetching report details');
                setLoading(false)
            }
        };
        fetchReportDetails();
    }, [reportId]);

    if (loading) {
        return  <Loader />;
    }

    if (!report) {
        return <div className="revenue-reports-details">جاري تحميل التفاصيل...</div>;
    }

    const calculateTotalProfit = (reportData) => {
        const positiveRevenue = reportData.filter(item => ['maintenance', 'input', 'recharge', 'sales', 'customer_payment'].includes(item.type));
        const negativeRevenue = reportData.filter(item => ['supplier_payment', 'output', 'returns', 'purchasing', 'output_staff'].includes(item.type));

        const totalPositiveRevenue = positiveRevenue.reduce((sum, item) => sum + item.totalRevenue, 0);
        const totalNegativeRevenue = negativeRevenue.reduce((sum, item) => sum + item.totalRevenue, 0);

        return totalPositiveRevenue - totalNegativeRevenue;
    };

    return (
        <>
            <Navbar />
            <div className="revenue-reports-details">
                <h1>تفاصيل تقرير الإيرادات</h1>
                {error && <div className="revenue-reports-details-error-message">{error}</div>}
                <h2>عنوان التقرير: {report.reportTitle}</h2>
                <p>من تاريخ: {new Date(report.startDate).toLocaleDateString()}</p>
                <p>إلى تاريخ: {new Date(report.endDate).toLocaleDateString()}</p>
                <p>الفرع: {report.branchId ? report.branchId.name : 'جميع الفروع'}</p>

                <h3>المعاملات:</h3>
                <table>
                    <thead>
                        <tr>
                            <th>نوع المعاملة</th>
                            <th>إيرادات (جنيه)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.reportData && report.reportData.length > 0 ? (
                            report.reportData.map((transaction, index) => (
                                <tr key={index}>
                                    <td className={getTransactionTypeClass(transaction.type)}>
                                        {transactionTypeMap[transaction.type] || transaction.type}
                                    </td>
                                    <td className={getTransactionTypeClass(transaction.type)}>
                                        {transaction.totalRevenue} جنيه
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2">لا توجد معاملات لعرضها</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="revenue-reports-details-total-profit">
                    <h3>إجمالي الأرباح: {calculateTotalProfit(report.reportData)} جنيه</h3>
                </div>
            </div>
        </>
    );
}

export default RevenueReportDetails;
