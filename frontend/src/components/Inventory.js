// Inventory.js
import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/Inventory.css';

const Inventory = () => {
  // Product state for adding new items
  const [product, setProduct] = useState({
    barcode: '',
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '', // Added category field
  });

  // Confirmation state for added product
  const [addedProduct, setAddedProduct] = useState(null);

  // State for search and filter
  const [searchCategory, setSearchCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(5); // Customize items per page

  const role = localStorage.getItem('role'); // Get role from localStorage
  const isAdmin = role === 'admin'; // Determine if the user is an admin

  // Handle input changes for the product form
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  // Handle barcode scanning
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
      // Optionally, handle error (e.g., show a message)
    }
  };

  // Handle form submission for adding a new product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/products/add', product);
      console.log('Product added to inventory:', response.data); // Log the response
      setAddedProduct(response.data.product); // Set the added product data directly from the response

      // Clear product input fields
      setProduct({ barcode: '', name: '', description: '', price: '', quantity: '', category: '' });

      // Set a timeout to clear the confirmation message after 30 seconds
      setTimeout(() => {
        setAddedProduct(null); // Clear the confirmation after 30 seconds
      }, 3000);
      
    } catch (error) {
      console.error('Error adding product to inventory:', error);
    }
  };

  // Fetch search results based on search query and category
  const fetchSearchResults = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products`, {
        params: { category: searchCategory, query: searchQuery },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    fetchSearchResults();
  };

  // Pagination calculation
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = searchResults.slice(indexOfFirstResult, indexOfLastResult);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
        </form>
      </section>

      {/* Display Search Results or Confirmation Message */}
      <section>
  {searchResults.length > 0 ? (
    <div>
      <table>
        <thead>
          <tr>
            <th>اسم المنتج</th>
            <th>الوصف</th>
            <th>التصنيف</th>
            <th>الكمية</th>
          </tr>
        </thead>
        <tbody>
          {currentResults.map((item) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.category}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        resultsPerPage={resultsPerPage}
        totalResults={searchResults.length}
        paginate={paginate}
      />
    </div>
  ) : (
    <p>لا يوجد نتاجئج</p>
  )}
</section>

      {/* Add Item Section (Only for Admins) */}
      {isAdmin && (
        <section>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="barcode"
              value={product.barcode}
              onChange={handleBarcodeChange} // Use the barcode scan handler
              placeholder="Scan Barcode"
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
              <option value="">اختار تصنيف</option>
              <option value="devices">اجهزة</option>
              <option value="accessories">اكسسوارات</option>
            </select>
            <button type="submit">اضافة منتج</button>
          </form>
          
          {/* Confirmation Section for Added Product */}
          {addedProduct && (
            <div className="confirmation-message">
              <h3>تم اضافة المنتج بنجاح</h3>
              <p><strong>Barcode:</strong> {addedProduct.barcode}</p>
              <p><strong>اسم المنتج:</strong> {addedProduct.name}</p>
              <p><strong>الوصف:</strong> {addedProduct.description}</p>
              <p><strong>السعر:</strong> {addedProduct.price}</p>
              <p><strong>الكمية:</strong> {addedProduct.quantity}</p>
              <p><strong>التصنيف:</strong> {addedProduct.category}</p>
            </div>
          )}
        </section>
      )}
    </>
  );
};

// Pagination Component
const Pagination = ({ resultsPerPage, totalResults, paginate }) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalResults / resultsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul>
        {pageNumbers.map((number) => (
          <li key={number} onClick={() => paginate(number)} style={{ cursor: 'pointer', display: 'inline', padding: '5px' }}>
            {number}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Inventory;
