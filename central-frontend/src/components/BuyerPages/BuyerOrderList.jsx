import React from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDERS_BY_BUYER } from "../../graphql/queries"; // Import the query
import { useNavigate } from "react-router-dom";
import "./style/BuyerOrderList.css";

const BuyerOrderList = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_ORDERS_BY_BUYER, {
    variables: { buyerId: parseInt(localStorage.getItem("userId"), 10) }, // Replace with actual buyer ID
  });

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error fetching orders: {error.message}</p>;
  if (orders.length === 0) return <p>No orders found.</p>;
  const orders = data?.orders || [];

  return (
    <div className="buyer-orders-container">
      <h1 className="buyer-orders-title">My Orders</h1>
      <table className="buyer-orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.status}</td>
              <td>₱{parseFloat(order.total_amount).toLocaleString()}</td>
              <td>
                <button
                  className="view-order-button"
                  onClick={() => navigate(`/buyer/orders/${order.id}`)}
                >
                  VIEW
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BuyerOrderList;