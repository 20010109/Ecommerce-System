import React from "react";
import { Link } from "react-router-dom";
import "./style/Header.css"

function Header() {
  return (
    <header className="header">
      <div className="header-div">
        <h1 className="header-title">DOMA</h1>
        <input
          type="text"
          className="search-bar"
          placeholder="Search..."
        />
        <div className="navbar-div">
          <Link to="/catalog" className="tocatalog" >Catalog</Link>
          <Link to="/order" className="toorder" >Order</Link>
          <Link to="/about" className="toabout" >About</Link>
      </div>
    </div>
      
    </header>
  );
}

export default Header;
