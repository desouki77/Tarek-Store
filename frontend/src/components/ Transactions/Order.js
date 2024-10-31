import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Order.css';

const Order = () => {
  const [orderData, setOrderData] = useState({
    storeName: "Tarek Phones",
    branchId: localStorage.getItem("branchId") || "", // Added branchId
    branchName: localStorage.getItem("branchName") || "Default Branch",
    salesName: localStorage.getItem("salesName") || "Default Sales",
    date: new Date().toLocaleDateString(),
    barcode: "",
    itemName: "",
    itemDescription: "",
    price: "",
    discount: "",
    paidAmount: "",
    remainingAmount: "",
    instructions: "",
  });

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Clear the interval on component unmount
    return () => clearInterval(timerId);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleBarcodeChange = async (e) => {
    const scannedBarcode = e.target.value;
    setOrderData((prevData) => ({
      ...prevData,
      barcode: scannedBarcode,
    }));

    try {
      const response = await axios.get(`http://localhost:5000/api/products/${scannedBarcode}`);
      setOrderData((prevData) => ({
        ...prevData,
        itemName: response.data.name,
        itemDescription: response.data.description || '',
        price: response.data.price,
      }));
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

 

  return (
    <div>
      <div className="order-details">
        <p>{orderData.storeName}</p>
        <p>{orderData.branchName}</p>
        <p>{orderData.salesName}</p>
        <p>Date: {orderData.date}</p>
        <p>Time: {currentTime}</p>

        <div className="form-group">
          <input
            type="text"
            name="barcode"
            value={orderData.barcode}
            onChange={handleBarcodeChange}
            placeholder="Scan barcode"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="itemName"
            value={orderData.itemName}
            onChange={handleChange}
            placeholder="اسم المنتج"
            required
          />
        </div>
        <div className="form-group">
          <textarea
            name="itemDescription"
            value={orderData.itemDescription}
            onChange={handleChange}
            placeholder="وصف المنتج"
          />
        </div>
        <div className="form-group">
          <input
            type="number"
            name="price"
            value={orderData.price}
            onChange={handleChange}
            placeholder="سعر المنتج"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="number"
            name="discount"
            value={orderData.discount}
            onChange={handleChange}
            placeholder="خصم"
          />
        </div>
        <div className="form-group">
          <input
            type="number"
            name="paidAmount"
            value={orderData.paidAmount}
            onChange={handleChange}
            placeholder="المدفوع"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="number"
            name="remainingAmount"
            value={orderData.remainingAmount}
            onChange={handleChange}
            placeholder="الباقي"
          />
        </div>
        <div className="form-group">
          <textarea
            name="instructions"
            value={orderData.instructions}
            onChange={handleChange}
            placeholder="تعليمات"
          />
        </div>
        
       
      </div>
    </div>
  );
};

export default Order;
