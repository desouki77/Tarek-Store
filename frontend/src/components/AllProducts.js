import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/Inventory.css';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null); // Track the product being edited
  const [editFormData, setEditFormData] = useState({}); // Store form data for editing
  const branchId = localStorage.getItem('branchId');

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

  const handleEditClick = (product) => {
    setEditingProductId(product._id); // Set the ID of the product to be edited
    setEditFormData(product); // Pre-fill the form with the product data
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value }); // Update form data on change
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/products/id/${editingProductId}`, editFormData, {
        params: { branchId: branchId },
      });
      alert('تم تحديث المنتج بنجاح.'); // Alert in Arabic
      // Update the products state with the edited product
      setProducts(products.map(product => (product._id === editingProductId ? { ...product, ...editFormData } : product)));
      setEditingProductId(null); // Reset the editing state
    } catch (error) {
      console.error('Error updating product:', error);
      alert('فشل تحديث المنتج.'); // Alert in Arabic
    }
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
                <React.Fragment key={item._id}>
                  <tr>
                    <td>{item.barcode}</td>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}</td>
                    <td>
                      <button onClick={() => handleEditClick(item)}>تعديل</button> {/* Edit button */}
                      <button onClick={() => handleDelete(item.barcode)}>حذف</button> {/* Delete button */}
                    </td>
                  </tr>
                  {editingProductId === item._id && ( // Check if the current product is being edited
                    <tr>
                      <td colSpan={7}> {/* Merge columns for the edit form */}
                        <form onSubmit={handleEditSubmit}>
                          <div>
                            <label>اسم المنتج:</label>
                            <input
                              type="text"
                              name="name"
                              value={editFormData.name || ''}
                              onChange={handleEditChange}
                              required
                            />
                          </div>
                          <div>
                            <label>الوصف:</label>
                            <textarea
                              name="description"
                              value={editFormData.description || ''}
                              onChange={handleEditChange}
                              required
                            />
                          </div>
                          <div>
                            <label>التصنيف:</label>
                            <input
                              type="text"
                              name="category"
                              value={editFormData.category || ''}
                              onChange={handleEditChange}
                              required
                            />
                          </div>
                          <div>
                            <label>الكمية:</label>
                            <input
                              type="number"
                              name="quantity"
                              value={editFormData.quantity || ''}
                              onChange={handleEditChange}
                              required
                            />
                          </div>
                          <div>
                            <label>السعر:</label>
                            <input
                              type="number"
                              name="price"
                              value={editFormData.price || ''}
                              onChange={handleEditChange}
                              required
                            />
                          </div>
                          <button type="submit">تحديث المنتج</button>
                          <button type="button" onClick={() => setEditingProductId(null)}>إلغاء</button> {/* Cancel button */}
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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