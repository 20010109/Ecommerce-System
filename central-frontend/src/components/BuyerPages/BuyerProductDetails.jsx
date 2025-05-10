import React from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { GET_PRODUCT_BY_ID } from "../../graphql/buyerCatalogQueries"; // Import GraphQL query
import "./style/BuyerProductDetails.css";

export default function BuyerProductDetails() {
  const { id } = useParams();

  // Fetch product details by ID using Apollo's useQuery hook
  const { loading, error, data } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: parseInt(id) }, // Pass the product ID as a variable
  });

  if (loading) return <p className="loading-message">Loading...</p>;
  if (error) return <p className="error-message">{error.message}</p>;
  if (!data || !data.products_by_pk) return <p className="error-message">Product not found.</p>;

  const product = data.products_by_pk;

  return (
    <div className="product-details-page">
      {/* Left Section: Image Gallery */}
      <div className="product-gallery">
        <div className="gallery-thumbnails">
          {product.product_variants?.map((variant, index) => (
            <img
              key={index}
              src={variant.image}
              alt={`Variant ${index + 1}`}
              className="thumbnail"
            />
          ))}
        </div>
        <div className="main-image">
          <img src={product.image} alt={product.name} />
        </div>
      </div>

      {/* Right Section: Product Details */}
      <div className="product-info">
        <h1 className="product-title">{product.name}</h1>
        <p className="product-category">{product.category}</p>
        <div className="product-pricing">
          <span className="current-price">₱{product.base_price.toLocaleString()}</span>
        </div>
        <p className="product-description">{product.description}</p>

        {/* Variants Section */}
        <div className="variants-section">
          <h2 className="variants-title">Available Variants</h2>
          <div className="variants-list">
            {product.product_variants?.map((variant) => (
              <div key={variant.id} className="variant-card">
                <img src={variant.image} alt={variant.variant_name} className="variant-image" />
                <p className="variant-details">
                  <strong>{variant.variant_name}</strong> - {variant.size} - {variant.color}
                </p>
                <p className="variant-stock">Stock: {variant.stock_quantity}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="add-to-bag-button">Add to Bag</button>
          <button className="favourite-button">Favourite</button>
        </div>
      </div>
    </div>
  );
}