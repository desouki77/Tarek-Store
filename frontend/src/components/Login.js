// Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [branchId, setBranchId] = useState(''); // Keep the branch state as branchId
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if the user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard'); // Redirect to dashboard if logged in
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        username,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem('token', response.data.token); // Store token
        localStorage.setItem('role', response.data.user.role); // Store user role
        localStorage.setItem('branchId', branchId); // Store selected branch ID
        localStorage.setItem('userId', response.data.user._id); // Store user ID
        navigate('/dashboard'); // Redirect to dashboard
      }
    } catch (error) {
      setError('خطا في اسم المستخدم ام كلمة المرور');
    }
  };

  return (
    <div className="login-container">
      <h2>تسجيل الدخول</h2>
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
          <label htmlFor="branch">اختر الفرع</label>
          <select
            id="branch"
            value={branchId} // Use branchId for select value
            onChange={(e) => setBranchId(e.target.value)} // Update state on change
            required
          >
            <option value="">Select Branch</option>
            <option value="60c72b2f9b1d4c001f8e4b8a">فرع باراديس</option> {/* Use actual branch IDs */}
            <option value="60c72b2f9b1d4c001f8e4b8b">فرع النمسا</option> {/* Use actual branch IDs */}
          </select>
        </div>
        <button type="submit" className="btn">دخول</button>
      </form>
    </div>
  );
};

export default Login;
