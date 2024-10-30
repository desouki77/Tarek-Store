// Dashboard.js
import React ,{ useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Dashboard.css'

function Dashboard() {
    const role = localStorage.getItem('role'); // Get role from localStorage
    const isAdmin = role === 'admin'; // Determine if the user is an admin
    const navigate = useNavigate(); // useNavigate hook for navigation

    const [welcomeData] = useState({
        storeName: "Tarek Phones",
        branchName: localStorage.getItem("branchName") || "Default Branch",
        salesName: localStorage.getItem("salesName") || "Default Sales",
        date: new Date().toLocaleDateString(),
      });

      const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

      useEffect(() => {
        const timerId = setInterval(() => {
          setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
    
        // Clear the interval on component unmount
        return () => clearInterval(timerId);
      }, []);
    
    

    // Handler to navigate to specific transaction pages
    const handleTransactionClick = (transactionType) => {
        navigate(`/transactions/${transactionType}`);
    };

    return ( 
        <>
          <Navbar isAdmin={isAdmin} /> 
        <div className="dashboard-container">
         



            {/* Buttons for different transaction types */}
            <div className='transaction-container'>
                <div className="transaction-buttons">
                    
                    <button className="transaction-order" onClick={() => handleTransactionClick('selling')}>بيع</button>
                    <button className="transaction-input" onClick={() => handleTransactionClick('input')}>مدخلات</button>
                    <button className="transaction-input" onClick={() => handleTransactionClick('recharge')}>شحن</button>
                    <button className="transaction-input" onClick={() => handleTransactionClick('maintenance')}>صيانة</button>
                    <button className="transaction-output" onClick={() => handleTransactionClick('output')}>مخرجات</button>
                    <button className="transaction-output" onClick={() => handleTransactionClick('purchasing')}> مشتروات</button>
                    <button className="transaction-input" onClick={() => handleTransactionClick('customer_payment')}> سداد عملاء</button>
                    <button className="transaction-output" onClick={() => handleTransactionClick('supplier_payment')}> سداد موردين</button>
                    <button className="transaction-output" onClick={() => handleTransactionClick('returns')}> مرتجعات</button>
                </div>
            </div>

            <div className='welcome'>
            <p>{welcomeData.storeName}</p>
            <p>{welcomeData.branchName}</p>
            <p>{welcomeData.salesName}</p>
            <p>Date: {welcomeData.date}</p>
            <p>Time: {currentTime}</p>

            </div>

        </div>
        </>
    );
}

export default Dashboard;
