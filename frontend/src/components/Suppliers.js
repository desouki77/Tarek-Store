import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import "../styles/Suppliers.css";
import { useNavigate } from 'react-router-dom';

const Suppliers = () => {
    const [supplier, setSupplier] = useState({
        name: '',
        phoneNumber: '',
        company: '',
        notes: '',
        moneyOwed: '',
    });
    const [message, setMessage] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [totalMoneyOwed, setTotalMoneyOwed] = useState(0); // ✅ total money owed
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [noSuppliers, setNoSuppliers] = useState(false);
    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';
    const API_URL = process.env.REACT_APP_API_URL;

    const handleChange = (e) => {
        setSupplier({ ...supplier, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/api/suppliers/add`, supplier);
            setMessage(response.data.message);
            setSupplier({ name: '', phoneNumber: '', company: '', moneyOwed: 0 });
            fetchSuppliers();
        } catch (error) {
            setMessage('خطأ في اضافة المورد');
            console.error(error);
        }
    };

    const fetchSuppliers = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/suppliers?page=${page}&limit=7`);
            const fetchedSuppliers = response.data.suppliers;

            if (fetchedSuppliers.length === 0) {
                setNoSuppliers(true);
            } else {
                setNoSuppliers(false);
            }

            setSuppliers(fetchedSuppliers);
            setCurrentPage(response.data.currentPage);
            setTotalPages(response.data.totalPages);

            setTotalMoneyOwed(response.data.totalMoneyOwedAll);


        } catch (error) {
            console.error('خطأ في استرجاع الموردين', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) fetchSuppliers(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) fetchSuppliers(currentPage + 1);
    };

    const handleDeleteSupplier = async (id) => {
        const confirmDelete = window.confirm('هل أنت متأكد أنك تريد حذف هذا المورد');
        if (confirmDelete) {
            try {
                const response = await axios.delete(`${API_URL}/api/suppliers/${id}`);
                setMessage(response.data.message);
                fetchSuppliers(currentPage);
            } catch (error) {
                setMessage('خطأ في مسح المورد');
                console.error(error);
            }
        }
    };

    useEffect(() => {
        fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [editingSuppliertId, setEditingSupplierId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    const handleEditClick = (editSupplier) => {
        setEditingSupplierId(editSupplier._id);
        setEditFormData(editSupplier);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/api/suppliers/${editingSuppliertId}`, editFormData);
            const updatedSuppliers = suppliers.map(sup =>
                sup._id === editingSuppliertId ? { ...sup, ...editFormData } : sup
            );
            setSuppliers(updatedSuppliers);

            // ✅ Update total money owed after editing
            const total = updatedSuppliers.reduce((acc, sup) => acc + (parseFloat(sup.moneyOwed) || 0), 0);
            setTotalMoneyOwed(total);

            setEditingSupplierId(null);
        } catch (error) {
            console.error('Error updating product:', error);
            setMessage('خطأ في تحديث المورد');
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const navigate = useNavigate();

    const handleViewInvoices = (supplierId) => {
        localStorage.setItem("supplierId", supplierId);
        navigate(`/supplier/${supplierId}/invoices`);
    };

    return (
        <>
            <Navbar isAdmin={isAdmin} />

            <div className="suppliers-container">

                {/* ✅ Display total money owed at the top */}
                <div className="total-money-owed">
                    <h3>إجمالي المبلغ المستحق لجميع الموردين: {totalMoneyOwed.toFixed(2)} جنيه</h3>
                </div>

                {/* Suppliers Table */}
                {isLoading ? (
                    <p className="suppliers-loading">جاري تحميل الموردين...</p>
                ) : noSuppliers ? (
                    <p className="suppliers-no-data">لا يوجد موردين لعرضهم</p>
                ) : (
                    <>
                        <div className="suppliers-table-container">
                            <h2 className="suppliers-table-title">جميع الموردين</h2>
                            <table className="suppliers-table">
                                <thead>
                                    <tr>
                                        <th>الاسم</th>
                                        <th>رقم الموبايل</th>
                                        <th>الشركة</th>
                                        <th>المبلغ المستحق</th>
                                        <th>عمليات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.map((sup, index) => (
                                        <React.Fragment key={sup._id}>
                                            <tr>
                                                <td>{sup.name}</td>
                                                <td>{sup.phoneNumber}</td>
                                                <td>{sup.company || 'N/A'}</td>
                                                <td>{sup.moneyOwed || 0}</td>
                                                <td>
                                                    <button className="suppliers-edit-button" onClick={() => handleEditClick(sup)}>تعديل</button>
                                                    <button onClick={() => handleDeleteSupplier(sup._id)} className="suppliers-delete-button">حذف</button>
                                                    <button onClick={() => handleViewInvoices(sup._id)} className="suppliers-invoices-button">عرض الفواتير</button>
                                                </td>
                                            </tr>
                                            {editingSuppliertId === sup._id && (
                                                <tr className="supplier-edit-form-row">
                                                    <td colSpan={10}>
                                                        <form onSubmit={handleEditSubmit} className="supplier-edit-form">
                                                            <div className="supplier-form-group">
                                                                <label>المبلغ المستحق:</label>
                                                                <input
                                                                    type="number"
                                                                    name="moneyOwed"
                                                                    value={editFormData.moneyOwed || ''}
                                                                    onChange={handleEditChange}
                                                                    required
                                                                    className="supplier-form-input"
                                                                />
                                                            </div>
                                                            <button type="submit" className="supplier-update-button">تحديث المورد</button>
                                                            <button type="button" onClick={() => setEditingSupplierId(null)} className="supplier-cancel-button">إلغاء</button>
                                                        </form>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        

                        {/* Pagination Controls */}
                        <div className="suppliers-pagination">
                            <button onClick={handlePreviousPage} disabled={currentPage === 1} className="suppliers-pagination-button">السابق</button>
                            <span className="suppliers-pagination-info">الصفحة {currentPage} من {totalPages}</span>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="suppliers-pagination-button">التالي</button>
                        </div>

                                        {/* Add Supplier Form */}
                <div className="suppliers-form-container">
                    <h2 className="suppliers-form-title">اضافة مورد جديد</h2>
                    {message && <p className="suppliers-message">{message}</p>}
                    <form onSubmit={handleSubmit} className="suppliers-form">
                        <div className="suppliers-form-group">
                            <label htmlFor="name">الاسم:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={supplier.name}
                                onChange={handleChange}
                                required
                                className="suppliers-form-input"
                            />
                        </div>
                        <div className="suppliers-form-group">
                            <label htmlFor="phoneNumber">رقم الموبايل:</label>
                            <input
                                type="text"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={supplier.phoneNumber}
                                onChange={handleChange}
                                required
                                className="suppliers-form-input"
                            />
                        </div>
                        <div className="suppliers-form-group">
                            <label htmlFor="company">الشركة:</label>
                            <input
                                type="text"
                                id="company"
                                name="company"
                                value={supplier.company}
                                onChange={handleChange}
                                className="suppliers-form-input"
                            />
                        </div>
                        <button type="submit" className="suppliers-form-button">
                            اضافة مورد
                        </button>
                    </form>
                </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Suppliers;
