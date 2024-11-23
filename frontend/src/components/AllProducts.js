import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/AllProducts.css';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null); // Track the product being edited
  const [editFormData, setEditFormData] = useState({}); // Store form data for editing
  const role = localStorage.getItem('role'); // Get role from localStorage
  const isAdmin = role === 'admin'; // Determine if the user is an admin
  const [searchQuery, setSearchQuery] = useState(''); // For the search input
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const productsPerPage = 10; // Number of products per page

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products', {
          params: {
            category: selectedCategory,
            query: searchQuery,
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.error('خطأ في استرجاع المنتجات', error);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory]);

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
      await axios.put(`http://localhost:5000/api/products/id/${editingProductId}`, editFormData);
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
        await axios.delete(`http://localhost:5000/api/products/${barcode}`);

        // Remove the deleted product from the state
        setProducts(products.filter(product => product.barcode !== barcode));
        alert('تم حذف المنتج بنجاح.'); // Alert in Arabic
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('فشل حذف المنتج.'); // Alert in Arabic
      }
    }
  };

  // Pagination: Get the current page products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Pagination: Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Pagination: Create page numbers
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(products.length / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <section className="allproduct-section">
        <h2 className="allproduct-title">جميع المنتجات </h2>

        {/* Search and Filter Section */}
        <div className="allproduct-search-section">
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="allproduct-search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="allproduct-category-select"
          >
            <option value="">كل التصنيفات</option>
            <option value="devices">اجهزة</option>
            <option value="accessories">إكسسوارات</option>
            {/* Add more categories dynamically if needed */}
          </select>
        </div>

        {currentProducts.length > 0 ? (
          <table className="allproduct-table">
            <thead>
              <tr>
                <th>رمز المنتج</th>
                <th>اسم المنتج</th>
                <th>الوصف</th>
                <th>التصنيف</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((item) => (
                <React.Fragment key={item._id}>
                  <tr className="allproduct-table-row">
                    <td>{item.barcode}</td>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}</td>
                    <td>
                      <button className="allproduct-edit-btn" onClick={() => handleEditClick(item)}>تعديل</button>
                      <button className="allproduct-delete-btn" onClick={() => handleDelete(item.barcode)}>حذف</button>
                    </td>
                  </tr>
                  {editingProductId === item._id && (
                    <tr className="allproduct-edit-form-row">
                      <td colSpan={7}>
                        <form onSubmit={handleEditSubmit} className="allproduct-edit-form">
                          <div className="allproduct-form-group">
                            <label>اسم المنتج:</label>
                            <input
                              type="text"
                              name="name"
                              value={editFormData.name || ''}
                              onChange={handleEditChange}
                              required
                              className="allproduct-form-input"
                            />
                          </div>
                          <div className="allproduct-form-group">
                            <label>الوصف:</label>
                            <textarea
                              name="description"
                              value={editFormData.description || ''}
                              onChange={handleEditChange}
                              required
                              className="allproduct-form-input"
                            />
                          </div>
                          <div className="allproduct-form-group">
                            <label>التصنيف:</label>
                            <input
                              type="text"
                              name="category"
                              value={editFormData.category || ''}
                              onChange={handleEditChange}
                              required
                              className="allproduct-form-input"
                            />
                          </div>
                          <div className="allproduct-form-group">
                            <label>الكمية:</label>
                            <input
                              type="number"
                              name="quantity"
                              value={editFormData.quantity || ''}
                              onChange={handleEditChange}
                              required
                              className="allproduct-form-input"
                            />
                          </div>
                          <div className="allproduct-form-group">
                            <label>السعر:</label>
                            <input
                              type="number"
                              name="price"
                              value={editFormData.price || ''}
                              onChange={handleEditChange}
                              required
                              className="allproduct-form-input"
                            />
                          </div>
                          <button type="submit" className="allproduct-update-btn">تحديث المنتج</button>
                          <button type="button" onClick={() => setEditingProductId(null)} className="allproduct-cancel-btn">إلغاء</button>
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="allproduct-no-products">لا توجد منتجات تطابق معايير البحث</p>
        )}

        {/* Pagination Controls */}
        <div className="allproduct-pagination">
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`allproduct-pagination-btn ${currentPage === number ? 'active' : ''}`}
            >
              {number}
            </button>
          ))}
        </div>
      </section>
    </>
  );
};

export default AllProducts;
