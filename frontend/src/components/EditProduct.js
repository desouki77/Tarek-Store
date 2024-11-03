import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Inventory.css';

const EditProduct = () => {
    const { id } = useParams();
    const [product, setProduct] = useState({
        barcode: '',
        name: '',
        description: '',
        price: '',
        quantity: '',
        category: '',
    });
    const [loading, setLoading] = useState(true); // Loading state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/products/${id}`); // Corrected endpoint
                setProduct(response.data);
            } catch (error) {
                console.error('Error fetching product:', error);
                alert('Failed to fetch product details.');
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };
    
        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const branchId = localStorage.getItem('branchId');
        const productWithBranchId = { ...product, branchId };
    
        try {
            setLoading(true); // Set loading to true during update
            await axios.put(`http://localhost:5000/api/products/${id}`, productWithBranchId); // Corrected endpoint
            alert('Product updated successfully.');
            navigate('/all-products');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update the product.');
        } finally {
            setLoading(false); // Set loading to false after update
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Loading state
    }

    return (
        <>
            <Navbar isAdmin={localStorage.getItem('role') === 'admin'} />

            <h1>Edit Product</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="barcode"
                    value={product.barcode}
                    onChange={handleChange}
                    placeholder="رمز المنتج"
                    required
                />
                <input
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    placeholder="اسم المنتج"
                    required
                />
                <input
                    type="text"
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    placeholder="الوصف"
                />
                <input
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    placeholder="السعر"
                    required
                />
                <input
                    type="number"
                    name="quantity"
                    value={product.quantity}
                    onChange={handleChange}
                    placeholder="الكمية"
                    required
                />
                <select name="category" value={product.category} onChange={handleChange} required>
                    <option value="">اختر التصنيف</option>
                    <option value="devices">اجهزة</option>
                    <option value="accessories">اكسسوارات</option>
                </select>
                <button type="submit">تحديث المنتج</button>
            </form>
        </>
    );
};

export default EditProduct;
