import React from "react";
import { Link } from "react-router-dom";
import "./style/SellerDashboard.css";
import { FaBoxes, FaClipboardList, FaChartLine, FaMoneyBillWave } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const SellerDashboard = () => {
  // Get token + decode it to fetch the shopname
  const token = localStorage.getItem("token");
  let shopname = "Seller";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      shopname = decoded.shop_name || "Seller";
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  }


  // Placeholder data - connect to real data later
  const totalSales = 15230;
  const totalOrders = 48;
  const totalProducts = 15;

  return (
    <div className="seller-dashboard">
      <h2 className="dashboard-title">Welcome, {shopname}!</h2>
      <p className="dashboard-subtitle">
        Track your performance, manage your products, and stay updated with your orders.
      </p>

      {/* KPI Stats */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <FaMoneyBillWave className="kpi-icon" />
          <h3>Total Sales</h3>
          <p className="kpi-value">₱{totalSales.toLocaleString()}</p>
        </div>
        <div className="kpi-card">
          <FaClipboardList className="kpi-icon" />
          <h3>Total Orders</h3>
          <p className="kpi-value">{totalOrders}</p>
        </div>
        <div className="kpi-card">
          <FaBoxes className="kpi-icon" />
          <h3>Products Listed</h3>
          <p className="kpi-value">{totalProducts}</p>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <FaBoxes className="card-icon" />
          <h3>Inventory</h3>
          <p>View and manage your product listings.</p>
          <Link to="/inventory" className="dashboard-link">Go to Inventory</Link>
        </div>

        <div className="dashboard-card">
          <FaClipboardList className="card-icon" />
          <h3>Orders</h3>
          <p>Check your latest orders and order history.</p>
          <Link to="/seller/orders" className="dashboard-link">View Orders</Link>
        </div>

        <div className="dashboard-card">
          <FaChartLine className="card-icon" />
          <h3>Analytics</h3>
          <p>Track your sales performance and product trends.</p>
          <Link to="/analytics" className="dashboard-link">View Analytics</Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
