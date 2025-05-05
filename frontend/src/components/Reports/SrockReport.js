import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import '../../styles/StockReport.css';

const StockReport = () => {
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMain, setSelectedMain] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);
    const [selectedThird, setSelectedThird] = useState(null);
    const [branchId, setBranchId] = useState('');
    const [error, setError] = useState(null);
    const [branchSummary, setBranchSummary] = useState({
        totalProducts: 0,
        totalQuantity: 0
    });

    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';

    const API_URL = process.env.REACT_APP_API_URL;


    useEffect(() => {
        const userBranchId = localStorage.getItem('branchId');
        if (userBranchId) {
            setBranchId(userBranchId);
            fetchStockReport(userBranchId);
            fetchBranchSummary(userBranchId);
        } else {
            setError('Branch ID not found');
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [API_URL]);

    const fetchStockReport = async (branchId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/categories/stock-report/${branchId}`);
            setReport(response.data);
            setLoading(false);
            setError(null);
            setSelectedMain(null);
            setSelectedSub(null);
            setSelectedThird(null);
        } catch (error) {
            console.error('Error fetching stock report:', error);
            setError('Failed to load stock report. Please try again later.');
            setLoading(false);
        }
    };

    const fetchBranchSummary = async (branchId) => {
        try {
            const response = await axios.get(`${API_URL}/api/products?branchId=${branchId}`);
            const totalProducts = response.data.length;
            const totalQuantity = response.data.reduce((sum, product) => sum + product.quantity, 0);
            setBranchSummary({ totalProducts, totalQuantity });
        } catch (error) {
            console.error('Error fetching branch summary:', error);
        }
    };

    const handleMainClick = (category) => {
        setSelectedMain(category);
        setSelectedSub(null);
        setSelectedThird(null);
    };

    const handleSubClick = (category) => {
        setSelectedSub(category);
        setSelectedThird(null);
    };

    const handleThirdClick = (category) => {
        setSelectedThird(category);
    };

    const handleRefresh = () => {
        if (branchId) {
            fetchStockReport(branchId);
            fetchBranchSummary(branchId);
        }
    };

    const getCurrentDetails = () => {
        if (selectedThird) {
            return {
                name: selectedThird.name,
                productCount: selectedThird.productCount,
                totalQuantity: selectedThird.totalQuantity
            };
        }
        if (selectedSub) {
            return {
                name: selectedSub.name,
                productCount: selectedSub.productCount,
                totalQuantity: selectedSub.totalQuantity
            };
        }
        if (selectedMain) {
            return {
                name: selectedMain.name,
                productCount: selectedMain.productCount,
                totalQuantity: selectedMain.totalQuantity
            };
        }
        return null;
    };

    const currentDetails = getCurrentDetails();

    return (
        <>
            <Navbar isAdmin={isAdmin} />
            <div className="stock-report-container">
                <h1>تقرير المخزون</h1>
                
                {error && (
                    <div className="error-message">
                        {error}
                        <button onClick={handleRefresh}>Refresh</button>
                    </div>
                )}

                {loading ? (
                    <div className="loading-message">جاري تحميل تقرير المخزون...</div>
                ) : (
                    <>
                        <div className="report-controls">
                            <button onClick={handleRefresh} className="refresh-button">
                                تحديث البيانات
                            </button>
                        </div>

                        <div className="branch-summary">
                            <h2>ملخص الفرع</h2>
                            <div className="summary-cards">
                                <div className="summary-card">
                                    <h3>إجمالي المنتجات</h3>
                                    <p>{branchSummary.totalProducts}</p>
                                </div>
                                <div className="summary-card">
                                    <h3>إجمالي الكمية</h3>
                                    <p>{branchSummary.totalQuantity}</p>
                                </div>
                            </div>
                        </div>

                        <div className="category-level">
                            <h2>التصنيفات الرئيسية</h2>
                            <div className="category-buttons">
                                {report.map(category => (
                                    <button
                                        key={category._id}
                                        className={`category-button ${selectedMain?._id === category._id ? 'active' : ''}`}
                                        onClick={() => handleMainClick(category)}
                                    >
                                        {category.name} 
                                        <span className="badge">
                                            {category.productCount} منتج ({category.totalQuantity} كمية)
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedMain && (
                            <div className="category-level">
                                <h2>التصنيفات الفرعية لـ {selectedMain.name}</h2>
                                <div className="category-buttons">
                                    {selectedMain.subCategories.map(subCat => (
                                        <button
                                            key={subCat._id}
                                            className={`category-button ${selectedSub?._id === subCat._id ? 'active' : ''}`}
                                            onClick={() => handleSubClick(subCat)}
                                        >
                                            {subCat.name} 
                                            <span className="badge">
                                                {subCat.productCount} منتج ({subCat.totalQuantity} كمية)
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedSub && (
                            <div className="category-level">
                                <h2>التصنيفات الثالثية لـ {selectedSub.name}</h2>
                                <div className="category-buttons">
                                    {selectedSub.thirdCategories.map(thirdCat => (
                                        <button
                                            key={thirdCat._id}
                                            className={`category-button ${selectedThird?._id === thirdCat._id ? 'active' : ''}`}
                                            onClick={() => handleThirdClick(thirdCat)}
                                        >
                                            {thirdCat.name} 
                                            <span className="badge">
                                                {thirdCat.productCount} منتج ({thirdCat.totalQuantity} كمية)
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentDetails && (
                            <div className="category-details">
                                <h3>تفاصيل {currentDetails.name}</h3>
                                <p>إجمالي المنتجات: {currentDetails.productCount}</p>
                                <p>إجمالي الكمية: {currentDetails.totalQuantity}</p>
                                <button 
                                    className="export-button"
                                    onClick={() => console.log('Export:', currentDetails)}
                                >
                                    تصدير إلى Excel
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default StockReport;