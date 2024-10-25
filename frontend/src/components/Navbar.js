import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css'; // Importing the external CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ isAdmin }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null); // Create a reference to the dropdown element
    const navigate = useNavigate(); // Initialize the useNavigate hook

    const toggleDropdown = (e) => {
        e.stopPropagation(); // Prevent click event from reaching the window listener
        setDropdownOpen(!dropdownOpen);
    };

    const closeDropdown = (e) => {
        // Close the dropdown if the click happens outside the dropdown element
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setDropdownOpen(false);
        }
    };

    // Add event listener when the dropdown opens
    useEffect(() => {
        if (dropdownOpen) {
            window.addEventListener('click', closeDropdown);
        } else {
            window.removeEventListener('click', closeDropdown);
        }

        // Cleanup event listener when the component unmounts or dropdown closes
        return () => {
            window.removeEventListener('click', closeDropdown);
        };
    }, [dropdownOpen]);

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear the token
        localStorage.removeItem('role'); // Clear the role
        navigate('/login'); // Redirect to login page
    };

    return (
        <nav className="navbar">
            {/* Logo in the right */}
            <div className="logo">
                <img src={`${process.env.PUBLIC_URL}/TarekLogo.png`} alt="Store Logo" className="logo-img" />
            </div>

            {/* Links in Arabic */}
            <ul className="nav-links">
                {isAdmin && (
                    <li className="nav-item">
                        <Link to="/registration" className="nav-link">تسجيل جديد</Link>
                    </li>
                )}
                <li className="nav-item">
                    <Link to="/dashboard" className="nav-link">المعاملات</Link>
                </li>
                <li className="nav-item">
                    <Link to="/suppliers" className="nav-link">الموردين</Link>
                </li>
                <li className="nav-item">
                    <Link to="/customers" className="nav-link">العملاء</Link>
                </li>
                <li className="nav-item">
                    <Link to="/inventory" className="nav-link">المخزن</Link>
                </li>
                <li className="nav-item">
                    <Link to="/account" className="nav-link">الجرد</Link>
                </li>

            </ul>

            {/* User icon with dropdown */}
            <div className="user-menu" ref={dropdownRef}>
                <FontAwesomeIcon
                    icon={faUserCircle}
                    size="2x"
                    className="user-icon"
                    onClick={toggleDropdown}
                    style={{ cursor: 'pointer' }} // Make sure the cursor is a pointer
                />
                {dropdownOpen && (
                    <ul className="dropdown" onClick={(e) => e.stopPropagation()}>
                        <li><Link to="/profile">الملف الشخصي</Link></li>
                        <li onClick={handleLogout}>تسجيل الخروج</li>
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
