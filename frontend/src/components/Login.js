import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]); // State to hold branch list
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch branches from the backend
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/branches');
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();

    // Check if the user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard'); // Redirect to dashboard if logged in
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure branchId is not empty before proceeding
    if (!branchId) {
        setError('Please select a branch.');
        return;
    }

    try {
        const selectedBranch = branches.find(branch => branch._id === branchId);

        // Optional: Check if the selected branch exists
        if (!selectedBranch) {
            setError('Selected branch not found.');
            return;
        }

        const response = await axios.post('http://localhost:5000/api/users/login', {
            username,
            password,
            branchId,
            branchName: selectedBranch.name, // Use selected branch name directly
        });

        if (response.status === 200) {
            // Save tokens and navigate
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.user.role);
            localStorage.setItem('branchId', response.data.user.branchId); // Correcting to response.data.user.branchId
            localStorage.setItem('branchName', selectedBranch.name); // Save branch name
            localStorage.setItem('userId', response.data.user.id);
            navigate('/dashboard');
        }
    } catch (error) {
        console.error('Login error:', error); // Log error for debugging
        setError('خطا في اسم المستخدم ام كلمة المرور'); // Set the error message
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
        <button type="submit" className="btn">دخول</button>
      </form>
    </div>
  );
};

export default Login;
