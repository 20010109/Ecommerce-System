import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasAgreed, setHasAgreed] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Check if the user has agreed to the terms
    if (!hasAgreed) {
      alert("You must agree to the terms and conditions!");
      return;
    }

    try {
      await register(email, password); // Send only email and password
      alert("Registration successful! Please log in.");
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <h1>DOMA</h1>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        /><br />
        <div>
          <input
            type="checkbox"
            id="terms"
            checked={hasAgreed}
            onChange={(e) => setHasAgreed(e.target.checked)}
          />
          <label htmlFor="terms">
            I have read and agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>.
          </label>
        </div>
        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;