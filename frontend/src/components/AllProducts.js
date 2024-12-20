import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/AllProducts.css';

const AllProducts = () => {
  const branchId = localStorage.getItem('branchId');
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null); // Track the product being edited
  const [editFormData, setEditFormData] = useState({}); // Store form data for editing
  const role = localStorage.getItem('role'); // Get role from localStorage
  const isAdmin = role === 'admin'; // Determine if the user is an admin
  const [searchQuery, setSearchQuery] = useState(''); // For the search input
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const productsPerPage = 10; // Number of products per page
  const [totalProducts, setTotalProducts] = useState(0); // عدد المنتجات




  const [categories] = useState({
    اجهزة: {
      موبايلات: ['سامسونج', 'آيفون', 'هواوي', 'اوبو', 'ريلمي', 'فيفو', 'ريدمي ( شاومي )', 'هونر', 'نوكيا', 'جوجل', 'اخري'],
      سماعات: ['سماعات سلكية', 'سماعات اير بودز', 'سماعات بيتس', 'سماعات ستريو', 'اخري'],
      ساعات: ['ايفون', 'سامسونج', 'هواوي', 'اخري'],
      اضائات: ['رينج لايت', 'اخري'],
      ميكات: []
    },
    اكسسوارات: {
      جرابات: ['جرابات موبايلات', 'جرابات اير بودز', 'جرابات ساعات'],
      اسكرينات: [],
      شواحن: [],
      كابلات: [],
      'سترابات ساعات': [],
      'ميموري كارد': [],
      فلاشات: [],
      'لينسات كاميرة': [],
      'باور بانك': [],
      'حوامل موبايلات': [],
      بطاريات: []
    },
    others: {}
  });
  
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [thirdCategory, setThirdCategory] = useState('');
  const [condition, setCondition] = useState('');

  const handleMainCategoryChange = (e) => {
    setMainCategory(e.target.value);
    setSubCategory('');
    setThirdCategory('');
    setCondition('');
  };

  const handleSubCategoryChange = (e) => {
    setSubCategory(e.target.value);
    setThirdCategory('');
    setCondition('');
  };


  useEffect(() => {
    const fetchProducts = async () => {
      try {
   
        // إرسال التصنيف مع البحث
        const response = await axios.get('http://localhost:5000/api/products', {
          params: {
            mainCategory, // إرسال mainCategory
            subCategory,  // إرسال subCategory
            thirdCategory, // إرسال thirdCategory
            condition,    // إرسال condition
            query: searchQuery, // البحث
            branchId,
            
          },
        });
  
        setProducts(response.data);
        setTotalProducts(response.data.length); // تحديث عدد المنتجات
      } catch (error) {
        console.error('خطأ في استرجاع المنتجات', error);
      }
    };
  
    fetchProducts();
  }, [mainCategory, subCategory, thirdCategory, condition, searchQuery,branchId]); 
  
  
  

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
        <h2 className="allproduct-title">جميع المنتجات لدي الفرح</h2>

        {/* Search and Filter Section */}
        <div className="allproduct-search-section">
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="allproduct-search-input"
          />
            {/* Main Category Selection */}
            <select
            className="allproduct-category-select"
            name="mainCategory"
            value={mainCategory}
            onChange={handleMainCategoryChange}
            required
          >
            <option value="">اختر التصنيف الرئيسي</option>
            {Object.keys(categories).map((category) => (
              <option key={category} value={category}>
                {category === 'اجهزة' ? 'اجهزة' : category === 'اكسسوارات' ? 'اكسسوارات' : 'اخري'}
              </option>
            ))}
          </select>

          {/* Subcategory Selection */}
          {mainCategory && Object.keys(categories[mainCategory]).length > 0 && (
            <select
              className="allproduct-category-select"
              name="subCategory"
              value={subCategory}
              onChange={handleSubCategoryChange}
              required
            >
              <option value="">اختر التصنيف الفرعي</option>
              {Object.keys(categories[mainCategory]).map((sub, index) => (
                <option key={index} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}

          {/* Third Category Selection */}
          {subCategory &&
            categories[mainCategory][subCategory] &&
            categories[mainCategory][subCategory].length > 0 && (
              <select
                className="allproduct-category-select"
                name="thirdCategory"
                value={thirdCategory}
                onChange={(e) => setThirdCategory(e.target.value)}
                required
              >
                <option value="">اختر النوع</option>
                {categories[mainCategory][subCategory].map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}

             {/* Fourth Category Selection for Condition */}
          {mainCategory === 'اجهزة' && (
            <select
              className="allproduct-category-select"
              name="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              required
            >
              <option value="">اختر حالة المنتج</option>
              <option value="جديد">جديد</option>
              <option value="مستعمل">مستعمل</option>
            </select>
          )}
        </div>

        {/* عدد المنتجات */}
        <div className="allproduct-count">
          <h1>عدد المنتجات: {totalProducts}</h1>
        </div>

        {currentProducts.length > 0 ? (
          <>
           <div className="allproduct-table-container">
          <table className="allproduct-table">
            <thead>
              <tr>
                <th>باركود</th>
                <th>اسم المنتج</th>
                <th>رقم السريال</th>
                <th>الوصف</th>
                <th>اللون</th>
                <th>التصنيف</th>
                <th>المورد</th>
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
                    <td>{item.sn}</td>
                    <td>{item.description}</td>
                    <td>{item.color}</td>
                    <td>
                    {item.mainCategory} <br/>
                    {item.subCategory} <br/>
                    {item.thirdCategory} <br/>
                    {item.condition}
                    </td>
                    <td>{item.supplier}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}</td>
                    <td>
                      <button className="allproduct-edit-btn" onClick={() => handleEditClick(item)}>تعديل</button>
                      <button className="allproduct-delete-btn" onClick={() => handleDelete(item.barcode)}>حذف</button>
                    </td>
                  </tr>
                  {editingProductId === item._id && (
                    <tr className="allproduct-edit-form-row">
                      <td colSpan={10}>
                        <form onSubmit={handleEditSubmit} className="allproduct-edit-form">
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
          </div>
          <div className="allproduct-pagination">
        <button
          onClick={() => paginate(currentPage - 1)}
          className={`allproduct-pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
          disabled={currentPage === 1}
        >
          السابق
        </button>
        
        <span className="allproduct-pagination-info">
          صفحة {currentPage} من {pageNumbers}
        </span>

        <button
          onClick={() => paginate(currentPage + 1)}
          className={`allproduct-pagination-btn ${currentPage === pageNumbers.length ? 'disabled' : ''}`}
          disabled={currentPage === pageNumbers.length}
        >
          التالي
        </button>
      </div>
          </>
        ) : (
          <p className="allproduct-no-products">لا توجد منتجات تطابق معايير البحث</p>
        )}
        

     
      </section>
    </>
  );
};

export default AllProducts;
