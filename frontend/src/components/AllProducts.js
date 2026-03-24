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
  const [loading, setLoading] = useState(true); // حالة التحميل
  // eslint-disable-next-line no-unused-vars
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4321";


    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [thirdCategories, setThirdCategories] = useState([]);

    const [mainCategory, setMainCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [thirdCategory, setThirdCategory] = useState('');
    const [condition, setCondition] = useState('');

  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        const response = await axios.get(`http://localhost:4321/api/categories/main`);
        setMainCategories(response.data);
      } catch (error) {
        console.error("Error fetching main categories:", error);
      }
    };
  
    fetchMainCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMainCategoryChange = async (e) => {
    const selectedValue = e.target.value; // This is the value of the selected option

    if (!selectedValue) {
      setSubCategory('');
  }

    // If a valid category is selected
    setMainCategory(selectedValue); // Store the ID, not the name
    setSubCategory("");
    setThirdCategory("");
    setCondition("");
  
    try {
      const response = await axios.get(`http://localhost:4321/api/categories/sub/${selectedValue}`);
      setSubCategories(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const handleSubCategoryChange = async (e) => {
    const selectedSubCategory = e.target.value;
  
    setSubCategory(selectedSubCategory);
    setThirdCategory("");
    setCondition("");
  
    try {
      const response = await axios.get(`http://localhost:4321/api/categories/third/${selectedSubCategory}`);
      setThirdCategories(response.data);
    } catch (error) {
      console.error("Error fetching third-level categories:", error);
    }
  };

  const handleThirdCategoryChange = async (e) => {
    const selectedThirdCategory = e.target.value;

    setThirdCategory(selectedThirdCategory);
    setCondition("");
  };

  const [suppliers, setSuppliers] = useState([]);
  
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(`http://localhost:4321/api/suppliers`);
setSuppliers(response.data.suppliers || []);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };
  
    fetchSuppliers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSupplierName = (supplierId) => {
    if (!Array.isArray(suppliers)) {
      console.error("Suppliers is not an array:", suppliers);
      return "غير معروف";
    }
  
    const supplier = suppliers.find((sup) => sup._id === supplierId);
    return supplier ? supplier.name : "غير معروف";
  };
  
  
  


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // بدء التحميل
      try {
   
        // إرسال التصنيف مع البحث
        const response = await axios.get(`http://localhost:4321/api/products`, {
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
      }finally {
        setLoading(false); // انتهاء التحميل
      }
    };
  
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await axios.put(`http://localhost:4321/api/products/id/${editingProductId}`, editFormData);
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
        await axios.delete(`http://localhost:4321/api/products/${barcode}`);

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

  // Pagination: Calculate total pages
const totalPages = Math.ceil(products.length / productsPerPage);


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
            {mainCategories.map((category, index) => (
              <option key={category._id || index} value={category._id}> {/* Use _id for value */}
                {category.name}
              </option>
            ))}
          </select>

          {/* Subcategory Selection */}
          {mainCategory && mainCategory !== "67a20580dd7f21b281d8de66" &&(
            <select
              className="allproduct-category-select"
              name="subCategory"
              value={subCategory}
              onChange={handleSubCategoryChange}
              required
            >
              <option value="">اختر التصنيف الفرعي</option>
              {subCategories.map((sub, index) => (
                <option key={sub.id || index} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          )}

          {/* Third Category Selection */}
          {subCategory && thirdCategories.length >= 0 && (
              <select
                className="allproduct-category-select"
                name="thirdCategory"
                value={thirdCategory}
                onChange={handleThirdCategoryChange}
                required
              >
                <option value="">اختر النوع</option>
                {thirdCategories.map((type, index) => (
              <option key={type._id || index} value={type._id}>
                {type.name}
              </option>
            ))}
              </select>
            )}

             {/* Fourth Category Selection for Condition */}
          {mainCategory === '67a1f26527d7cae17d78f812' && (
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

        {loading ? (
          <p className="allproduct-loading">جارٍ تحميل المنتجات...</p>
        ) : currentProducts.length > 0 ? (
          <>
            <div className="allproduct-table-container">
              <table className="allproduct-table">
                <thead>
                  <tr>
                    <th>باركود</th>
                    <th>اسم المنتج</th>
                    <th>رقم السريال</th>
                    <th>اللون</th>
                    <th>التصنيف</th>
                    <th>المورد</th>
                    <th>الكمية</th>
                    <th>سعر الشراء</th>
                    <th>سعر البيع</th>
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
                        <td>{item.color}</td>
                        <td>
                        {item.mainCategory ? item.mainCategory.name : ""} <br />
                        {item.subCategory ? item.subCategory.name : ""} <br />
                        {item.thirdCategory ? item.thirdCategory.name : ""} <br />
                          {item.condition}
                        </td>
                        <td>{getSupplierName(item.supplier)}</td>
                        <td>{item.quantity}</td>
                        <td>{item.purchasePrice}</td>
                        <td>{item.sellingPrice}</td>
                        <td>
                          <button className="allproduct-edit-btn" onClick={() => handleEditClick(item)}>
                            تعديل
                          </button>
                          <button className="allproduct-delete-btn" onClick={() => handleDelete(item.barcode)}>
                            حذف
                          </button>
                        </td>
                      </tr>
                      {editingProductId === item._id && (
                        <tr className="allproduct-edit-form-row">
                          <td colSpan={10}>
                            <form onSubmit={handleEditSubmit} className="allproduct-edit-form">
                            <div className="allproduct-form-group">
                                <label>الاسم</label>
                                <input
                                  type="string"
                                  name="name"
                                  value={editFormData.name || ''}
                                  onChange={handleEditChange}
                                  required
                                  className="allproduct-form-input"
                                />
                              </div>
                              <div className="allproduct-form-group">
                                <label>سعر البيع:</label>
                                <input
                                  type="number"
                                  name="sellingPrice"
                                  value={editFormData.sellingPrice || ''}
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
                              <button type="submit" className="allproduct-update-btn">
                                تحديث المنتج
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingProductId(null)}
                                className="allproduct-cancel-btn"
                              >
                                إلغاء
                              </button>
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
                صفحة {currentPage} من {totalPages}
              </span>

              <button
                onClick={() => paginate(currentPage + 1)}
                className={`allproduct-pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                disabled={currentPage === totalPages}
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
