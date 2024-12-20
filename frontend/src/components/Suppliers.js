import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import "../styles/Suppliers.css";

const Suppliers = () => {
    const [supplier, setSupplier] = useState({
        name: '',
        phoneNumber: '',
        company: '',
        notes: '',
        moneyOwed: 0,
    });
    const [message, setMessage] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';

    const handleChange = (e) => {
        setSupplier({ ...supplier, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/suppliers/add', supplier);
            setMessage(response.data.message);
            setSupplier({ name: '', phoneNumber: '', company: '', notes: '', moneyOwed: 0 });
            fetchSuppliers();
        } catch (error) {
            setMessage('خطأ في اضافة المورد');
            console.error(error);
        }
    };

    const fetchSuppliers = async (page = 1) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/suppliers?page=${page}&limit=7`);
            setSuppliers(response.data.suppliers);
            setCurrentPage(response.data.currentPage);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('خطأ في استرجاع الموردين', error);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) fetchSuppliers(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) fetchSuppliers(currentPage + 1);
    };

    const handleDeleteSupplier = async (id) => {
        const confirmDelete = window.confirm('هل أنت متأكد أنك تريد حذف هذا المورد'); // Confirmation in Arabic
        if (confirmDelete){
        try {
            const response = await axios.delete(`http://localhost:5000/api/suppliers/${id}`);
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
    }, []);

    return (
        <>
            <Navbar isAdmin={isAdmin} />

            <div className="suppliers-container">
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
                        <div className="suppliers-form-group">
                            <label htmlFor="notes">تعليقات:</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={supplier.notes}
                                onChange={handleChange}
                                className="suppliers-form-textarea"
                            ></textarea>
                        </div>
                        <div className="suppliers-form-group">
                            <label htmlFor="moneyOwed"> المبلغ المستحق</label>
                            <input
                                type="text"
                                id="moneyOwed"
                                name="moneyOwed"
                                value={supplier.moneyOwed}
                                onChange={handleChange}
                                required
                                className="suppliers-form-input"
                            />
                        </div>
                        <button type="submit" className="suppliers-form-button">
                            اضافة مورد
                        </button>
                    </form>
                </div>

                {/* Suppliers Table */}
                {suppliers.length > 0 ? (
                    <>
                    <div className="suppliers-table-container">
                        <h2 className="suppliers-table-title">جميع الموردين</h2>
                        <table className="suppliers-table">
                            <thead>
                                <tr>
                                    <th>الاسم</th>
                                    <th>رقم الموبايل</th>
                                    <th>الشركة</th>
                                    <th>التعليقات</th>
                                    <th>المبلغ المستحق</th>
                                    {isAdmin && <th>حذف</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.map((sup, index) => (
                                    <tr key={index}>
                                        <td>{sup.name}</td>
                                        <td>{sup.phoneNumber}</td>
                                        <td>{sup.company || 'N/A'}</td>
                                        <td>{sup.notes || 'N/A'}</td>
                                        <td>{sup.moneyOwed || 0}</td>

                                        {isAdmin && (
                                            <td>
                                                <button
                                                    onClick={() => handleDeleteSupplier(sup._id)}
                                                    className="suppliers-delete-button"
                                                >
                                                    حذف
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                       
                    </div>
                     {/* Pagination Controls */}
                     <div className="suppliers-pagination">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="suppliers-pagination-button"
                            >
                                السابق
                            </button>
                            <span className="suppliers-pagination-info">
                                الصفحة {currentPage} من {totalPages}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="suppliers-pagination-button"
                            >
                                التالي
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="suppliers-no-data">لا يوجد موردين لعرضهم</p>
                )}
            </div>
        </>
    );
};

export default Suppliers;
