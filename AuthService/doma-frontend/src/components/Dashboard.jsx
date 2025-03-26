// src/components/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
// import './Dashboard.css'; // Optional, for your styling

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove any auth tokens or state
    localStorage.removeItem('authToken');
    // Redirect to the login page
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome</h1>
      <p>You are now logged in.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
