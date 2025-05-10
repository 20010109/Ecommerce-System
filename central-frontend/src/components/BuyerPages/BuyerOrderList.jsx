import React from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDERS} from "../../graphql/queries";
import { useNavigate } from "react-router-dom";
import "./style/BuyerOrderList.css";

const BuyerOrderList = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_ORDERS); // ❌ remove variable injection

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error fetching orders: {error.message}</p>;

  const orders = data?.orders || []; // ✅ move this up
  if (orders.length === 0) return <p>No orders found.</p>;

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
  );
};

export default BuyerOrderList;