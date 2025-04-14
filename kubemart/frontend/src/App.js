import React, { useEffect, useState } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch products
  useEffect(() => {
    fetch(`${process.env.REACT_APP_PRODUCT_API}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Failed to load products:", err));
  }, []);

  // Fetch cart items
  const loadCart = () => {
    fetch(`${process.env.REACT_APP_CART_API}/cart`)
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error("Failed to load cart:", err));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleAddToCart = (product) => {
    fetch(`${process.env.REACT_APP_CART_API}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, quantity: 1 })
    })
      .then(res => res.json())
      .then(() => {
        setMessage(`🛒 Added ${product.name} to cart!`);
        loadCart(); // Refresh cart
        setTimeout(() => setMessage(""), 3000);
      })
      .catch(err => console.error("Failed to add to cart:", err));
  };

  const updateCartItem = (id, action) => {
    fetch(`${process.env.REACT_APP_CART_API}/cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    })
      .then(res => res.json())
      .then(data => {
        setCart(data.cart); // update cart state immediately
        setMessage(`${action === 'increase' ? '➕' : '➖'} Item ${action}d`);
        setTimeout(() => setMessage(""), 3000);
      })
      .catch(err => console.error(`Failed to ${action} item:`, err));
  };

  const handleRemoveCompletely = (id) => {
    fetch(`${process.env.REACT_APP_CART_API}/cart/${id}`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(data => {
        setCart(data.cart);
        setMessage("🗑️ Item removed from cart.");
        setTimeout(() => setMessage(""), 3000);
      })
      .catch(err => console.error("Failed to remove item:", err));
  };

  const handleClearCart = () => {
    fetch(`${process.env.REACT_APP_CART_API}/cart`, {
      method: "DELETE"
    })
      .then(res => res.json())
      .then(() => {
        setMessage("❌ Cart cleared.");
        loadCart();
        setTimeout(() => setMessage(""), 3000);
      })
      .catch(err => console.error("Failed to clear cart:", err));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>KubeMart 🛍️</h1>
      {message && <p style={{ color: "green" }}>{message}</p>}

      <h2>🛍️ Products</h2>
      {products.length === 0 ? (
        <p>Loading products from the cloud... (may take a few seconds)</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {products.map(product => (
            <li key={product.id} style={{ marginBottom: '1rem' }}>
              <strong>{product.name}</strong> — ${product.price}
              <button 
                style={{ marginLeft: "1rem" }}
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2>🛒 Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cart.map(item => (
              <li key={item.id} style={{ marginBottom: "0.5rem" }}>
                {item.name} — ${item.price.toFixed(2)} × {item.quantity}
                <button 
                  onClick={() => updateCartItem(item.id, 'decrease')} 
                  style={{ marginLeft: "1rem" }}
                >
                  –
                </button>
                <button 
                  onClick={() => updateCartItem(item.id, 'increase')} 
                  style={{ marginLeft: "0.5rem" }}
                >
                  +
                </button>
                <button 
                  onClick={() => handleRemoveCompletely(item.id)} 
                  style={{ marginLeft: "0.5rem", color: "red" }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <button 
            onClick={handleClearCart} 
            style={{ marginTop: "1rem", backgroundColor: "#eee" }}
          >
            Clear Cart
          </button>

          <hr />

          {(() => {
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const tax = subtotal * 0.13;
            const total = subtotal + tax;

            return (
              <div>
                <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
                <p><strong>Tax (13%):</strong> ${tax.toFixed(2)}</p>
                <p><strong>Total:</strong> ${total.toFixed(2)}</p>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

export default App;
