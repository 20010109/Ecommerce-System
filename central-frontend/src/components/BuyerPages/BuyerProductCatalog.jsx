import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './style/BuyerProductCatalog.css';

export default function BuyerProductCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('name', searchQuery);
      if (category) queryParams.append('category', category);
      if (priceMin) queryParams.append('price_min', priceMin);
      if (priceMax) queryParams.append('price_max', priceMax);

      const res = await fetch(`http://localhost:8001/products?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products || data);
    } catch (err) {
      setError(err.message || 'Error loading products');
    } finally {
      setLoading(false);
    }
  };

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
    fetchProducts();
    fetchCategories();
  }, [location.search]);

  if (loading) return <p className="loading-text">Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

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
        <button onClick={fetchProducts}>Apply</button>
      </div>

      <div className="catalog-grid">
        {products.length === 0 ? (
          <p>No results.</p>
        ) : (
          products.map((product) => (
            <Link to={`/catalog/${product.id}`} key={product.id} className="catalog-card">
              <img src={product.image} alt={product.name} />
              <div className="catalog-card-body">
                <h2>{product.name}</h2>
                <p className="catalog-price">PHP {parseFloat(product.base_price).toLocaleString()}</p>
                <p className="catalog-seller">Sold by {product.seller_username}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
