import React from "react";

function Header() {
  return (
    <header
      style={{
        backgroundColor: "var(--color-primary)",
        color: "#fff",
        padding: "1rem 0",
        textAlign: "center",
      }}
    >
      <div className="container">
        <h1 style={{ margin: 0 }}>DOMA</h1>
      </div>
    </header>
  );
}

export default Header;
