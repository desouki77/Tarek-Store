import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/Client.css'

const Clients = () => {
    const [client, setClient] = useState({
        name: '',
        phoneNumber: '',
        notes: '',
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
            setClient({ name: '', phoneNumber: '', notes: '' }); // Clear form
            fetchClients(); // Refresh client list
        } catch (error) {
            setMessage('خطأ في اضافة العميل');
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

    const handleDeleteSupplier = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/clients/${id}`);
            setMessage(response.data.message);
            fetchClients(currentPage); 
        } catch (error) {
            setMessage('خطأ في مسح العميل');
            console.error(error);
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
                            <label htmlFor="notes">تعليقات:</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={client.notes}
                                onChange={handleChange}
                                className="clients-form-textarea"
                            ></textarea>
                        </div>
                        <button type="submit" className="clients-form-button">
                            اضافة عميل
                        </button>
                    </form>
                </div>

                {/* Client Table */}
                <div className="clients-table-container">
                    <h2 className="clients-table-title">جميع العملاء</h2>
                    <table className="clients-table">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>رقم الموبايل</th>
                                <th>تعليقات</th>
                                {isAdmin && <th>حذف</th>} {/* Show delete button only for admins */}
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr key={client._id}>
                                    <td>{client.name}</td>
                                    <td>{client.phoneNumber}</td>
                                    <td>{client.notes || 'N/A'}</td>
                                    {isAdmin && (
                                        <td>
                                            <button
                                                onClick={() => handleDeleteSupplier(client._id)}
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
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(1)}
                            className="clients-pagination-button"
                            disabled={currentPage === totalPages}
                        >
                            التالي
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Clients;
