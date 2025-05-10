import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../context/authService"; // Backend API call
import domalogo from "../images/domalogo.png";
import './style/Login.css';
import { jwtDecode } from "jwt-decode";  // ✅ Import jwtDecode

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(email, password);  // ✅ Get the token response
      const decoded = jwtDecode(data.token);      // ✅ Decode the token
      const role = decoded.role;

      // ✅ Redirect based on role
      if (role === "seller") {
        navigate("/dashboard");
      } else {
        navigate("/catalog");
      }

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
    <div className="login-page">
      <div className="login-container">
        <img src={domalogo} alt="DOMA Logo" className="login-logo" />
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            className="login-email-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="login-password-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <a href="/forgot-password" className="login-forgot">Forgot Password?</a>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && <p className="login-error">{error}</p>}
        <p className="login-register-text">
          No account? <a href="/register" className="login-register-link">Sign up!</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
