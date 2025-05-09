import React from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { GET_PRODUCT_BY_ID } from "../../graphql/buyerCatalogQueries"; // Import GraphQL query
import './style/BuyerProductDetails.css';

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
    <div className="product-detail-container p-6">
      <h1 className="product-title text-3xl font-bold mb-4">{product.name}</h1>

      <div className="product-image-container mb-6">
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-image w-full max-w-lg object-cover rounded-lg"
        />
      </div>

      <p className="product-description text-lg text-gray-700 mb-4">{product.description}</p>
      <p className="product-price text-blue-600 font-bold text-2xl my-2">${product.base_price}</p>

      <div className="variants-section mt-6">
        <h2 className="variants-title text-xl font-semibold">Available Variants</h2>
        <ul className="variants-list list-disc ml-6 mt-3">
          {/* Displaying variants */}
          {product.product_variants_aggregate && product.product_variants_aggregate.aggregate.sum.stock_quantity > 0 ? (
            <li>
              {/* Example of displaying variant data */}
              <span className="variant-name font-medium">Size: M</span> - 
              <span className="variant-color">Color: Red</span> | 
              <span className="variant-stock">Stock: {product.product_variants_aggregate.aggregate.sum.stock_quantity}</span>
            </li>
          ) : (
            <p>No variants available.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
