import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Inventory.css';

const EditProduct = () => {
    const { barcode } = useParams(); // This is the barcode from the URL
    const navigate = useNavigate();
    const branchId = localStorage.getItem('branchId');

    const [product, setProduct] = useState({
        barcode: '',
        name: '',
        description: '',
        price: '',
        quantity: '',
        category: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            if (!branchId) {
                alert('Branch ID is missing');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`https://tarek-store-backend.onrender.com/api/products/${barcode}`, {
                    params: { branchId: branchId },
                });
                if (response.status === 200) {
                    setProduct(response.data);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                setError('Failed to fetch product details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [barcode, branchId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if ((name === 'price' || name === 'quantity') && value < 0) {
            alert("Price and Quantity must be non-negative.");
            return;
        }
        setProduct({ ...product, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!branchId) {
            alert('Branch ID is missing');
            return;
        }

        const productWithBranchId = { ...product, branchId };

        try {
            setLoading(true);
            await axios.put(`https://tarek-store-backend.onrender.com/api/products/${barcode}`, productWithBranchId);
            alert('Product updated successfully.');
            navigate('/all-products'); // Redirect to the products page after successful update
        } catch (error) {
            console.error('Error updating product:', error);
            setError('Failed to update the product.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Consider using a spinner here
    }

    return (
        <>
            <Navbar isAdmin={localStorage.getItem('role') === 'admin'} />

            <h1>Edit Product</h1>
            {error && <p className="error-message">{error}</p>} {/* Show error messages */}
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
                <select name="category" value={product.category} onChange={handleChange}>
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
