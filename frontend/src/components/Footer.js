import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p> جميع الحقوق محفوظة الطارق <span className="version">v2.1.1</span> &copy; {new Date().getFullYear()} </p>
       <p>Powered by Doss</p>

    </footer>
  );
};

export default Footer;
