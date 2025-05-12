import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useLazyQuery } from "@apollo/client";
import { GET_ORDER_DETAILS } from "../../graphql/OrderQueries";
import { GET_PAYMENT_BY_ORDER_ID } from "../../graphql/Payment";
import { paymentClient } from "../../ApolloClient/ApolloClients";
import "./style/BuyerOrderDetails.css";

const BuyerOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showTransaction, setShowTransaction] = useState(false);

  const { loading, error, data } = useQuery(GET_ORDER_DETAILS, {
    variables: { id: parseInt(id, 10) },
  });

  const [fetchPayment, { data: paymentData, loading: paymentLoading, error: paymentError }] = useLazyQuery(GET_PAYMENT_BY_ORDER_ID, {
    client: paymentClient,
    fetchPolicy: "network-only",
  });

  const order = data?.orders_by_pk;

  const handleViewTransaction = () => {
    if (!showTransaction && order?.id) {
      fetchPayment({ variables: { orderId: order.id } });
    }
    setShowTransaction(!showTransaction);
  };

  if (loading) return <p>Loading order details...</p>;
  if (error) return <p>Failed to load order details. Please try again later.</p>;
  if (!order) return <p>The order you are looking for does not exist.</p>;

  return (
    <div className="buyer-order-detail-container">
      <h1>Order #{order.id}</h1>
      <div className="buyer-order-detail-grid">
        {/* Order Info */}
        <div className="buyer-order-info">
          <h2>Order Information</h2>
          <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Order Status:</strong> {order.status}</p>
          <div>
            <h3>Payment Info</h3>
            <p>Status: {order.payment_status}</p>
            <p>Paid At: {order.payment_verified_at ? new Date(order.payment_verified_at).toLocaleString() : "Not yet paid"}</p>

            <button className="buyer-view-transaction-button" onClick={handleViewTransaction}>
              {showTransaction ? "Hide" : "View"} Transaction
            </button>

            {showTransaction && (
              <div className="transaction-details">
                {paymentLoading && <p>Loading payment details...</p>}
                {paymentError && <p style={{ color: "red" }}>Error loading payment info.</p>}
                {!paymentLoading && paymentData?.getPaymentByOrderID ? (
                  <>
                    <p><strong>Amount:</strong> ₱{parseFloat(paymentData.getPaymentByOrderID.amount).toLocaleString()}</p>
                    <p><strong>Method:</strong> {paymentData.getPaymentByOrderID.paymentMethod}</p>
                    <p><strong>Provider:</strong> {paymentData.getPaymentByOrderID.paymentProvider || "N/A"}</p>
                    <p><strong>Status:</strong> {paymentData.getPaymentByOrderID.paymentStatus}</p>
                    <p><strong>Paid At:</strong> {paymentData.getPaymentByOrderID.paidAt
                      ? new Date(paymentData.getPaymentByOrderID.paidAt).toLocaleString()
                      : "Not yet paid"}
                    </p>
                    <p><strong>Reference Code:</strong> {paymentData.getPaymentByOrderID.transactionReference || "N/A"}</p>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Recipient Info */}
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

      {/* Back Button */}
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
