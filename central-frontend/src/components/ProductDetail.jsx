import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProductById } from "../services/productService";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductById(id)
      .then((data) => setProduct(data))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="container">Error: {error}</div>;
  if (!product) return <div className="container">Loading product details...</div>;

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <h2 style={{ color: "var(--color-primary)" }}>{product.name}</h2>
      <img
        src={product.image}
        alt={product.name}
        style={{ width: "300px", borderRadius: "4px", marginBottom: "1rem" }}
      />
      <p style={{ color: "var(--color-secondary)" }}>{product.description}</p>
      <p style={{ fontWeight: "bold", color: "var(--color-secondary)" }}>
        Price: ${product.basePrice}
      </p>
      {product.variants && product.variants.length > 0 && (
        <div>
          <h3 style={{ color: "var(--color-primary)" }}>Variants</h3>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {product.variants.map((variant) => (
              <li key={variant.id} style={{ marginBottom: "0.5rem" }}>
                <strong>Size:</strong> {variant.size}, <strong>Color:</strong>{" "}
                {variant.color}, <strong>Price:</strong> ${variant.price},{" "}
                <strong>Stock:</strong> {variant.stockQuantity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
