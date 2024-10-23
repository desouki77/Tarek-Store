import React from 'react';
import Navbar from './Navbar';

function Dashboard() {
    const role = localStorage.getItem('role'); // Get role from localStorage
    const isAdmin = role === 'admin'; // Determine if the user is an admin

    return ( 
        <div>
            <Navbar isAdmin={isAdmin} /> {/* Pass isAdmin to Navbar */}
            <h1>Welcome to the Dashboard</h1>
            {isAdmin && ( // Check if the user is an admin
                <div>
                    <h2>Admin Controls</h2>
                    <button>تسجيل جديد</button> {/* Admin specific button */}
                    {/* Add more admin controls here */}
                </div>
            )}
            {role === 'sales' && ( // Check if the user is a sales role
                <div>
                    <h2>Sales Dashboard</h2>
                    {/* Add sales-specific features here */}
                </div>
            )}
        </div>
    );
}
 
export default Dashboard;
