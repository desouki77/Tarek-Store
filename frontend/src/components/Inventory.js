// Inventory.js
import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/Inventory.css';
import { useNavigate } from 'react-router-dom'; // Import this at the top


const Inventory = () => {
  // Product state for adding new items
  const [product, setProduct] = useState({
    barcode: '',
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
  });

  const navigate = useNavigate(); // Set up the navigate function


  // State for managing added product confirmation
  const [addedProduct, setAddedProduct] = useState(null);
  
  // State for managing editing product
  const [editingProductId, setEditingProductId] = useState(null);

  // State for search and filter
  const [searchCategory, setSearchCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(5); // Customize items per page

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
      console.error('Error fetching product details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const branchId = localStorage.getItem('branchId');
    const productWithBranchId = { ...product, branchId };

    try {
      if (editingProductId) {
        // Update the product
        await axios.put(`http://localhost:5000/api/products/${editingProductId}`, productWithBranchId);
        console.log('Product updated successfully');
        
        // Update the search results state
        setSearchResults((prevResults) =>
          prevResults.map((item) =>
            item.barcode === editingProductId ? { ...item, ...productWithBranchId } : item
          )
        );
      } else {
        const response = await axios.post('http://localhost:5000/api/products/add', productWithBranchId);
        console.log('Product added to inventory:', response.data);
        setAddedProduct(response.data.product);
      }

      // Reset product and editing state
      setProduct({ barcode: '', name: '', description: '', price: '', quantity: '', category: '' });
      setEditingProductId(null);
      setTimeout(() => {
        setAddedProduct(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error adding/updating product to inventory:', error);
    }
  };

  const fetchSearchResults = async () => {
    const branchId = localStorage.getItem('branchId');
  
    try {
      const response = await axios.get(`http://localhost:5000/api/products`, {
        params: { 
          category: searchCategory, 
          query: searchQuery,
          branchId 
        },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSearchResults();
  };

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = searchResults.slice(indexOfFirstResult, indexOfLastResult);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEdit = (productId) => {
    const productToEdit = searchResults.find((item) => item._id === productId);
    setProduct({
      barcode: productToEdit.barcode,
      name: productToEdit.name,
      description: productToEdit.description,
      price: productToEdit.price,
      quantity: productToEdit.quantity,
      category: productToEdit.category,
    });
    setEditingProductId(productToEdit.barcode); // Set barcode here
  };

  const handleDelete = async (barcode, branchId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${barcode}`, {
          params: { branchId: branchId },
        });
  
        // Update the search results after deletion
        setSearchResults((prevResults) => prevResults.filter((item) => item.barcode !== barcode));
        console.log('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <>
      <Navbar isAdmin={isAdmin} />

      {/* Search and Filter Section */}
      <section>
        <form onSubmit={handleSearch}>
          <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
            <option value="">جميع التصنيفات</option>
            <option value="devices">اجهزة</option>
            <option value="accessories">اكسسوارات</option>
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باستخدام اسم المنتج او وصفه"
          />
          <button type="submit">بحث</button>
          <button type="button" onClick={() => navigate('/all-products')}>عرض جميع المنتجات</button> {/* Updated button */}

        </form>
      </section>

      {/* Display Search Results or Confirmation Message */}
      <section>
  {searchResults.length > 0 ? (
    <div>
      <table>
        <thead>
          <tr>
            <th>رمز المنتج</th> {/* Added header for barcode */}
            <th>اسم المنتج</th>
            <th>الوصف</th>
            <th>التصنيف</th>
            <th>الكمية</th>
            <th>السعر</th>
            <th>العمليات</th>
          </tr>
        </thead>
        <tbody>
          {currentResults.map((item) => (
            <tr key={item._id}>
              <td>{item.barcode}</td> {/* Added barcode data */}
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.category}</td>
              <td>{item.quantity}</td>
              <td>{item.price}</td>
              <td>
                <button onClick={() => handleEdit(item._id)}>تعديل</button>
                <button onClick={() => handleDelete(item.barcode, item.branchId)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Component */}
      <div className="pagination">
        {[...Array(Math.ceil(searchResults.length / resultsPerPage)).keys()].map((number) => (
          <button key={number + 1} onClick={() => paginate(number + 1)}>
            {number + 1}
          </button>
        ))}
      </div>
    </div>
  ) : (
    <p>لا توجد نتائج للبحث</p>
  )}
</section>

      {/* Add or Edit Product Section */}
      <section>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="barcode"
            value={product.barcode}
            onChange={handleBarcodeChange}
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
          <button type="submit">{editingProductId ? 'تحديث المنتج' : 'إضافة منتج'}</button>
        </form>
      </section>

      {addedProduct && <p>تمت إضافة المنتج: {addedProduct.name}</p>}
    </>
  );
};

export default Inventory;
