import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/productService";

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="container">Error: {error}</div>;
  if (!products.length) return <div className="container">Loading products...</div>;

  return (
    <div className="container">
      <h2 style={{ color: "var(--color-primary)" }}>Product Catalog</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/catalog/${product.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                border: `2px solid var(--color-accent)`,
                borderRadius: "4px",
                width: "220px",
                padding: "1rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                cursor: "pointer"
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "auto",
                  marginBottom: "0.5rem",
                  borderRadius: "4px"
                }}
              />
              <h3 style={{ margin: "0.5rem 0", fontSize: "1.1rem" }}>
                {product.name}
              </h3>
              <p style={{ color: "var(--color-secondary)" }}>
                ${product.base_price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalog;