import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { applySeller } from "../../api/authService";
import "./style/RegisterSeller.css";  // Optional for styling

function RegisterSeller() {
  const [shopName, setShopName] = useState("");
  const [profileImageURL, setProfileImageURL] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!shopName.trim()) {
      alert("Shop name is required!");
      return;
    }

    try {
      const res = await applySeller(shopName, profileImageURL);
      setMessage(res.message);
      // Optionally auto-logout to refresh token:
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    } catch (err) {
      alert(err.message || "Failed to apply as seller.");
    }
  };

  return (
    <div className="register-seller-container">
      <h2>Become a Seller</h2>
      <p>Fill out the form below to open your shop.</p>
      {message ? (
        <div className="success-message">{message}</div>
      ) : (
        <form onSubmit={handleSubmit} className="register-seller-form">
          <input
            type="text"
            placeholder="Shop Name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="register-seller-input"
            required
          />
          <input
            type="text"
            placeholder="Profile Image URL (optional)"
            value={profileImageURL}
            onChange={(e) => setProfileImageURL(e.target.value)}
            className="register-seller-input"
          />
          <button type="submit" className="register-seller-button">
            Apply as Seller
          </button>
        </form>
      )}
    </div>
  );
}

export default RegisterSeller;
