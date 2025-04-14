const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const products = [
  { id: 1, name: "Vintage Sneakers", price: 59.99, category: "Footwear", image: "https://via.placeholder.com/150" },
  { id: 2, name: "Classic T-Shirt", price: 29.99, category: "Apparel", image: "https://via.placeholder.com/150" },
  { id: 3, name: "Leather Wallet", price: 39.99, category: "Accessories", image: "https://via.placeholder.com/150" }
];

app.get('/products', (req, res) => {
  res.json(products);
});

app.listen(PORT, () => {
  console.log(`Product service running on port ${PORT}`);
});

