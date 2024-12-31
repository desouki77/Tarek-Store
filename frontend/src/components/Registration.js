import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import '../styles/Registration.css';
import Loader from './Loader';


const Registration = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // Default to 'sales'
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setIsLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send registration data to the backend using Axios
      const response = await axios.post(
        'https://tarek-store-backend.onrender.com/api/users/register',
        {
          username,
          password,
          phone,
          role,
          salary,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Check if the response is successful
      if (response.status === 201) { // Assuming 201 is the status code for a successful registration
        navigate('/login'); // Redirect to login page upon success
      }
    } catch (err) {
         // تحقق من وجود رسالة خطأ من الباك إند
    const errorMessage =
    err.response && err.response.data && err.response.data.error
      ? err.response.data.error
      : 'حدث خطأ غير متوقع';
    setError(errorMessage);
    } finally {
    setIsLoading(false);
  }
  };

  if (loading) {
    return <Loader />; 
}

  return (
    <div className="registration-container">
      <h2 className="registration-component-title">تسجيل حساب جديد</h2>
      {error && <p className="login-component-error">{error}</p>}
      <form onSubmit={handleSubmit} className="login-component-form">
        <div className="registration-component-form-group">
          <label htmlFor="username">اسم المستخدم</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="registration-component-input"
          />
        </div>
        <div className="registration-component-form-group">
          <label htmlFor="password">كلمة المرور</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="registration-component-input"
          />
        </div>
        <div className="registration-component-form-group">
            <label htmlFor="phone">رقم الموبايل </label>
            <input
            type="string"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="registration-component-input"
          />
          </div>
        <div className="registration-component-form-group">
          <label htmlFor="role">نوع الحساب</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}  className="registration-component-select" required>
            <option value="">Select Type </option>
            <option value="sales">موظف مبيعات</option>
            <option value="admin">مدير</option>
          </select>
        </div>
        <div className="registration-component-form-group">
            <label htmlFor="salary"> المرتب </label>
            <input
            type="string"
            id="salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="registration-component-input"
          />
          </div>
        
        <button type="submit" className="registration-component-btn">تسجيل</button>
      </form>
    </div>
  );
};

export default Registration;
