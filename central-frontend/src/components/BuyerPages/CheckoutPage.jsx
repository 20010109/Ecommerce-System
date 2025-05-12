import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { jwtDecode } from "jwt-decode";
import { orderClient, paymentClient } from "../../ApolloClient/ApolloClients";
import { CREATE_ORDER } from "../../graphql/OrderMutation";
import { VERIFY_ONLINE_PAYMENT } from "../../graphql/Payment";
import "./style/CheckoutPage.css";

export default function CheckoutPage() {
  const [createOrder] = useMutation(CREATE_ORDER, { client: orderClient });
  const [verifyPayment] = useMutation(VERIFY_ONLINE_PAYMENT, { client: paymentClient });

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const { cartItems, sellerId, sellerUsername } = location.state || {};

  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [paymentProvider, setPaymentProvider] = useState("GCash");

  const [gcashNumber, setGcashNumber] = useState("");
  const [gcashPin, setGcashPin] = useState("");

  const [paymayaEmail, setPaymayaEmail] = useState("");
  const [paymayaOtp, setPaymayaOtp] = useState("");

  const [ccNumber, setCcNumber] = useState("");
  const [ccExp, setCcExp] = useState("");
  const [ccCVV, setCcCVV] = useState("");

  const decoded = jwtDecode(token);
  const buyerId = parseInt(decoded["https://hasura.io/jwt/claims"]?.["x-hasura-user-id"]);
  const buyerName = decoded["https://hasura.io/jwt/claims"]?.["x-hasura-user-name"];

  const totalAmount = cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  const getCredentials = () => {
    switch (paymentProvider) {
      case "GCash":
        return JSON.stringify({ number: gcashNumber, pin: gcashPin });
      case "PayMaya":
        return JSON.stringify({ email: paymayaEmail, otp: paymayaOtp });
      case "CreditCard":
        return JSON.stringify({ card: ccNumber, expiry: ccExp, cvv: ccCVV });
      default:
        return "{}";
    }
  };

  const handlePlaceOrder = async () => {
    const orderPayload = {
      buyer_name: buyerName,
      seller_id: parseInt(sellerId),
      seller_username: sellerUsername,
      shipping_method: "delivery",
      shipping_address: address,
      contact_number: contact,
      payment_method: paymentMethod,
      order_items: cartItems.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        variant_name: item.variant_name,
        size: item.size,
        color: item.color,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        image_url: item.image_url,
      })),
    };
  
    try {
      const res = await fetch("http://localhost:8100/create-order", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });
  
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
  
      // Assume backend returns: { status: "order created", id: <orderId> }
      const result = await res.json();
      const newOrderId = result.id;
  
      if (paymentMethod === "online") {
        await verifyPayment({
          variables: {
            input: {
              paymentId: newOrderId,
              paymentProvider,
              credentials: getCredentials(),
            },
          },
        });
      }
  
      navigate(`/orders/${newOrderId}`);
    } catch (err) {
      console.error("❌ Order failed:", err);
      alert(err.message || "Something went wrong.");
    }
  };  

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      <input className="input" placeholder="Shipping Address" value={address} onChange={(e) => setAddress(e.target.value)} />
      <input className="input" placeholder="Contact Number" value={contact} onChange={(e) => setContact(e.target.value)} />

      <div className="radio-group">
        <label>
          <input type="radio" value="online" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} />
          Online Payment
        </label>
        <label>
          <input type="radio" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
          Cash on Delivery
        </label>
      </div>

      {paymentMethod === "online" && (
        <>
          <label>Select Payment Provider:</label>
          <select value={paymentProvider} onChange={(e) => setPaymentProvider(e.target.value)} className="input">
            <option value="GCash">GCash</option>
            <option value="PayMaya">PayMaya</option>
            <option value="CreditCard">Credit Card</option>
          </select>

          {paymentProvider === "GCash" && (
            <>
              <input className="input" placeholder="GCash Number" onChange={(e) => setGcashNumber(e.target.value)} />
              <input className="input" placeholder="GCash PIN" type="password" onChange={(e) => setGcashPin(e.target.value)} />
              <small>Try: <strong>09171234567 / PIN: 1234</strong></small>
            </>
          )}

          {paymentProvider === "PayMaya" && (
            <>
              <input className="input" placeholder="PayMaya Email" onChange={(e) => setPaymayaEmail(e.target.value)} />
              <input className="input" placeholder="OTP" onChange={(e) => setPaymayaOtp(e.target.value)} />
              <small>Try: <strong>test@paymaya.com / OTP: 000111</strong></small>
            </>
          )}

          {paymentProvider === "CreditCard" && (
            <>
              <input className="input" placeholder="Card Number" onChange={(e) => setCcNumber(e.target.value)} />
              <input className="input" placeholder="Expiry Date (MM/YY)" onChange={(e) => setCcExp(e.target.value)} />
              <input className="input" placeholder="CVV" onChange={(e) => setCcCVV(e.target.value)} />
              <small>Try: <strong>4111111111111111 / 12/25 / 123</strong></small>
            </>
          )}
        </>
      )}

      <button className="btn" onClick={handlePlaceOrder}>Confirm & Place Order</button>
    </div>
  );
}
