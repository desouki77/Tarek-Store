import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faHome, faTimes } from '@fortawesome/free-solid-svg-icons'; // Import faTimes for close icon

const Navbar = ({ isAdmin }) => {
    const [burgerOpen, setBurgerOpen] = useState(false);
    const burgerRef = useRef(null);
    const navigate = useNavigate();

    // Toggle the burger menu
    const toggleBurger = () => {
        setBurgerOpen(!burgerOpen);
    };

    // Close the burger menu when clicking outside
    const closeBurger = (e) => {
        if (burgerRef.current && !burgerRef.current.contains(e.target)) {
            setBurgerOpen(false);
        }
    };

    useEffect(() => {
        if (burgerOpen) {
            // Add 'menu-open' class to body to handle the open state
            document.body.classList.add('menu-open');
            window.addEventListener('click', closeBurger);
        } else {
            // Remove 'menu-open' class to restore normal behavior
            document.body.classList.remove('menu-open');
            window.removeEventListener('click', closeBurger);
        }

        return () => {
            window.removeEventListener('click', closeBurger);
        };
    }, [burgerOpen]);

    // Logout function to clear user data and redirect to login
    const handleLogout = () => {
        localStorage.clear(); // Clear all local storage data
        navigate('/login'); // Redirect to login page
    };

    return (
        <nav className={`navbar ${burgerOpen ? 'navbar-hidden' : ''}`}>
            {/* Logo on the right */}
            <div className="logo">
                <img 
                    src={`${process.env.PUBLIC_URL}/TarekLogo.png`} 
                    alt="Store Logo" 
                    className="logo-img" 
                />
            </div>

            {/* Burger Icon */}
            <div className="burger" onClick={toggleBurger} ref={burgerRef}>
                <FontAwesomeIcon icon={faBars} size="2x" className="burger-icon" />
            </div>

            {/* Links in Arabic inside the burger menu */}
            <ul className={`nav-links ${burgerOpen ? 'open' : ''}`}>
                {burgerOpen && (
                    <div className="close-button" onClick={() => setBurgerOpen(false)}>
                        <FontAwesomeIcon icon={faTimes} size="2x" className="close-icon" />
                    </div>
                )}

                <li className="nav-item home-button">
                    <Link to="/dashboard" className="nav-link">
                        <FontAwesomeIcon icon={faHome} size="2x" className="home-icon" />
                    </Link>
                </li>

                {/* Admin-only links */}
                {isAdmin && (
                    <>
                        <li className="nav-item">
                            <Link to="/registration" className="nav-link">تسجيل جديد</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/sales" className="nav-link">الموظفين</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/reports" className="nav-link">التقارير</Link>
                        </li>
                    </>
                )}

                {/* Common links */}
                <li className="nav-item">
                    <Link to="/suppliers" className="nav-link">الموردين</Link>
                </li>
                <li className="nav-item">
                    <Link to="/customers" className="nav-link">العملاء</Link>
                </li>
                <li className="nav-item">
                    <Link to="/inventory" className="nav-link">المخزن</Link>
                </li>
                <li className="nav-item" onClick={handleLogout}>
                    <span className="nav-link" style={{ cursor: 'pointer' }}>تسجيل الخروج</span>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
