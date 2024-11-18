import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';
import Loader from './Loader';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [loading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/branches');
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranches();

    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!branchId) {
      setError('Please select a branch.');
      return;
    }

    try {
      const selectedBranch = branches.find(branch => branch._id === branchId);
      if (!selectedBranch) {
        setError('Selected branch not found.');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/users/login', {
        username,
        password,
        branchId,
        branchName: selectedBranch.name,
      });

      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.user.role);
        localStorage.setItem('branchId', response.data.user.branchId);
        localStorage.setItem('branchName', selectedBranch.name);
        localStorage.setItem('userId', response.data.user.id);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('خطا في اسم المستخدم ام كلمة المرور');
    }
  };

  if (loading) {
    return <Loader />; // Display loading message
}

  return (
    <div className="login-component-container">
          <h2 className="login-component-title">تسجيل الدخول</h2>
          {error && <p className="login-component-error">{error}</p>}
          <form onSubmit={handleSubmit} className="login-component-form">
            <div className="login-component-form-group">
              <label htmlFor="username">اسم المستخدم</label>
              <input
                type="text"
                id="username"
                className="login-component-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="login-component-form-group">
              <label htmlFor="password">كلمة المرور</label>
              <input
                type="password"
                id="password"
                className="login-component-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="login-component-form-group">
              <label htmlFor="branch">اختر الفرع</label>
              <select
                id="branch"
                className="login-component-select"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                required
              >
                <option value="" disabled>Select Branch</option>
                {branches.map(branch => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="login-component-btn">دخول</button>
          </form>
    </div>
  );
};

export default Login;
