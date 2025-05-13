import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSubscription } from '@apollo/client';
import { SUBSCRIBE_TO_PRODUCTS } from '../../graphql/subscriptions';
import './style/BuyerProductCatalog.css';

export default function BuyerProductCatalog() {
  const [category, setCategory] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  // Apollo subscription to products
  const { data, loading, error } = useSubscription(SUBSCRIBE_TO_PRODUCTS);

  // Fetch category list via REST (or GraphQL if available)
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:8001/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategoriesList(data.categories || []);
    } catch (err) {
      console.error('Fetch categories failed:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter products client-side
  const filteredProducts = (data?.products || []).filter((product) => {
    const matchName = searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchCategory = category ? product.category === category : true;
    const matchMin = priceMin ? parseFloat(product.base_price) >= parseFloat(priceMin) : true;
    const matchMax = priceMax ? parseFloat(product.base_price) <= parseFloat(priceMax) : true;
    return matchName && matchCategory && matchMin && matchMax;
  });

  if (loading) return <p className="loading-text">Loading...</p>;
  if (error) return <p className="error-text">{error.message}</p>;

  return (
    <div className="buyer-catalog">
      <h1>🛍️ Browse Our Catalog</h1>
      <div className="catalog-filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categoriesList.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min price"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max price"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
        />
        {/* Filters apply instantly since filtering is local */}
        <button onClick={() => {}}>Apply</button>
      </div>

      <div className="catalog-grid">
        {filteredProducts.length === 0 ? (
          <p>No results.</p>
        ) : (
          filteredProducts.map((product) => (
            <Link to={`/catalog/${product.id}`} key={product.id} className="catalog-card">
              <img src={product.image} alt={product.name} />
              <div className="catalog-card-body">
                <h2>{product.name}</h2>
                <p className="catalog-price">
                  PHP {parseFloat(product.base_price).toLocaleString()}
                </p>
                <p className="catalog-seller">Sold by {product.seller_username}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
