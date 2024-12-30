import React from 'react';
import Navbar from '../Navbar';


const StockReport = () => {

    const role = localStorage.getItem('role'); // Get role from localStorage
    const isAdmin = role === 'admin'; // Determine if the user is an admin
  return (
    <>
          <Navbar isAdmin={isAdmin} />

    
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>قريبًا...</h1>
      <p>نحن نعمل على إضافة تقرير المخزون. يرجى العودة لاحقًا.</p>
    </div>
    </>
  );
};

export default StockReport;
