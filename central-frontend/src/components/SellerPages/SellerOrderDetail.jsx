import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ORDER_DETAILS } from "../../graphql/OrderQueries";
import { UPDATE_ORDER_STATUS } from "../../graphql/mutations";
import "./style/SellerOrderDetail.css";

const SellerOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_ORDER_DETAILS, {
    variables: { id: parseInt(orderId, 10) },
  });

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);

  if (loading) return <p>Loading order details...</p>;
  if (error) return <p>Error fetching order details: {error.message}</p>;

  const order = data?.orders_by_pk;

  const handleUpdateStatus = async (newStatus) => {
    try {
      await updateOrderStatus({
        variables: { orderId: parseInt(orderId, 10), newStatus },
      });
      alert(`Order status updated to ${newStatus}`);
      navigate("/seller/orders");
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status.");
    }
  };

  return (
    <div className="seller-order-detail-container">
      <h1>Order #{order.id}</h1>
      <div className="seller-order-detail-grid">
        {/* Order Information */}
        <div className="seller-order-info">
          <h2>Order Information</h2>
          <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Order Status:</strong> {order.status}</p>
          <p><strong>Payment Method:</strong> {order.payment_method}</p>
          <p><strong>Payment Status:</strong> {order.payment_status}</p>
        </div>

        {/* Recipient Information */}
        <div className="seller-recipient-info">
          <h2>Recipient Information</h2>
          <p><strong>Name:</strong> {order.buyer_name}</p>
          <p><strong>Address:</strong> {order.shipping_address}</p>
          <p><strong>Contact No.:</strong> {order.contact_number}</p>
          <p><strong>Shipping Method:</strong> {order.shipping_method}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="seller-order-items">
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
        <p className="seller-order-total"><strong>Subtotal:</strong> ₱{parseFloat(order.total_amount).toLocaleString()}</p>
      </div>

      {/* Actions */}
      <div className="seller-order-actions">
        <button
          className="seller-order-complete-button"
          onClick={() => handleUpdateStatus("completed")}
        >
          COMPLETE
        </button>
        <button
          className="seller-order-cancel-button"
          onClick={() => handleUpdateStatus("cancelled")}
        >
          CANCEL
        </button>
        <button
          className="seller-order-back-button"
          onClick={() => navigate("/seller/orders")}
        >
          BACK
        </button>
      </div>
    </div>
  );
};

export default SellerOrderDetail;