import React, { useState , useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import '../styles/Inventory.css';

const Inventory = () => {
  const branchId = localStorage.getItem('branchId');
  // eslint-disable-next-line no-unused-vars
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4321";

  const [product, setProduct] = useState({
    barcode: '',
    name: '',
    sn: [],
    color: '',

    mainCategory: null,
    subCategory: null,
    thirdCategory: null,
    condition: '',

    supplier: null,
    quantity: null,

    purchasePrice: null,
    amountPaid: null,
    sellingPrice: null,

    branchId: branchId,
  });



  

  const [newSn, setNewSn] = useState([]); // To temporarily store input for new SN


  const [barcode, setBarcode] = useState(''); // New state for barcode input
  const [typingTimeout, setTypingTimeout] = useState(null);

    const [selectedSupplier, setSelectedSupplier] = useState(null); 
    // eslint-disable-next-line no-unused-vars
    const [supplier, setSupplier] = useState({
        name: '',
        phoneNumber: '',
        company: '',
      });

  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [addedProduct, setAddedProduct] = useState(null);
  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

 

  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [thirdCategories, setThirdCategories] = useState([]);

  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState(null);
  const [thirdCategory, setThirdCategory] = useState(null);
  const [condition, setCondition] = useState("");

  const[existQuantity,setExistQuantity]=useState(0);

  const handleSnChange = (e) => {
    setNewSn(e.target.value);
  };
  
  const addSn = () => {
    if (newSn.trim() !== "") {
      setProduct((prev) => ({
        ...prev,
        sn: [...prev.sn, newSn.trim()], // Add new SN to the array
      }));
      setNewSn("");
    }
  };
  
  const removeSn = (index) => {
    setProduct((prev) => ({
      ...prev,
      sn: prev.sn.filter((_, i) => i !== index), // Remove SN by index
    }));
  };

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
  
    if (selectedValue === "add-new") {
      handleAddMainCategory(); // Call the function to add a new main category
      return; // Exit the function early
    }
  
    // If a valid category is selected
    setMainCategory(selectedValue); // Store the ID, not the name
    setSubCategory(null);
    setThirdCategory(null);
    setCondition("");
  

    try {
      const response = await axios.get(`http://localhost:4321/api/categories/sub/${selectedValue}`);
      if (response.data.length > 0) {
        setSubCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  
  };

  const handleAddMainCategory = async () => {
    const newMainCategory = prompt("أدخل اسم التصنيف الرئيسي الجديد");
    if (newMainCategory) {
      try {
        const response = await axios.post(`http://localhost:4321/api/categories/add`, {
          name: newMainCategory,
          parent: null,
          level: 1,
        });
        setMainCategories((prevCategories) => [...prevCategories, response.data.category]);
        setMainCategory(response.data.category._id); // Set the new category as selected
      } catch (error) {
        console.error("Error adding new main category:", error);
      }
    }
  };

  const handleSubCategoryChange = async (e) => {
    const selectedSubCategory = e.target.value;
  
    if (selectedSubCategory === "add-new") {
      handleAddSubCategory(); // Call the function to add a new subcategory
      return; // Exit the function early
    }
  
    setSubCategory(selectedSubCategory);
    setThirdCategory(null);
    setCondition("");
  
    try {
      const response = await axios.get(`http://localhost:4321/api/categories/third/${selectedSubCategory}`);
      setThirdCategories(response.data);
    } catch (error) {
      console.error("Error fetching third-level categories:", error);
    }
  };

  const handleAddSubCategory = async () => {
    const newSubCategory = prompt("أدخل اسم التصنيف الفرعي الجديد");
    if (newSubCategory) {
      try {
        const response = await axios.post(`http://localhost:4321/api/categories/add`, {
          name: newSubCategory,
          parent: mainCategory, // Use the selected main category as the parent
          level: 2,
        });
        setSubCategories((prevSubCategories) => [...prevSubCategories, response.data.category]);
        setSubCategory(response.data.category._id); // Set the new subcategory as selected
      } catch (error) {
        console.error("Error adding new subcategory:", error);
      }
    }
  };

  const handleThirdCategoryChange = async (e) => {
    const selectedThirdCategory = e.target.value;
  
    if (selectedThirdCategory === "add-new") {
      handleAddThirdCategory(); // Call the function to add a new third category
      return; // Exit the function early
    }
    setThirdCategory(selectedThirdCategory);
    setCondition("");
  };

  const handleAddThirdCategory = async () => {
    const newThirdCategory = prompt("أدخل اسم النوع الجديد");
    if (newThirdCategory) {
      try {
        const response = await axios.post(`http://localhost:4321/api/categories/add`, {
          name: newThirdCategory,
          parent: subCategory, // Use the selected subcategory as the parent
          level: 3,
        });
        setThirdCategories((prevThirdCategories) => [...prevThirdCategories, response.data.category]);
        setThirdCategory(response.data.category._id); // Set the new third category as selected
      } catch (error) {
        console.error("Error adding new third category:", error);
      }
    }
  };

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };
  const resetProductFields = () => {
    setProduct({
      barcode: '',
      name: '',
      sn: [],
      color: '',
      mainCategory: null,
      subCategory: null,
      thirdCategory: null,
      condition: '',
      supplier: null,
      quantity: "",
      purchasePrice: "",
      amountPaid:"",
      sellingPrice: "",
      branchId: branchId,
      _id: null,
    });
    setMainCategory("");
    setSubCategory("");
    setThirdCategory("");
    setSelectedSupplier("");
    setSubCategories([]);
    setThirdCategories([]);
    setCondition('');
    setBarcode('');
  };


  const handleBarcodeChange = (e) => {
    const scannedBarcode = e.target.value;
    setBarcode(scannedBarcode);

    // Reset the form when characters are removed
    if (scannedBarcode.length < barcode.length) {
        resetProductFields();
    }

    // Clear the previous timeout
    if (typingTimeout) clearTimeout(typingTimeout);

    // Set a new timeout to delay the API call
    const timeout = setTimeout(async () => {
        if (!scannedBarcode) {
            resetProductFields();
            return;
        }

        try {
            const response = await axios.get(`http://localhost:4321/api/products/${scannedBarcode}`, {
                params: { branchId },
            });

            if (response.data) {
                setProduct({
                    ...response.data,
                    quantity:0,
                    sn: Array.isArray(response.data.sn) ? response.data.sn : [], 
                    branchId: response.data.branchId || branchId,
                    _id: response.data._id,
                });
                setMainCategory(response.data.mainCategory?._id || null);
                setSubCategory(response.data.subCategory?._id || null);
                setThirdCategory(response.data.thirdCategory?._id || null);
                setSelectedSupplier(response.data.supplier?._id || null);
                setCondition(response.data.condition || '');
                setExistQuantity(response.data.quantity);  

            }
        } catch (error) {
            console.error("Error fetching product by barcode:", error);
        }
    }, 500); // 500ms delay before fetching the product

    setTypingTimeout(timeout);
};

  const [suppliers, setSuppliers] = useState([]); // لتخزين قائمة الموردين
  // جلب الموردين من الـ API
  useEffect(() => {
   const fetchSuppliers = async () => {
     try {
       const response = await axios.get(`http://localhost:4321/api/suppliers`);
       if (response.data && response.data.suppliers) {
         setSuppliers(response.data.suppliers);
       }
     } catch (error) {
       console.error('Error fetching suppliers:', error);
     }
   };
   fetchSuppliers();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);
 

// eslint-disable-next-line no-unused-vars
const [showNewSupplierFields, setShowNewSupplierFields] = useState(false);

const handleSupplierChange = (e) => {
 const selectedValue = e.target.value;
 setSelectedSupplier(selectedValue);
 
 // إذا تم اختيار "إضافة مورد جديد"، أظهر الحقول
 if (selectedValue === 'new') {
   setShowNewSupplierFields(true);
   setSupplier({ name: '', phoneNumber: '', company: '' }); // إعادة تعيين القيم
 } else {
   setShowNewSupplierFields(false);
 }
};

const [newSupplier, setNewSupplier] = useState({
 name: '',
 phoneNumber: '',
 company: '',
 moneyOwed: 0,
});



const addNewSupplier = async () => {
  try {
    const response = await axios.post(`http://localhost:4321/api/suppliers/add`, {
      name: newSupplier.name,
      phoneNumber: newSupplier.phoneNumber,
      company: newSupplier.company,
      moneyOwed: 0
    });

    if (response.data && response.data.supplier) {
      setSuppliers([...suppliers, response.data.supplier]); // Add new supplier to list
      setNewSupplier({ name: '', phoneNumber: '', company: '' }); // Reset form fields
      setSelectedSupplier(response.data.supplier._id); // Select the newly added supplier
    }
  } catch (error) {
    console.error('Error adding supplier:', error);
  }
};

  
  useEffect(() => {
    if (mainCategory) {
      axios.get(`http://localhost:4321/api/categories/sub/${mainCategory}`)
        .then((response) => setSubCategories(response.data))
        .catch((error) => console.error("Error fetching subcategories:", error));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainCategory]);

  useEffect(() => {
    if (subCategory) {
      axios.get(`http://localhost:4321/api/categories/third/${subCategory}`)
        .then((response) => setThirdCategories(response.data))
        .catch((error) => console.error("Error fetching third categories:", error));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subCategory]);

  
  console.log(existQuantity);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { description, _id, ...filteredProduct } = product;
    const productWithCategory = {
      ...filteredProduct,
      mainCategory: mainCategory,
      subCategory: subCategory || null,
      thirdCategory: thirdCategory || null,
      condition: condition,
      supplier: selectedSupplier || null, 
      amountPaid: Number(product.amountPaid),
      purchasePrice: Number(product.purchasePrice),
      quantity: Number(product.quantity),
      sellingPrice: Number(product.sellingPrice),
      barcode: barcode,
    };
    const existingProduct = {
      ...product,
      mainCategory: mainCategory,
      subCategory: subCategory || null,
      thirdCategory: thirdCategory || null,
      condition: condition,
      supplier: selectedSupplier || null,
      amountPaid: Number(product.amountPaid),
      purchasePrice: Number(product.purchasePrice),
      quantity: Number(product.quantity) + existQuantity,
      sellingPrice: Number(product.sellingPrice),
    };
  
    // Calculate money owed for the current transaction
    const currentTransactionOwed = Number(product.purchasePrice) - Number(product.amountPaid);
  
    try {
      let productResponse;
      if (product._id) {
        // If product exists, update it
        productResponse = await axios.put(`http://localhost:4321/api/products/id/${product._id}`,
          existingProduct,
        );
      } else {
        // Otherwise, create a new product
        productResponse = await axios.post(`http://localhost:4321/api/products/add`, productWithCategory);
      }
  
      if (productResponse.status === 200 || productResponse.status === 201) {
        const productData = productResponse.data.product; 
        // Log the product data returned by the API
        console.log("Product Data from API:", productData);
  
        if(selectedSupplier){
          try {
            // Fetch the current supplier data to get their existing debt
            const supplierResponse = await axios.get(`http://localhost:4321/api/suppliers/${selectedSupplier}`);
            console.log("Supplier Response:", supplierResponse.data);
            
            // Extract the current money owed from supplier data
            // This handles different possible API response structures
            let currentSupplierOwed = 0;
            if (supplierResponse.data && typeof supplierResponse.data === 'object') {
              if (supplierResponse.data.moneyOwed !== undefined) {
                // Direct property on response data
                currentSupplierOwed = Number(supplierResponse.data.moneyOwed);
              } else if (supplierResponse.data.supplier && supplierResponse.data.supplier.moneyOwed !== undefined) {
                // Nested under 'supplier' property
                currentSupplierOwed = Number(supplierResponse.data.supplier.moneyOwed);
              }
            }
            
            console.log("Current Supplier Debt:", currentSupplierOwed);
            console.log("Current Transaction Debt:", currentTransactionOwed);
            
            // Calculate total new debt by adding current transaction to existing debt
            const totalMoneyOwed = currentSupplierOwed + currentTransactionOwed;
            console.log("New Total Debt:", totalMoneyOwed);
  
            // Prepare invoice data for this transaction
            const invoiceData = {
              productId: productData._id,
              productBarcode: productData.barcode,
              productName: productData.name,
              sn: productData.sn || [],
              color: productData.color || "",
              mainCategory: productData.mainCategory,
              subCategory: productData.subCategory || null,
              thirdCategory: productData.thirdCategory || null,
              condition: productData.condition || "",
              supplier: selectedSupplier || null,
              quantity: Number(product.quantity) || 0,
              purchasePrice: Number(product.purchasePrice) || 0,
              amountPaid: Number(product.amountPaid) || 0,
              sellingPrice: Number(product.sellingPrice) || 0,
              moneyOwed: currentTransactionOwed,
              invoiceStatus: currentTransactionOwed === 0 ? "خالص" : "غير خالص",
              branchId: branchId,
            };
            
            console.log("Invoice Data:", invoiceData);
            
            // Create product invoice
            await axios.post(`http://localhost:4321/api/productinvoice`, invoiceData);
            
            // Update supplier with new total debt
            const supplierUpdateResponse = await axios.put(
              `http://localhost:4321/api/suppliers/${selectedSupplier}`, 
              { moneyOwed: totalMoneyOwed }
            );
            console.log("Supplier Update Response:", supplierUpdateResponse.data);
            
            setAddedProduct(productData);
            alert(product._id ? 'تم تحديث المنتج بنجاح!' : 'تمت إضافة المنتج بنجاح!');
          } catch (supplierError) {
            console.error("Error processing supplier operations:", supplierError);
            console.error("Response data:", supplierError.response?.data);
            alert("حدث خطأ أثناء تحديث بيانات المورد. يرجى المحاولة مرة أخرى.");
          }
        } else {
          // If no supplier selected, just update product without supplier logic
          setAddedProduct(productData);
          alert(product._id ? 'تم تحديث المنتج بنجاح!' : 'تمت إضافة المنتج بنجاح!');
        }
      }
  
      // Reset fields
      resetProductFields();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      console.error("Error details:", error.response?.data);
      alert("حدث خطأ أثناء إرسال البيانات. يرجى التحقق من الحقول المطلوبة.");
    }
  };

  const addProductWithoutInvoice = async (e) => {
    e.preventDefault();
    
    const { description, _id, ...filteredProduct } = product;
    const productWithCategory = {
      ...filteredProduct,
      mainCategory: mainCategory,
      subCategory: subCategory || null,
      thirdCategory: thirdCategory || null,
      condition: condition,
      supplier: null, // Explicitly set to null
      amountPaid: 0, // Set to 0 since no invoice
      purchasePrice: 0, // Set to 0 since no invoice
      quantity: Number(product.quantity),
      sellingPrice: Number(product.sellingPrice),
      barcode: barcode,
    };
    
    const existingProduct = {
      ...product,
      mainCategory: mainCategory,
      subCategory: subCategory || null,
      thirdCategory: thirdCategory || null,
      condition: condition,
      supplier: null, // Explicitly set to null
      amountPaid: 0, // Set to 0 since no invoice
      purchasePrice: 0, // Set to 0 since no invoice
      quantity: Number(product.quantity) + existQuantity,
      sellingPrice: Number(product.sellingPrice),
    };
  
    try {
      let productResponse;
      if (product._id) {
        // If product exists, update it
        productResponse = await axios.put(`http://localhost:4321/api/products/id/${product._id}`,
          existingProduct,
        );
      } else {
        // Otherwise, create a new product
        productResponse = await axios.post(`http://localhost:4321/api/products/add`, productWithCategory);
      }
  
      if (productResponse.status === 200 || productResponse.status === 201) {
        const productData = productResponse.data.product;
        setAddedProduct(productData);
        alert(product._id ? 'تم تحديث المنتج بنجاح!' : 'تمت إضافة المنتج بنجاح!');
        resetProductFields();
      }
    } catch (error) {
      console.error("Error adding product without invoice:", error);
      alert("حدث خطأ أثناء إضافة المنتج. يرجى التحقق من الحقول المطلوبة.");
    }
  };

  return (
    <>
      <Navbar isAdmin={isAdmin} />

      <button className="inventory__all-products-btn" onClick={() => navigate('/all-products')}>
         جميع منتجات الفرع
      </button>
      <button className="inventory__all-products-btn" onClick={() => navigate('/all-products-invoices')}>
         جميع فواتير شراء الفرع
      </button>
      <section className="inventory__section">
        <h2 className="inventory__heading1">فاتورة منتج جديد</h2>
        <h2 className="inventory__heading2">المنتج</h2>
        <form className="inventory__form" onSubmit={handleSubmit}>
          <input
            className="inventory__input"
            type="text"
            name="barcode"
            value={barcode || product.barcode || ""}
            onChange={handleBarcodeChange}
            placeholder="امسح الباركود او ادخله يدويا"
            required
          />
          <input
            className="inventory__input"
            type="text"
            name="name"
            value={product.name || ""}
            onChange={handleChange}
            placeholder="اسم المنتج ( اجباري )"
            required
          />
            <div>
              <div>
                <input
                  type="text"
                  value={newSn || ""}
                  onChange={handleSnChange}
                  placeholder="اضف رقم السريال"
                />
                <button type="button" className='snbtn' onClick={addSn}>اضافة</button>
              </div>
              <ul>
                {Array.isArray(product.sn) && product.sn.map((sn, index) => (
                  <li key={index}>
                    {sn}
                    <button type="button" className='snbtn' onClick={() => removeSn(index)}>حذف</button>
                  </li>
                ))}
              </ul>
            </div>
          <input
            className="inventory__input"
            type="text"
            name="color"
            value={product.color || ""}
            onChange={handleChange}
            placeholder="اللون ( ان وجد )"
          />

          <h2 className="inventory__heading2">التصنيف</h2>
         {/* Main Category Selection */}
         <select className="inventory__select" name="mainCategory" value={mainCategory || ""} onChange={handleMainCategoryChange} required>
            <option value="">اختر التصنيف الرئيسي</option>
            {mainCategories.map((category, index) => (
              <option key={category._id || index} value={category._id}> {/* Use _id for value */}
                {category.name}
              </option>
            ))}
            <option value="add-new">اضافة تصنيف رئيسي جديد</option>
          </select>

           {/* Subcategory Selection */}
           {mainCategory !== "67a20580dd7f21b281d8de66" && mainCategory && subCategories.length >= 0 && (
            <select className="inventory__select" name="subCategory" value={subCategory || ""} onChange={handleSubCategoryChange} >
              <option value="">اختر التصنيف الفرعي</option>
              {subCategories.map((sub, index) => (
                <option key={sub.id || index} value={sub._id}>
                  {sub.name}
                </option>
              ))}
              <option value="add-new">اضافة تصنيف فرعي جديد</option>
            </select>
          )}

          {/* Thirdcategory Selection */}
        {subCategory && thirdCategories.length >= 0 && (
          <select className="inventory__select" name="thirdCategory" value={thirdCategory || ""} onChange={handleThirdCategoryChange} >
            <option value="">اختر النوع</option>
            {thirdCategories.map((type, index) => (
              <option key={type._id || index} value={type._id}>
                {type.name}
              </option>
            ))}
            <option value="add-new">اضافة تصنيف جديد</option>
          </select>
        )}

            {/* Fourth Category Selection for Condition */}
          {mainCategory === "67a1f26527d7cae17d78f812" && (
            <select
              className="inventory__select"
              name="condition"
              value={condition || ""}
              onChange={(e) => setCondition(e.target.value)}
              required
            >
              <option value="">اختر حالة المنتج</option>
              <option value="جديد">جديد</option>
              <option value="مستعمل">مستعمل</option>
            </select>
          )}
        <h2 className="inventory__heading2">المورد</h2>
     
        <select value={selectedSupplier || ""} onChange={handleSupplierChange} className="inventory__input">
        <option value="">اختر المورد</option>
        {suppliers.map((sup) => (
          <option key={sup._id} value={sup._id}>{sup.name}</option>
        ))}
        <option value="new">إضافة مورد جديد</option>
      </select>

      

        {/* حقول إضافة مورد جديد */}
        {selectedSupplier === "new" && (
          <div className="inventory-form">
            <input
              type="text"
              placeholder="اسم المورد"
              className="inventory-input-field"
              value={newSupplier.name || ""}
              onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="رقم الهاتف"
              className="inventory-input-field"
              value={newSupplier.phoneNumber || ""}
              onChange={(e) => setNewSupplier({...newSupplier, phoneNumber: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="الشركة"
              className="inventory-input-field"
              value={newSupplier.company || ""}
              onChange={(e) => setNewSupplier({...newSupplier, company: e.target.value })}
              required
            />
            <button
            type='button'
              className="inventory-submit-button"
              onClick={addNewSupplier}
            >
              إضافة المورد
            </button>
          </div>
        )}
          <input
            className="inventory__input"
            type="number"
            name="quantity"
            value={product.quantity || ""}
            onChange={handleChange}
            placeholder="الكمية ( اجباري )"
            required
          />
          <h2 className="inventory__heading2">السعر</h2>
          <input
            className="inventory__input"
            type="number"
            name="purchasePrice"
            value={product.purchasePrice || ""}
            onChange={handleChange}
            placeholder="سعر الشراء ( اجباري )"
          />
                    <input
            className="inventory__input"
            type="number"
            name="amountPaid"
            value={product.amountPaid || ""}
            onChange={handleChange}
            placeholder="المبلغ المدفوع ( ان وجد )"
          />
          <input
            className="inventory__input"
            type="number"
            name="sellingPrice"
            value={product.sellingPrice || ""}
            onChange={handleChange}
            placeholder="سعر البيع ( اجباري )"
            required
          />
          

          <div className="inventory__buttons-container">
            <button className="inventory__submit-btn" type="submit">
              اعتماد الفاتورة واضافة المنتج
            </button>
            
            {!selectedSupplier && (
              <button 
                className="inventory__submit-btn inventory__submit-btn--without-invoice"
                type="button"
                onClick={addProductWithoutInvoice}
              >
                إضافة منتج قديم (بدون فاتورة)
              </button>
            )}
          </div>
        </form>
      </section>
    
    </>
  );
};

export default Inventory;
