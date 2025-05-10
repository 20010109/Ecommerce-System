import React from "react";
import { useQuery } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { GET_ORDER_BY_ID } from "../../graphql/queries";
import "./style/BuyerOrderDetails.css";

const BuyerOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_ORDER_BY_ID, {
    variables: { id: parseInt(id, 10) },
  });

  if (loading) return <p>Loading order details...</p>;
  if (error) return <p>Failed to load order details. Please try again later.</p>;

  const order = data?.orders_by_pk;

  if (!order) return <p>The order you are looking for does not exist.</p>;

  return (
    <div className="buyer-order-details-container">
      <h1 className="buyer-order-title">Order #{order.id}</h1>
      <div className="order-info">
        <p><strong>Order Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Payment Method:</strong> {order.payment_method}</p>
        <p><strong>Payment Status:</strong> {order.payment_status}</p>
      </div>

      <div className="order-items">
        <h2>Order Information</h2>
        {order.order_items.length === 0 ? (
          <p>No items found in this order.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Variation</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>{item.variant_name}</td>
                  <td>{item.quantity}</td>
                  <td>₱{parseFloat(item.subtotal).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="recipient-info">
        <h2>Recipient Information</h2>
        <p><strong>Name:</strong> {order.buyer_name}</p>
        <p><strong>Address:</strong> {order.shipping_address}</p>
        <p><strong>Contact No.:</strong> {order.contact_number}</p>
        <p><strong>Shipping Method:</strong> {order.shipping_method}</p>
      </div>

      <button className="back-button" onClick={() => navigate("/orders")}>
        BACK
      </button>
    </div>
  );
};

export default BuyerOrderDetails;