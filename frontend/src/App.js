import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import './styles/App.css';
import Loader from './components/Loader'; // Import the Loader component
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Registration from './components/Registration';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './components/Welcome';
import SellingTransaction from './components/ Transactions/SellingTransaction';
import InputTransaction from './components/ Transactions/InputTransaction';
import OutputTransaction from './components/ Transactions/OutputTransaction';
import MaintenanceTransaction from './components/ Transactions/MaintenanceTransaction';
import CustomerPaymentTransaction from './components/ Transactions/CustomerPaymentTransaction';
import SupplierPaymentTransaction from './components/ Transactions/SupplierPaymentTransaction';
import PurchasingTransaction from './components/ Transactions/PurchasingTransaction';
import ReturnsTransaction from './components/ Transactions/ReturnsTransaction';
import RechargeTransaction from './components/ Transactions/RechargeTransaction';
import Inventory from './components/Inventory';
import Checkout from './components/ Transactions/Checkout';
import OrderReceipt from './components/ Transactions/OrderReceipt';
import AllOrders from './components/ Transactions/AllOrders';
import AllProducts from './components/AllProducts';
import EditProduct from './components/EditProduct';
import AllTransactions from './components/ Transactions/AllTransactions';
import Sales from './components/Sales';
import Suppliers from './components/Suppliers';
import Client from './components/Client';

function App() {
  const [loading, setLoading] = useState(false); // Track loading state
  const location = useLocation(); // Get the current location
  

  // Show the loader during page transitions
  useEffect(() => {
    if (location.pathname !== '/') {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 500); // Simulate a delay for loader
      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [location]); // Re-run effect when location changes

  return (
    <>
      {loading && <Loader />} {/* Show loader if loading is true */}
      {!loading && (
        <div className="main-content"> {/* Wrap your content in this div */}
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            {/* Transactions Routes */}
            <Route path="/transactions/selling" element={<SellingTransaction />} />
            <Route path="/transactions/input" element={<InputTransaction />} />
            <Route path="/transactions/output" element={<OutputTransaction />} />
            <Route path="/transactions/recharge" element={<RechargeTransaction />} />
            <Route path="/transactions/maintenance" element={<MaintenanceTransaction />} />
            <Route path="/transactions/customer_payment" element={<CustomerPaymentTransaction />} />
            <Route path="/transactions/supplier_payment" element={<SupplierPaymentTransaction />} />
            <Route path="/transactions/purchasing" element={<PurchasingTransaction />} />
            <Route path="/transactions/returns" element={<ReturnsTransaction />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-receipt/:orderId" element={<OrderReceipt />} />
            <Route path="/all-orders" element={<AllOrders />} />
            <Route path="/all-products" element={<AllProducts />} />
            <Route path="/edit-product/:barcode" element={<EditProduct />} />
            <Route path="all-transactions" element={<AllTransactions />} />
            <Route path='sales' element={<Sales />} />
            <Route path='suppliers' element={<Suppliers />} />
            <Route path='customers' element={<Client/>}/>
          </Routes>
        </div>
      )}
    </>
  );
}

export default App;
