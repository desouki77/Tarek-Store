import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Assuming you have React Toastify installed
import { useNavigate } from 'react-router-dom'; // Correct hook




function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize the hook here


  const handleLogin = async () => {
    

    try {
      const response = await axios.post('/api/users/login', { username, password });
  
      // Check for successful login based on your API response
      if (response.data.success) { // Replace this with your actual success condition
        // Handle successful login
        toast.success('Login Successful!'); // Display toast notification
        // Redirect to the dashboard component
        navigate('/dashboard');
      } else {
        // Handle login error
        toast.error('Invalid username or password!'); // Display toast notification
      }
    } catch (error) {
      // Handle other errors (e.g., network issues)
      toast.error('An error occurred! Please try again.'); // Display toast notification
    }
  };

  return (
    <div>
      <h1>تسجيل الدخول</h1>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder='username'/>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='password'/>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
