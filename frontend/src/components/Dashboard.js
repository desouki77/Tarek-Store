    import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import Navbar from './Navbar';
    import axios from 'axios';
    import '../styles/Dashboard.css';
    import Loader from './Loader';

    function Dashboard() {
        const role = localStorage.getItem('role'); // Get role from localStorage
        const isAdmin = role === 'admin'; // Determine if the user is an admin
        const navigate = useNavigate(); // useNavigate hook for navigation

        const [welcomeData, setWelcomeData] = useState({
            storeName: "Tarek Phones",
            branchName: "Default Branch",
            salesName: "Default Sales",
        });

        const [loading, setLoading] = useState(true); // Add loading state
        const [error, setError] = useState(null); // Add error state

        const [bankOpen, setBankOpen] = useState(false); // Track if the bank is open
        const [bankAmount, setBankAmount] = useState(null); // Track the current bank amount
        const branchId = localStorage.getItem("branchId"); // Fetch branchId from localStorage

        const fetchBankData = async (bankId) => {
            try {
                const response = await axios.get(`https://tarek-store-backend.onrender.com/api/bank/${bankId}`);
                const bankData = response.data;

                setBankAmount(bankData.bankAmount);
                localStorage.setItem('bankAmount', bankData.bankAmount);

                console.log("Fetched updated bank data:", bankData);
            } catch (error) {
                console.error("Error fetching bank data:", error);
            }
        };

        useEffect(() => {
            const userId = localStorage.getItem("userId");
            const branchId = localStorage.getItem("branchId");

            // Restore bank state from localStorage
            const storedBankOpen = localStorage.getItem('bankOpen') === 'true';
            const storedBankAmount = localStorage.getItem('bankAmount');

            setBankOpen(storedBankOpen);
            setBankAmount(storedBankOpen ? storedBankAmount : null);

            const fetchUserData = async () => {
                try {
                    // Fetch user data
                    const userResponse = await axios.get(`https://tarek-store-backend.onrender.com/api/users/${userId}`);
                    const branchResponse = await axios.get(`https://tarek-store-backend.onrender.com/api/branches/${branchId}`);

                    setWelcomeData(prevData => ({
                        ...prevData,
                        salesName: userResponse.data.username,
                        branchName: branchResponse.data.name
                    }));
                } catch (error) {
                    console.error("Error fetching user or branch data:", error);
                    setError("Failed to load user or branch data."); // Set error message
                } finally {
                    setLoading(false); // Set loading to false after the requests
                }
            };

            const bankId = localStorage.getItem('bankID');

            fetchUserData();
            if (bankId) {
                fetchBankData(bankId);
            }
        }, [branchId]);

        // Handler to navigate to specific transaction pages
        const handleTransactionClick = (transactionType) => {
            navigate(`/transactions/${transactionType}`);
            localStorage.setItem('transactionType', transactionType);
        };

        // Render loading state or error message
        if (loading) {
            return <Loader />; // Display loading message
        }

        if (error) {
            return <div>{error}</div>; // Display error message
        }

        const handleOpenBank = async () => {
            try {
                const response = await axios.post('https://tarek-store-backend.onrender.com/api/bank', {
                    bankAmount: "0", // Initial value
                    branch: branchId,
                });

                const bankId = response.data._id;
                localStorage.setItem('bankID', bankId);
                localStorage.setItem('bankOpen', true);
                localStorage.setItem('bankAmount', response.data.bankAmount);

                setBankOpen(true);

                // Fetch updated bank data
                await fetchBankData(bankId);
            } catch (error) {
                console.error("Error opening bank or fetching data:", error);
            }
        };

        const handleCloseBank = async () => {
            try {
                setBankOpen(false);
                setBankAmount(null);
                localStorage.removeItem('bankID');
                localStorage.removeItem('bankOpen');
                localStorage.removeItem('bankAmount');
            } catch (error) {
                console.error("Error closing bank:", error);
            }
        };

        return (
            <>
                <Navbar isAdmin={isAdmin} />
                <div className="dashboard-container">
                    {/* Welcome Data */}
                    <div className='welcome'>
                        <p>{welcomeData.storeName}</p>
                        <p>{welcomeData.branchName}</p>
                        <p>{welcomeData.salesName}</p>
                        <div className="bank-controls">
                            {!bankOpen ? (
                                <button className="open-bank" onClick={handleOpenBank}>
                                    فتح الدرج
                                </button>
                            ) : (
                                <>
             <div className="bank-amount-container">
             <i className="fas fa-money-bill-wave bank-icon"></i>
             <p className="bank-amount">الدرج الان: {bankAmount}</p>
            </div>
                                    <button className="close-bank" onClick={handleCloseBank}>
                                        تسليم الدرج
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Transaction Buttons */}
                    <div className='transaction-container'>
                        <div className="transaction-buttons">
                            <button className="transaction" onClick={() => handleTransactionClick('selling')}>بيع</button>
                            <button className="transaction" onClick={() => handleTransactionClick('input')}>مدخلات</button>
                            <button className="transaction" onClick={() => handleTransactionClick('output')}>مخرجات</button>
                            <button className="transaction" onClick={() => handleTransactionClick('recharge')}>شحن</button>
                            <button className="transaction" onClick={() => handleTransactionClick('maintenance')}>صيانة</button>
                            <button className="transaction" onClick={() => handleTransactionClick('supplier_payment')}>سداد موردين</button>
                            <button className="transaction" onClick={() => handleTransactionClick('customer_payment')}>سداد عملاء</button>
                            <button className="transaction" onClick={() => handleTransactionClick('purchasing')}>مشتروات</button>
                            <button className="transaction" onClick={() => handleTransactionClick('returns')}>مرتجعات</button>
                            <button className="transaction" onClick={() => handleTransactionClick('warranty')} >الضمان</button>
                            <button className="transaction" onClick={() => handleTransactionClick('output_staff')} >مسحوبات موظفين</button>
                            <button className="transaction" onClick={() => handleTransactionClick('bank')} >الدرج</button>

                        </div>
                    </div>
                </div>
            </>
        );
    }

    export default Dashboard;
