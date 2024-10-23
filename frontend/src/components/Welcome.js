import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Welcome.css'; // Import the CSS file

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login'); // Redirect to login after 30 seconds
    }, 2000); // 30 seconds

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [navigate]);

  return (
    <div className="welcome-container">
    <img src={`${process.env.PUBLIC_URL}/TarekLogo.png`} alt="Store Logo" />
    </div>
  );
};

export default Welcome;
