import React from "react";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GET_ORDERS } from "../../graphql/queries"; // Adjust path if needed
import "./style/SellerOrdersPage.css"; // Create later for styling

const SellerOrdersPage = () => {
  const { loading, error, data } = useQuery(GET_ORDERS);
  const navigate = useNavigate();

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
                      onClick={() => navigate(`/seller/orders/${order.id}`)}
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
