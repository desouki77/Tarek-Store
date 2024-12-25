import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/Client.css';

const Clients = () => {
    const [client, setClient] = useState({
        name: '',
        phoneNumber: '',
        amountRequired: 0,
    });
    const [clients, setClients] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [message, setMessage] = useState('');
    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';

    const handleChange = (e) => {
        setClient({ ...client, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/clients/add', client);
            setMessage(response.data.message);
            if (response.data.message === 'تم إضافة العميل بنجاح') {
                setClient({ name: '', phoneNumber: '', amountRequired: 0 }); // Clear form
                fetchClients(); // Refresh client list
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'خطأ في اضافة العميل');
            console.error(error);
        }
    };
    

    const fetchClients = async (page = 1) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/clients?page=${page}&limit=7`);
            setClients(response.data.clients);
            setCurrentPage(response.data.currentPage);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('خطأ في استراجع العملاء', error);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleDeleteClients = async (id) => {
        const confirmDelete = window.confirm('هل أنت متأكد أنك تريد حذف هذا العميل'); // Confirmation in Arabic
        if (confirmDelete) {
        try {
            const response = await axios.delete(`http://localhost:5000/api/clients/${id}`);
            setMessage(response.data.message);
            fetchClients(currentPage); 
        } catch (error) {
            setMessage('خطأ في مسح العميل');
            console.error(error);
        }
    }
    };

    const handlePageChange = (direction) => {
        const newPage = currentPage + direction;
        if (newPage >= 1 && newPage <= totalPages) {
            fetchClients(newPage);
        }
    };

    return (
        <>
            <Navbar isAdmin={isAdmin} />

            <div className="clients-container">
                {/* Add Client Form */}
                <div className="clients-form-container">
                    <h2 className="clients-form-title">اضافة عميل جديد</h2>
                    {message && <p>{message}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="clients-form-group">
                            <label htmlFor="name">الاسم:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={client.name}
                                onChange={handleChange}
                                className="clients-form-input"
                                required
                            />
                        </div>
                        <div className="clients-form-group">
                            <label htmlFor="phoneNumber">رقم الموبايل:</label>
                            <input
                                type="text"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={client.phoneNumber}
                                onChange={handleChange}
                                className="clients-form-input"
                                required
                            />
                        </div>
                        <div className="clients-form-group">
                            <label htmlFor="notes">المبلغ المطلوب:</label>
                            <input
                                type="text"
                                id="amountRequired"
                                name="amountRequired"
                                value={client.amountRequired}
                                onChange={handleChange}
                                className="clients-form-input"
                                required
                            />
                        </div>
                        <button type="submit" className="clients-form-button">
                            اضافة عميل
                        </button>
                    </form>
                </div>

                {/* Client Table */}
                {clients.length > 0 ? (
                    <>
                    <div className="clients-table-container">
                        <h2 className="clients-table-title">جميع العملاء</h2>
                        <table className="clients-table">
                            <thead>
                                <tr>
                                    <th>الاسم</th>
                                    <th>رقم الموبايل</th>
                                    <th>المبلغ المطلوب</th>
                                    {isAdmin && <th>حذف</th>} {/* Show delete button only for admins */}
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client._id}>
                                        <td>{client.name}</td>
                                        <td>{client.phoneNumber}</td>
                                        <td>{client.amountRequired || 0}</td>
                                        {isAdmin && (
                                            <td>
                                                <button
                                                    onClick={() => handleDeleteClients(client._id)}
                                                    className="clients-delete-button"
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
                      {/* Pagination */}
                      <div className="clients-pagination">
                            <button
                                onClick={() => handlePageChange(-1)}
                                className="clients-pagination-button"
                                disabled={currentPage === 1}
                            >
                                السابق
                            </button>
                            <span className="clients-pagination-info">
                                الصفحة {currentPage} من {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(1)}
                                className="clients-pagination-button"
                                disabled={currentPage === totalPages}
                            >
                                التالي
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="clients-no-data">لا توجد بيانات لعرضها</p>
                )}
            </div>
        </>
    );
};

export default Clients;
