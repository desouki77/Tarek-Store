import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/BankList.css';

const BankList = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  useEffect(() => {
    const url = `http://localhost:5000/api/bank?startDate=${startDate}&endDate=${endDate}&page=${currentPage}&limit=10`;

    axios
      .get(url)
      .then((response) => {
        setBanks(response.data.banks);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [startDate, endDate, currentPage]);

  if (loading) {
    return <div className="bank-list-loading">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="bank-list-error">حدث خطأ: {error}</div>;
  }

  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <div className="bank-list-container">
        <h1 className="bank-list-title">قائمة الدرج</h1>

        <div className="bank-list-date-inputs">
          <div className="bank-list-date-item">
            <label className="bank-list-label">من:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="bank-list-input" 
            />
          </div>
          <div className="bank-list-date-item">
            <label className="bank-list-label">إلى:</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="bank-list-input" 
            />
          </div>
        </div>

        <table className="bank-list-table">
          <thead>
            <tr>
              <th>المبلغ</th>
              <th>الفرع</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {banks.map((bank) => (
              <tr key={bank._id}>
                <td>{bank.bankAmount}</td>
                <td>{bank.branch.name}</td>
                <td>{new Date(bank.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bank-list-pagination">
          <button 
            onClick={() => setCurrentPage(currentPage - 1)} 
            disabled={currentPage === 1} 
            className="bank-list-pagination-btn">
            السابق
          </button>
          <span className="bank-list-page-info">صفحة {currentPage} من {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(currentPage + 1)} 
            disabled={currentPage === totalPages} 
            className="bank-list-pagination-btn">
            التالي
          </button>
        </div>
      </div>
    </>
  );
};

export default BankList;
