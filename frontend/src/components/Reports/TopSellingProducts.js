import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar';
import '../../styles/TopSellingProducts.css';

const TopSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/branches');
        setBranches(response.data);
      } catch (error) {
        setError('Failed to fetch branches');
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        let url = `http://localhost:5000/api/top-selling-products?page=${currentPage}&limit=10`;
        if (branchId) url += `&branchId=${branchId}`;

        console.log("Fetching top selling products from:", url);

        const response = await axios.get(url);
        console.log("API Response:", response.data);

        setProducts(response.data || []);
        setTotalPages(response.data.totalPages || 1);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching top selling products:', error);
        setError('Failed to fetch top selling products');
        setLoading(false);
      }
    };

    fetchTopSellingProducts();
  }, [branchId, currentPage]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      <Navbar isAdmin={role === 'admin'} />
      <div className="top-selling-container">
        <h1 className="top-selling-heading">المنتجات الاكثر مبيعا</h1>

        <div className="top-selling-filter">
          <label htmlFor="branch-select">اختر الفرع</label>
          <select 
            id="branch-select"
            className="top-selling-select"
            value={branchId} 
            onChange={(e) => setBranchId(e.target.value)} 
          >
            <option value="">جميع الفروع</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div className="top-selling-header">
        <table className="top-selling-table">
          <thead>
            <tr>
              <th>اسم المنتج</th>
              <th>الباركود</th>
              <th>الكمية المباعة</th>
              <th>السعر</th>
            </tr>
          </thead>
          <tbody>
            {products && products.length > 0 ? (
              products.map((product) => (
                <tr key={product.barcode}>
                  <td>{product.name}</td>
                  <td>{product.barcode}</td>
                  <td>{product.totalQuantitySold}</td>
                  <td>{product.price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        <div className="top-selling-pagination">
          <button 
            className="top-selling-button" 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
          >
            السابق
          </button>
          <span>صفحة {currentPage} من {totalPages}</span>
          <button 
            className="top-selling-button" 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
          >
            التالي
          </button>
        </div>
      </div>
    </>
  );
};

export default TopSellingProducts;
