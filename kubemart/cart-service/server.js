const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// Simulated cart data (in-memory)
let cart = [];

// Get cart contents
app.get('/cart', (req, res) => {
  res.json(cart);
});

// Add item to cart
app.post('/cart', (req, res) => {
  const { id, name, price, quantity } = req.body;
  if (!id || !name || !price) {
    return res.status(400).json({ error: "Missing item fields" });
  }

  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += quantity || 1;
  } else {
    cart.push({ id, name, price, quantity: quantity || 1 });
  }

  res.status(201).json({ message: "Item added to cart", cart });
});

// Remove item from cart
app.delete('/cart/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  cart = cart.filter(item => item.id !== itemId);
  res.json({ message: "Item removed", cart });
});

// Clear cart
app.delete('/cart', (req, res) => {
  cart = [];
  res.json({ message: "Cart cleared" });
});

app.listen(PORT, () => {
  console.log(`Cart service running on port ${PORT}`);
});
