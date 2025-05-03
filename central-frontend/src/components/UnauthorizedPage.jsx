// components/UnauthorizedPage.jsx

import React from "react";
import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Unauthorized</h2>
      <p>You do not have permission to access this page.</p>
      <Link to="/">Return to Login</Link>
    </div>
  );
};

export default UnauthorizedPage;
