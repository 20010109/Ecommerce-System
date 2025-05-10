import React from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDERS } from "../../graphql/queries";
import { useNavigate } from "react-router-dom";
import "./style/BuyerOrderList.css";

const BuyerOrderList = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_ORDERS);
  const orders = data?.orders || [];

  if (loading) return <p className="buyer-orders-loading">Loading orders...</p>;
  if (error) return <p className="buyer-orders-error">Error fetching orders: {error.message}</p>;
  if (orders.length === 0) return <p className="buyer-orders-no-data">No orders found.</p>;

  return (
    <div className="buyer-orders-container">
      <h1 className="buyer-orders-title">My Orders</h1>

      <div className="buyer-orders-table-container">
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
                    className="buyer-orders-view-button"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    VIEW
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BuyerOrderList;
