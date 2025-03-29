import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ProductCatalog from "./components/ProductCatalog";
import ProductDetail from "./components/ProductDetail";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/catalog" element={<ProductCatalog />} />
        <Route path="/catalog/:id" element={<ProductDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
