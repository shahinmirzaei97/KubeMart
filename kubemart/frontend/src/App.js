import React, { useEffect, useState } from 'react';

function App() {
  const [sections, setSections] = useState({
    bestSellers: [],
    onSale: [],
    all: []
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch homepage product sections
  useEffect(() => {
    fetch(`${process.env.REACT_APP_PRODUCT_API}/products`)
      .then(res => res.json())
      .then(data => setSections(data))
      .catch(err => console.error("Failed to load products:", err));
  }, []);

  // Fetch cart items
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    fetch(`${process.env.REACT_APP_CART_API}/cart`)
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error("Failed to load cart:", err));
  };

  // Search products
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    fetch(`https://dummyjson.com/products/search?q=${value}`)
      .then(res => res.json())
      .then(data => {
        const simplified = data.products.map(p => ({
          id: p.id,
          name: p.title,
          price: p.price,
          category: p.category,
          image: p.thumbnail
        }));
        setSearchResults(simplified);
      })
      .catch(err => {
        console.error("Search failed:", err);
        setSearchResults([]);
      });
  };

  const handleAddToCart = (product) => {
    fetch(`${process.env.REACT_APP_CART_API}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, quantity: 1 })
    })
      .then(res => res.json())
      .then(() => {
        setMessage(`🛒 Added ${product.name} to cart!`);
        loadCart();
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
        setCart(data.cart);
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

  const renderProductList = (title, items) => (
    <>
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
  {items.map(product => (
    <li key={product.id} className="bg-gray-50 p-4 rounded shadow hover:shadow-lg transition">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-contain rounded mb-2"
      />
      <h3 className="font-semibold text-lg">{product.name}</h3>
      <p className="text-sm text-gray-500">{product.category}</p>
      <p className="text-green-600 font-bold mb-2">${product.price}</p>
      <button
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => handleAddToCart(product)}
      >
        Add to Cart
      </button>
    </li>
  ))}
</ul>

      )}
    </>
  );

  return (
    <div className="p-6 max-w-screen-xl mx-auto bg-white min-h-screen text-gray-800">
      <h1>KubeMart 🛍️</h1>
      {message && (
  <div style={{
    position: "fixed",
    top: "1rem",
    right: "1rem",
    backgroundColor: "#38a169",
    color: "white",
    padding: "0.75rem 1rem",
    borderRadius: "0.5rem",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    zIndex: 9999
  }}>
    {message}
  </div>
)}

<input
  type="text"
  placeholder="Search for products..."
  value={searchTerm}
  onChange={handleSearch}
  className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
/>


      {searchTerm && searchResults.length > 0 ? (
        renderProductList("🔍 Search Results", searchResults)
      ) : (
        <>
          {renderProductList("🏆 Best Sellers", sections.bestSellers)}
          {renderProductList("🔖 On Sale", sections.onSale)}
          {renderProductList("📦 All Products", sections.all)}
        </>
      )}

      {/* Cart (will become a drawer in next phase) */}
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
