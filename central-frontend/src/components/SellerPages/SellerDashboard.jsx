import React from "react";
import { Link } from "react-router-dom";
import "./style/SellerDashboard.css"; // optional styles

const SellerDashboard = () => {
  return (
    <div className="seller-dashboard">
      <h2>Welcome to Your Seller Dashboard</h2>
      <p>Manage your products, track orders, and monitor your sales performance.</p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Inventory</h3>
          <p>View and manage your product listings.</p>
          <Link to="/inventory" className="dashboard-link">Go to Inventory</Link>
        </div>

        <div className="dashboard-card">
          <h3>Orders</h3>
          <p>Check your latest orders and order history.</p>
          <Link to="/orders" className="dashboard-link">View Orders</Link>
        </div>

        <div className="dashboard-card">
          <h3>Analytics</h3>
          <p>Track your sales performance and product trends.</p>
          <Link to="/analytics" className="dashboard-link">View Analytics</Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
