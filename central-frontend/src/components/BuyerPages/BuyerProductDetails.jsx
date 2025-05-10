import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./style/BuyerProductDetails.css";
import { useCart } from "../../context/CartContext";
import { jwtDecode } from "jwt-decode";


export default function BuyerProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const navigate = useNavigate(); 
  const { setCartCount } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:8001/products/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }
        const data = await response.json();
        setProduct(data);
        setSelectedImage({ src: data.image, alt: data.name });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleVariantSelect = (variant) => {
    if (variant.stock_quantity === 0) {
      alert("This variant is out of stock!");
      return;
    }
  
    // Toggle: deselect if clicking the same variant again
    if (selectedVariant && selectedVariant.id === variant.id) {
      setSelectedVariant(null);
      console.log("Variant deselected");
    } else {
      setSelectedVariant(variant);
      console.log("Variant selected:", variant);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !product) return;
  
    const token = localStorage.getItem('token');
    if (!token) return alert("You must be logged in to add to cart.");
  
    const decoded = jwtDecode(token);
    const userId = decoded["https://hasura.io/jwt/claims"]?.["x-hasura-user-id"];
  
    const payload = {
      user_id: parseInt(userId),
      product_id: product.id,
      variant_id: selectedVariant.id,
      product_name: product.name,
      variant_name: selectedVariant.variant_name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: product.base_price,
      quantity: 1,
      image_url: selectedVariant.image,
    };
  
    try {
      const res = await fetch("http://localhost:8006/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) throw new Error("Failed to add to cart");
  
      // fetch updated cart for this user
      const cartRes = await fetch(`http://localhost:8006/cart/${userId}`);
      const cartItems = await cartRes.json();
      setCartCount(cartItems.length);
      alert("Item added to cart!");
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("There was a problem adding to cart.");
    }
  };

  const handleOrderNow = async () => {
    if (!selectedVariant || !product) return;
  
    const token = localStorage.getItem('token');
    if (!token) return alert("You must be logged in.");
  
    const decoded = jwtDecode(token);
    const userId = decoded["https://hasura.io/jwt/claims"]?.["x-hasura-user-id"];
  
    const item = {
      user_id: parseInt(userId),
      product_id: product.id,
      variant_id: selectedVariant.id,
      product_name: product.name,
      variant_name: selectedVariant.variant_name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: product.base_price,
      quantity: 1,
      subtotal: product.base_price * 1,
      image_url: selectedVariant.image,
    };
  
    const payload = {
      user_id: parseInt(userId),
      items: [item],
    };
  
    try {
      const res = await fetch("http://localhost:8003/api/rest/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) throw new Error("Order failed");
  
      alert("Order placed successfully!");
    } catch (err) {
      console.error("Order error:", err);
      alert("There was a problem placing your order.");
    }
  };
  

  if (loading) return <p className="loading-message">Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!product) return <p className="error-message">Product not found.</p>;

  const allImages = [
    { src: product.image, alt: product.name },
    ...(product.product_variants || []).map((variant) => ({
      src: variant.image,
      alt: variant.variant_name,
    }))
  ];

  return (
    <div className="product-details-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back to Catalog
      </button>
      <div className="product-main">
        {/* LEFT: Image Section */}
        <div className="image-section">
          <div className="main-image-wrapper">
            <img
              src={selectedImage?.src}
              alt={selectedImage?.alt}
              className="main-product-image"
            />
          </div>

          <div className="thumbnail-grid">
            {allImages.map((img, idx) => (
              <img
                key={idx}
                src={img.src}
                alt={img.alt}
                className={`thumbnail ${selectedImage?.src === img.src ? 'active' : ''}`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-category">{product.category}</p>
          <div className="product-pricing">
            <span className="current-price">
              ₱{product.base_price.toLocaleString()}
            </span>
          </div>
          <p className="product-description">{product.description}</p>

          {/* Variants Section */}
          {product.product_variants && product.product_variants.length > 0 && (
            <div className="variants-section">
              <h2 className="variants-title">Select a Variant</h2>
              <div className="variants-grid">
                {product.product_variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={`variant-card 
                      ${variant.stock_quantity === 0 ? 'out-of-stock' : ''}
                      ${selectedVariant?.id === variant.id ? 'selected' : ''}
                    `}
                    onClick={() => handleVariantSelect(variant)}
                    style={{ cursor: variant.stock_quantity === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    <p><strong>Size:</strong> {variant.size}</p>
                    <p><strong>Color:</strong> {variant.color}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="add-to-cart-button"
              disabled={!selectedVariant}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button
              className="order-now-button"
              disabled={!selectedVariant}
              onClick={handleOrderNow}
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
