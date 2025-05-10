import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_ORDER_DETAILS } from "../../graphql/queries";
import "./style/BuyerOrderDetails.css";

const BuyerOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_ORDER_DETAILS, {
    variables: { id: parseInt(id, 10) },
  });

  const order = data?.orders_by_pk;

  if (loading) return <p>Loading order details...</p>;
  if (error) return <p>Failed to load order details. Please try again later.</p>;
  if (!order) return <p>The order you are looking for does not exist.</p>;

  return (
    <div className="buyer-order-detail-container">
      <h1>Order #{order.id}</h1>
      <div className="buyer-order-detail-grid">
        {/* Order Information */}
        <div className="buyer-order-info">
          <h2>Order Information</h2>
          <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Order Status:</strong> {order.status}</p>
          <p><strong>Payment Method:</strong> {order.payment_method}</p>
          <p><strong>Payment Status:</strong> {order.payment_status}</p>
        </div>

        {/* Recipient Information */}
        <div className="buyer-recipient-info">
          <h2>Recipient Information</h2>
          <p><strong>Name:</strong> {order.buyer_name}</p>
          <p><strong>Address:</strong> {order.shipping_address}</p>
          <p><strong>Contact No.:</strong> {order.contact_number}</p>
          <p><strong>Shipping Method:</strong> {order.shipping_method}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="buyer-order-items">
        <h2>Order Items</h2>
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
        <p className="buyer-order-total"><strong>Subtotal:</strong> ₱{parseFloat(order.total_amount).toLocaleString()}</p>
      </div>

      {/* Actions */}
      <div className="buyer-order-actions">
        <button
          className="buyer-order-back-button"
          onClick={() => navigate("/orders")}
        >
          BACK
        </button>
      </div>
    </div>
  );
};

export default BuyerOrderDetails;