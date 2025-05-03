import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductById, fetchProductVariantsById } from "../../services/productService";
import "./style/ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [error, setError] = useState(null);
  const [variantsError, setVariantsError] = useState(null);

  useEffect(() => {
    // Fetch product details
    fetchProductById(id)
      .then((data) => setProduct(data))
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    // Fetch product variants
    fetchProductVariantsById(id)
      .then((data) => setVariants(data))
      .catch((err) => setVariantsError(err.message));
  }, [id]);

  if (error) return <div className="error-message">Error: {error}</div>;
  if (!product) return <div className="loading-message">Loading product details...</div>;

  return (
    <div className="product-detail-container">
      <h2 className="product-title">{product.name}</h2>
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
      />
      <h3 className="product-details-header">Product Details</h3>
      <p className="product-description">{product.description}</p>
      <p className="product-price">
        Price: ${product.base_price}
      </p>
      <div className="variants-section">
        <h3 className="variants-title">Variants</h3>
        {variantsError && (
          <p className="error-message">Error loading variants: {variantsError}</p>
        )}
        {variants.length > 0 ? (
          <ul className="variants-list">
            {variants.map((variant) => (
              <li key={variant.id} className="variant-item">
                <strong>Size:</strong> {variant.size}, <strong>Color:</strong>{" "}
                {variant.color}, <strong>Price:</strong> ${variant.price},{" "}
                <strong>Stock:</strong> {variant.stock_quantity}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-variants-message">
            {variantsError ? "Failed to load variants." : "No variants available for this product."}
          </p>
        )}
      </div>
      <div className="order-section">
        <Link to="/catalog" className="order-link">
          Order
        </Link>
      </div>
      <br/>
      <Link to="/catalog" className="back-link">
        Back to Product Catalog
      </Link>
    </div>
  );
};

export default ProductDetail;