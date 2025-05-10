import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import './style/CartPage.css';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const { setCartCount } = useCart();
  const [selectedItems, setSelectedItems] = useState([]);


  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decoded = jwtDecode(token);
      const userId = decoded['https://hasura.io/jwt/claims']?.['x-hasura-user-id'];

      const res = await fetch(`http://localhost:8006/cart/${userId}`);
      const data = await res.json();
      setCartItems(data);
      setCartCount(data.length);
      setTotal(data.reduce((sum, item) => sum + item.subtotal, 0));
    };

    fetchCart();
  }, [setCartCount]);

  const handleRemove = async (itemId) => {
    await fetch(`http://localhost:8006/cart/remove/${itemId}`, { method: 'DELETE' });
  
    // Remove from cartItems
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);
  
    // Also update selectedItems to remove deleted item
    const updatedSelection = selectedItems.filter((item) => item.id !== itemId);
    setSelectedItems(updatedSelection);
  
    setCartCount((prev) => prev - 1);
  };

  const handleCheckboxChange = (item) => {
    if (selectedItems.some((i) => i.id === item.id)) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  useEffect(() => {
    const sum = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
    setTotal(sum);
  }, [selectedItems]);

  const handleCheckout = async () => {
    if (selectedItems.length === 0) return alert("Select items to order.");
  
    const token = localStorage.getItem('token');
    if (!token) return;
  
    const decoded = jwtDecode(token);
    const userId = decoded["https://hasura.io/jwt/claims"]?.["x-hasura-user-id"];
  
    const payload = {
      user_id: parseInt(userId),
      items: selectedItems
    };
  
    try {
      const res = await fetch("http://localhost:8003/api/rest/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) throw new Error("Order failed");
  
      alert("Order placed successfully!");
      setSelectedItems([]);
      setCartItems(cartItems.filter(ci => !selectedItems.some(si => si.id === ci.id)));
    } catch (err) {
      console.error("Checkout error:", err);
      alert("There was a problem placing your order.");
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
                Checkout Selected ({selectedItems.length})
            </button>
          </div>
        </>
      )}
    </div>
  );
}
