import React from "react";
import { useSubscription } from "@apollo/client";
import { SUBSCRIBE_TO_ORDERS } from "../../graphql/subscriptions";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./style/SellerOrdersPage.css";

const SellerOrdersPage = () => {
  const navigate = useNavigate(); // Initialize navigate
  const { data, loading, error } = useSubscription(SUBSCRIBE_TO_ORDERS);

  if (loading) return <p className="seller-orders-loading">Loading orders...</p>;
  if (error) return <p className="seller-orders-error">Error fetching orders: {error.message}</p>;

  const orders = data?.orders || [];

  return (
    <div className="seller-orders-container">
      <h1 className="seller-orders-title">Orders</h1>

      <div className="seller-orders-table-container">
        {orders.length > 0 ? (
          <table className="seller-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Buyer Name</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.buyer_name}</td>
                  <td>{order.status}</td>
                  <td>₱{parseFloat(order.total_amount).toLocaleString()}</td>
                  <td>
                    <button
                      className="seller-orders-view-button"
                      onClick={() => navigate(`/seller/orders/${order.id}`)} // Use navigate here
                    >
                      VIEW
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="seller-orders-no-data">No orders available.</p>
        )}
      </div>
    </div>
  );
};

export default SellerOrdersPage;