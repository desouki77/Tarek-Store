import React, { useState , useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import '../styles/Inventory.css';

const Inventory = () => {
  const branchId = localStorage.getItem('branchId');

  const [product, setProduct] = useState({
    barcode: '',
    name: '',
    sn: '',
    description: '',
    color: '',
    price: '',
    quantity: '',
    mainCategory: '',
    subCategory: '',
    thirdCategory: '',
    condition: '',
    supplier: '',
    branchId: branchId,
  });

  const navigate = useNavigate();
  const [addedProduct, setAddedProduct] = useState(null);
  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

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

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleBarcodeChange = (e) => {
    const scannedBarcode = e.target.value;
    setProduct((prevProduct) => ({
      ...prevProduct,
      barcode: scannedBarcode,
    }));
  };
  const handleSNChange = (e) => {
    const SN = e.target.value;
    setProduct((prevProduct) => ({
      ...prevProduct,
      sn: SN,
    }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // إعداد كائن المنتج مع التصنيف الكامل
    const productWithCategory = {
      ...product,
      mainCategory, // استخدام mainCategory بدلاً من category
      subCategory,  // استخدام subCategory بدلاً من category
      thirdCategory, // استخدام thirdCategory بدلاً من category
      condition,    // إضافة condition إذا تم تحديده
      supplier: product.supplier,
    };
  
    try {
      const response = await axios.post('http://localhost:5000/api/products/add', productWithCategory);
      setAddedProduct(response.data.product);
  
      // إعادة تعيين الحقول
      setProduct({
        barcode: '',
        name: '',
        sn: '',
        description: '',
        color: '',
        price: '',
        quantity: '',
        supplier:'',
        // إزالة category لأننا أصبحنا نستخدم الحقول الجديدة
      });
      setMainCategory('');
      setSubCategory('');
      setThirdCategory('');
      setCondition('');
  
      setTimeout(() => {
        setAddedProduct(null);
      }, 3000);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert('هذا المنتج موجود بالفعل. يرجى التحقق من رمز المنتج.');
      } else {
        console.error('خطأ في اضافة او تحديث المنتج', error);
      }
    }
  };

  const [suppliers, setSuppliers] = useState([]); // لتخزين قائمة الموردين

   // جلب الموردين من الـ API
   useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/suppliers');
        setSuppliers(response.data.suppliers);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };
    fetchSuppliers();
  }, []);
  

  return (
    <>
      <Navbar isAdmin={isAdmin} />

      <button className="inventory__all-products-btn" onClick={() => navigate('/all-products')}>
        عرض جميع المنتجات
      </button>
     
      <section className="inventory__section">
        <h2 className="inventory__heading">إضافة منتج</h2>
        <form className="inventory__form" onSubmit={handleSubmit}>
          <input
            className="inventory__input"
            type="text"
            name="barcode"
            value={product.barcode}
            onChange={handleBarcodeChange}
            placeholder="باركود ( اجباري )"
            required
          />
          <input
            className="inventory__input"
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="اسم المنتج ( اجباري )"
            required
          />
          <input
            className="inventory__input"
            type="text"
            name="sn"
            value={product.sn}
            onChange={handleSNChange}
            placeholder="رقم السريال ( ان وجد )"
          />
          <input
            className="inventory__input"
            type="text"
            name="description"
            value={product.description}
            onChange={handleChange}
            placeholder="الوصف ( ان وجد )"
          />
          <input
            className="inventory__input"
            type="text"
            name="color"
            value={product.color}
            onChange={handleChange}
            placeholder="اللون ( ان وجد )"
          />
          <input
            className="inventory__input"
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            placeholder="السعر ( اجباري )"
            required
          />
          <input
            className="inventory__input"
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            placeholder="الكمية ( اجباري )"
            required
          />
           <select
            className="inventory__select"
            name="supplier"
            value={product.supplier}
            onChange={handleChange}
          >
            <option value="">اختر المورد</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.name}>
                {supplier.name}
              </option>
            ))}
          </select>

          {/* Main Category Selection */}
          <select
            className="inventory__select"
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
              className="inventory__select"
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
                className="inventory__select"
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
              className="inventory__select"
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

          <button className="inventory__submit-btn" type="submit">
            إضافة المنتج
          </button>
        </form>
        {addedProduct && <p className="inventory__confirmation">تم إضافة المنتج: {addedProduct.name}</p>}
      </section>
    
    </>
  );
};

export default Inventory;
