import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import '../styles/Inventory.css';

const Inventory = () => {
  const [product, setProduct] = useState({
    barcode: '',
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
  });

  const navigate = useNavigate();
  const [addedProduct, setAddedProduct] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleBarcodeChange = async (e) => {
    const scannedBarcode = e.target.value;
    setProduct((prevProduct) => ({
      ...prevProduct,
      barcode: scannedBarcode,
    }));

    try {
      const response = await axios.get(`http://localhost:5000/api/products/${scannedBarcode}`);
      setProduct((prevProduct) => ({
        ...prevProduct,
        name: response.data.name,
        description: response.data.description || '',
        price: response.data.price,
        quantity: response.data.quantity,
        category: response.data.category,
      }));
    } catch (error) {
      console.error('خطأ في استرجاع تفاصيل المنتج', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/products/add', product);
      setAddedProduct(response.data.product);
      setProduct({ barcode: '', name: '', description: '', price: '', quantity: '', category: '' });
      setEditingProductId(null);
      setTimeout(() => {
        setAddedProduct(null);
      }, 3000);
    } catch (error) {
      console.error('خطأ في اضافة او تحديث المنتج', error);
    }
  };

  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <button className="inventory__all-products-btn" onClick={() => navigate('/all-products')}>
        عرض جميع المنتجات
      </button>
      <section className="inventory__section">
        <h2 className="inventory__heading">{editingProductId ? 'تعديل المنتج' : 'إضافة منتج'}</h2>
        <form className="inventory__form" onSubmit={handleSubmit}>
          <input
            className="inventory__input"
            type="text"
            name="barcode"
            value={product.barcode}
            onChange={handleBarcodeChange}
            placeholder="رمز المنتج"
            required
          />
          <input
            className="inventory__input"
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="اسم المنتج"
            required
          />
          <input
            className="inventory__input"
            type="text"
            name="description"
            value={product.description}
            onChange={handleChange}
            placeholder="الوصف"
          />
          <input
            className="inventory__input"
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            placeholder="السعر"
            required
          />
          <input
            className="inventory__input"
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            placeholder="الكمية"
            required
          />
          <select
            className="inventory__select"
            name="category"
            value={product.category}
            onChange={handleChange}
            required
          >
            <option value="">اختر التصنيف</option>
            <option value="devices">اجهزة</option>
            <option value="accessories">اكسسوارات</option>
          </select>
          <button className="inventory__submit-btn" type="submit">
            {editingProductId ? 'تحديث المنتج' : 'إضافة المنتج'}
          </button>
        </form>
        {addedProduct && <p className="inventory__confirmation">تم إضافة المنتج: {addedProduct.name}</p>}
      </section>
    </>
  );
};

export default Inventory;
