import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/api";
import "./ProductCatalog.css"

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message));
  }, []);
 
  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!products.length) {
    return <div>Loading products...</div>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Product Catalog</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              width: "200px",
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{ width: "100%", height: "auto" }}
            />
            <h2>{product.name}</h2>
            <p>${product.basePrice}</p>
            {/* Optional: Link to product detail */}
            <Link to={`/products/${product.id}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalog;
