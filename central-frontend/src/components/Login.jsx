import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/Login.css"; // optional custom styles
import { login } from "../services/authService"; // Backend API call
import domalogo from "./images/domalogo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password); // Call the backend API
      navigate("/Dashboard"); // Redirect to dashboard or another page
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <img src={domalogo} alt="domalogo.png" className="domalogo"/>
      <h2 className="Login.text">Login</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          className="email-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          className="password-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
        <br />
        <button type="submit" className="login-button">Login</button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <p className="register-link-text">
        No account? <a href="/register" className="register-link">Sign up!</a>
      </p>
    </div>
  );
};

export default Login;