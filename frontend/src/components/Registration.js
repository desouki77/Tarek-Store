import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import '../styles/Registration.css';

const Registration = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('sales'); // Default to 'sales'
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send registration data to the backend using Axios
      const response = await axios.post('http://localhost:5000/api/users/register', {
        username,
        password,
        role,
      });

      // Check if the response is successful
      if (response.status === 201) { // Assuming 201 is the status code for a successful registration
        navigate('/login'); // Redirect to login page upon success
      }
    } catch (err) {
      // Handle errors
      setError('فشل التسجيل. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="registration-container">
      <h2>تسجيل حساب جديد</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">اسم المستخدم</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">كلمة المرور</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">نوع الحساب</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="sales">موظف مبيعات</option>
            <option value="admin">مدير</option>
          </select>
        </div>
        <button type="submit" className="btn">تسجيل</button>
      </form>
    </div>
  );
};

export default Registration;