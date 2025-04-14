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

app.patch('/cart/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const action = req.body.action;

  const itemIndex = cart.findIndex(item => item.id === itemId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Item not found in cart" });
  }

  if (action === 'increase') {
    cart[itemIndex].quantity += 1;
    return res.json({ message: "Item quantity increased", cart });
  }

  if (action === 'decrease') {
    if (cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity -= 1;
      return res.json({ message: "Item quantity decreased", cart });
    } else {
      cart.splice(itemIndex, 1);
      return res.json({ message: "Item removed from cart", cart });
    }
  }

  return res.status(400).json({ error: "Invalid action" });
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
