import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { VERIFY_ONLINE_PAYMENT } from "../../graphql/Payment"; // adjust this path

const BuyerPaymentPage = ({ payment }) => {
  const [credentials, setCredentials] = useState("");
  const [verifyPayment, { data, loading, error }] = useMutation(VERIFY_ONLINE_PAYMENT);

  const handleVerify = async () => {
    try {
      await verifyPayment({
        variables: {
          input: {
            paymentId: payment.id,
            paymentProvider: payment.paymentProvider || "GCash",
            credentials: credentials,
          },
        },
      });
      alert("✅ Payment verified successfully!");
    } catch (err) {
      alert("❌ Verification failed. Try 'valid' as dummy credentials.");
    }
  };

  const displayStatus = data?.verifyOnlinePayment?.paymentStatus || payment.paymentStatus;
  const displayPaidAt = data?.verifyOnlinePayment?.paidAt || payment.paidAt;
  const displayProvider = data?.verifyOnlinePayment?.paymentProvider || payment.paymentProvider;

  return (
    <div className="payment-container" style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Payment for Order #{payment.orderId}</h2>

      <p><strong>Method:</strong> {payment.paymentMethod}</p>
      <p><strong>Provider:</strong> {displayProvider || "—"}</p>
      <p><strong>Status:</strong> {displayStatus}</p>
      <p><strong>Paid At:</strong> {displayPaidAt ? new Date(displayPaidAt).toLocaleString() : "Not paid yet"}</p>

      {payment.paymentMethod === "online" && displayStatus !== "paid" && (
        <div style={{ marginTop: "20px" }}>
          <label htmlFor="credentials">Enter Dummy Payment Credentials:</label>
          <input
            id="credentials"
            type="text"
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            placeholder="Try typing: valid"
            className="border p-2 rounded w-full mt-2"
          />
          <button
            onClick={handleVerify}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
          >
            {loading ? "Verifying..." : "Verify Payment"}
          </button>
          {error && <p style={{ color: "red", marginTop: "10px" }}>{error.message}</p>}
        </div>
      )}

      {payment.paymentMethod === "cod" && displayStatus !== "paid" && (
        <p style={{ marginTop: "20px", color: "orange" }}>
          🚚 COD selected — awaiting verification.
        </p>
      )}

      {displayStatus === "paid" && (
        <p style={{ marginTop: "20px", color: "green" }}>
          ✅ Payment has been verified!
        </p>
      )}
    </div>
  );
};

export default BuyerPaymentPage;
