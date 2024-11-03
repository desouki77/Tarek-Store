// AllProducts.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import Navbar from './Navbar';
import '../styles/Inventory.css';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const branchId = localStorage.getItem('branchId');
  const navigate = useNavigate(); // Initialize the navigate function

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products`, {
          params: { branchId: branchId },
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [branchId]);

  const handleEdit = (id) => {
    // Navigate to the edit page with the product ID
    navigate(`/edit-product/${id}`); // Adjust the path based on your routing
  };

  const handleDelete = async (barcode) => {
    const confirmDelete = window.confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟'); // Confirmation in Arabic
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${barcode}`, {
          params: { branchId: branchId }, // Include branchId if necessary
        });

        // Remove the deleted product from the state
        setProducts(products.filter(product => product.barcode !== barcode));
        alert('تم حذف المنتج بنجاح.'); // Alert in Arabic
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('فشل حذف المنتج.'); // Alert in Arabic
      }
    }
  };

  return (
    <>
      <Navbar isAdmin={true} /> {/* Assuming admin, adjust as needed */}
      <section>
        <h2>جميع المنتجات للفرع</h2>
        {products.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>رمز المنتج</th>
                <th>اسم المنتج</th>
                <th>الوصف</th>
                <th>التصنيف</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الإجراءات</th> {/* New header for actions */}
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item._id}>
                  <td>{item.barcode}</td>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price}</td>
                  <td>
                    <button onClick={() => handleEdit(item._id)}>تعديل</button> {/* Edit button */}
                    <button onClick={() => handleDelete(item.barcode)}>حذف</button> {/* Delete button */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>لا توجد منتجات في هذا الفرع</p>
        )}
      </section>
    </>
  );
};

export default AllProducts;
