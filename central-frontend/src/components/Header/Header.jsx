import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style/Header.css';
import { jwtDecode } from 'jwt-decode';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    profileImageUrl: ''
  });
  const { cartCount, setCartCount } = useCart();

  const token = localStorage.getItem('token');
  let userRole = null;

  useEffect(() => {
      const fetchProfile = async () => {
        try {
          if (!token) return;
      
          const res = await fetch('http://localhost:8000/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
      
          if (!res.ok) throw new Error("Failed to fetch profile");
      
          const data = await res.json();
          setProfile({
            username: data.username,
            profileImageUrl: data.profile_image_url
          });
      
          // Decode token to get userId
          const decoded = jwtDecode(token);
          const userId = decoded["https://hasura.io/jwt/claims"]?.["x-hasura-user-id"];
      
          const cartRes = await fetch(`http://localhost:8006/cart/${userId}`);
          const cartData = await cartRes.json();
          setCartCount(cartData.length);
        } catch (err) {
          console.error('Failed to fetch profile/cart count:', err);
        }
      };
    fetchProfile();
  }, [token]);

  // Decode user role
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded['https://hasura.io/jwt/claims']?.['x-hasura-default-role'];
    } catch (err) {
      console.error('Failed to decode token:', err);
    }
  }

  const handleMyShopClick = () => {
    if (userRole === 'seller') {
      navigate('/dashboard');
    } else {
      navigate('/seller/register');
    }
  };

  // Live search debounce effect
  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      setIsSearching(true);
      fetch(`http://localhost:8001/products?name=${encodeURIComponent(searchInput)}`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data);
        })
        .catch((err) => console.error("Search error:", err))
        .finally(() => setIsSearching(false));
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
      setSearchResults([]); // Hide results after submission
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="brand">
          <FaShoppingCart className="brand-icon" />
          <h1 className="header-title">DOMA</h1>
        </div>

        <div className="search-bar-wrapper">
          <form onSubmit={handleSearchSubmit} className="search-bar-form">
              <input
                  type="text"
                  className="search-bar-input"
                  placeholder="Search for products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="search-bar-button">
                  🔍
              </button>
          </form>

          {searchResults.length > 0 && (
              <div className="search-results-dropdown">
                  {searchResults.map((product) => (
                      <div
                          key={product.id}
                          className="search-result-item"
                          onClick={() => {
                              navigate(`/catalog/${product.id}`);
                              setSearchInput('');
                              setSearchResults([]);
                          }}
                      >
                          <img
                              src={product.image}
                              alt={product.name}
                              className="search-result-image"
                          />
                          <div>
                              <p className="search-result-name">{product.name}</p>
                              <p className="search-result-price">${product.base_price}</p>
                          </div>
                      </div>
                  ))}
              </div>
            )}
        </div>

        <nav className="navbar">
          {userRole === 'buyer' && (
            <>
              <Link to="/catalog">Catalog</Link>
              <Link to="/orders">Orders</Link>
            </>
          )}

          {userRole === 'seller' && (
            <>
              <Link to="/inventory">Inventory</Link>
              <Link to="/seller/orders">Orders</Link>
            </>
          )}

          <Link to="/about">About</Link>

          {token && (
            <button onClick={handleMyShopClick} className="my-shop-button">
              My Shop
            </button>
          )}

          {userRole === 'buyer' && (
            <>
              <Link to="/cart" className="cart-icon">
                🛒
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            </>
          )}


          <div
            className="profile-area"
            onClick={() => navigate('/profile')}
            title="View profile"
          >
            <img
              src={profile.profileImageUrl || '/default-profile.png'}
              alt="Profile"
              className="profile-image"
            />
            <span className="profile-username">{profile.username}</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
