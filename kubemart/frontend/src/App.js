import React, { useEffect, useState } from 'react';

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_PRODUCT_API}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Failed to load products:", err));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>KubeMart 🛍️</h1>
      {products.length === 0 ? (
        <p>Loading products...</p>
      ) : (
        <ul>
          {products.map(product => (
            <li key={product.id}>
              <strong>{product.name}</strong> — ${product.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
