import React from "react";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GET_ORDERS } from "../../graphql/queries"; // Adjust path if needed
import "../style/SellerOrdersPage.css"; // Create later for styling

const SellerOrdersPage = () => {
  const { loading, error, data } = useQuery(GET_ORDERS);
  const navigate = useNavigate();

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error fetching orders: {error.message}</p>;

  const orders = data?.orders || [];

  return (
    <div className="seller-orders-container">
      <h1 className="orders-title">Orders</h1>

      <div className="table-container">
        {orders.length > 0 ? (
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Buyer Name</th>
                <th>Status</th>
                <th>Total</th>
                <th></th>
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
                      className="view-button"
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
          <p>No orders available.</p>
        )}
      </div>
    </div>
  );
};

export default SellerOrdersPage;
