import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/Login.css"; // optional custom styles
import { login } from "../services/authService"; // Backend API call

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
      <h1 className="Title.text">DOMA</h1>
      <h2 className="Login.text">Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <p>
        No account? <a href="/register">Sign up!</a>
      </p>
    </div>
  );
};

export default Login;