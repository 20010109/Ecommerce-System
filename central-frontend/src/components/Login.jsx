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

  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/Dashboard");
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid email or password.");
        } else if (err.response.status === 400) {
          setError("Please fill in all required fields.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
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
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <p className="register-link-text">
        No account? <a href="/register" className="register-link">Sign up!</a>
      </p>
    </div>
  );
};

export default Login;