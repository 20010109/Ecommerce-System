import React, { useState } from 'react';

function App() {
  const [userId, setUserId] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [orderResponse, setOrderResponse] = useState(null);

  const [getOrderId, setGetOrderId] = useState("");
  const [fetchedOrder, setFetchedOrder] = useState(null);

  // Create an order
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          total_price: parseFloat(totalPrice)
        })
      });
      const data = await res.json();
      setOrderResponse(data);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  // Get an order by ID
  const handleGetOrder = async () => {
    try {
      const res = await fetch(`http://localhost:8080/orders/${getOrderId}`);
      const data = await res.json();
      setFetchedOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  };

  return (
    <div style={{ margin: '40px' }}>
      <h1>DOMA Order Service Frontend</h1>

      <section style={{ marginBottom: '40px' }}>
        <h2>Create Order</h2>
        <form onSubmit={handleCreateOrder}>
          <div>
            <label>User ID: </label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <div>
            <label>Total Price: </label>
            <input
              type="number"
              step="0.01"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
            />
          </div>
          <button type="submit">Create</button>
        </form>
        {orderResponse && (
          <div>
            <p>Order creation response:</p>
            <pre>{JSON.stringify(orderResponse, null, 2)}</pre>
          </div>
        )}
      </section>

      <section>
        <h2>Get Order</h2>
        <input
          type="number"
          placeholder="Order ID"
          value={getOrderId}
          onChange={(e) => setGetOrderId(e.target.value)}
        />
        <button onClick={handleGetOrder}>Fetch Order</button>
        {fetchedOrder && (
          <div>
            <p>Fetched Order:</p>
            <pre>{JSON.stringify(fetchedOrder, null, 2)}</pre>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
