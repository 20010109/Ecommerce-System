import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../graphql/buyerCatalogQueries';
import { Link } from 'react-router-dom';
import './style/BuyerProductCatalog.css';

export default function BuyerProductCatalog() {
  const { loading, error, data } = useQuery(GET_PRODUCTS);

  if (loading) return <p className="loading-text">Loading products...</p>;
  if (error) {
    console.error('GraphQL error:', error);
    return <p className="error-text">Error loading products.</p>;
  }

  return (
    <div className="catalog-container">
      <h1 className="catalog-title">🛍️ Browse Our Catalog</h1>
      <div className="product-grid">
        {data.products.map((product) => (
          <Link
            to={`/catalog/${product.id}`}
            key={product.id}
            className="product-card-link"
          >
            <div className="product-card">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <h2 className="product-name">{product.name}</h2>
                <p className="product-category">{product.category}</p>
                <p className="product-price">${product.base_price}</p>
                <p className="product-seller">
                  Seller: {product.seller_username}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
