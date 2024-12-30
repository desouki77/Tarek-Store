import React from 'react';
import Navbar from '../Navbar';
import { useNavigate } from 'react-router-dom';
import '../../styles/Reports.css'; 

function Reports() {
    const role = localStorage.getItem('role'); // Get role from localStorage
    const navigate = useNavigate(); // useNavigate hook for navigation

    // Handler to navigate to specific transaction pages
    const handleReportClick = (reportType) => {
        navigate(`/reports/${reportType}`);
        localStorage.setItem('reportType', reportType);
    };

    // Render the report
    return (
        <>
            <Navbar isAdmin={role === 'admin'} />
            <div className="reports-container">
                <h1 className="reports-title">التقارير</h1>
                <div className="reports-buttons">
                    <button className="report" onClick={() => handleReportClick('salesReport')}>
                        تقرير المبيعات
                    </button>
                    <button className="report" onClick={() => handleReportClick('revenueReport')}>
                        تقرير الايرادات
                    </button>
                    <button className="report" onClick={() => handleReportClick('bestSellerReport')}>
                        تقرير الاكثر مبيعا
                    </button>
                    <button className="report" onClick={() => handleReportClick('stockReport')}>
                        تقرير عدد الاستوك
                    </button>
                 
                </div>
            </div>
        </>
    );
}

export default Reports;
