import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api/authService";
import "./style/Register.css";
import domalogo from "../images/domalogo.png";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    address: "",
    isSeller: false,
    hasAgreed: false,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      username,
      email,
      password,
      confirmPassword,
      contactNumber,
      address,
      isSeller,
      hasAgreed,
    } = formData;

    if (!username.trim()) {
      alert("Username is required!");
      return;
    }

    if (!email.trim()) {
      alert("Email is required!");
      return;
    }

    if (!password) {
      alert("Password is required!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!contactNumber.trim()) {
      alert("Contact number is required!");
      return;
    }

    if (!address.trim()) {
      alert("Address is required!");
      return;
    }

    if (!hasAgreed) {
      alert("You must agree to the terms and conditions!");
      return;
    }

    try {
      await register(username, email, password, isSeller, contactNumber, address);
      alert("Registration successful! Please log in.");
      navigate("/");
    } catch (error) {
      alert(error.message || "Registration failed. Please try again.");
    }
  };

  return (
        <div className="register-container">
          <div className="register-card">
            <img
              src={domalogo}
              alt="DOMA Logo"
              className="register-logo"
            />
            <h1 className="register-title">Register</h1>
            <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="register-input"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="register-input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="register-input"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="register-input"
            required
          />
          <input
            type="text"
            name="contactNumber"
            placeholder="Contact Number"
            value={formData.contactNumber}
            onChange={handleChange}
            className="register-input"
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="register-input"
            required
          />
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isSeller"
                checked={formData.isSeller}
                onChange={handleChange}
              />
              Are you a seller?
            </label>
            <br />
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="hasAgreed"
                checked={formData.hasAgreed}
                onChange={handleChange}
              />
              I have read the{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Terms and Conditions
              </a>.
            </label>
          </div>
          <button type="submit" className="register-button">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
