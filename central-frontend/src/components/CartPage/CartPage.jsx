import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import './style/CartPage.css';
import { useCart } from '../../context/CartContext';
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const { setCartCount } = useCart();
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decoded = jwtDecode(token);
      const userId = decoded['https://hasura.io/jwt/claims']?.['x-hasura-user-id'];

      const res = await fetch(`http://localhost:8006/cart/${userId}`);
      const data = await res.json();
      setCartItems(Array.isArray(data) ? data : []);
      setCartCount(Array.isArray(data) ? data.length : 0);
    };

    fetchCart();
  }, [setCartCount]);

  const handleRemove = async (itemId) => {
    await fetch(`http://localhost:8006/cart/remove/${itemId}`, { method: 'DELETE' });
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
    setCartCount((prev) => prev - 1);
  };

  const handleCheckboxChange = (item) => {
    setSelectedItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  useEffect(() => {
    const sum = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
    setTotal(sum);
  }, [selectedItems]);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Select items to order.");
      return;
    }

    const groupedBySeller = selectedItems.reduce((acc, item) => {
      if (!acc[item.seller_id]) acc[item.seller_id] = [];
      acc[item.seller_id].push(item);
      return acc;
    }, {});

    // For now, only support 1 seller at a time
    for (const sellerId in groupedBySeller) {
      navigate("/place-order", {
        state: {
          cartItems: groupedBySeller[sellerId],
          sellerId: sellerId,
          sellerUsername: groupedBySeller[sellerId][0]?.seller_username || "Seller",
        },
      });
      break;
    }
  };

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className="empty-message">Your cart is empty 🛒</p>
      ) : (
        <>
          <div className="cart-grid">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <input
                  type="checkbox"
                  checked={selectedItems.some((i) => i.id === item.id)}
                  onChange={() => handleCheckboxChange(item)}
                />
                <img src={item.image_url} alt={item.product_name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h2>{item.product_name}</h2>
                  <p>Variant: {item.variant_name}</p>
                  <p>Size: {item.size}</p>
                  <p>Color: {item.color}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Subtotal: ₱{item.subtotal.toFixed(2)}</p>
                  <button onClick={() => handleRemove(item.id)} className="remove-button">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Total: ₱{total.toFixed(2)}</h2>
            <button className="checkout-button" onClick={handleCheckout}>
              Proceed to Checkout ({selectedItems.length})
            </button>
          </div>
        </>
      )}
    </div>
  );
}
