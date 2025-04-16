const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/products', async (req, res) => {
  try {
    const response = await fetch('https://dummyjson.com/products?limit=100');
    const data = await response.json();

    const products = Array.isArray(data.products) ? data.products : [];

    const simplify = (p) => ({
      id: p.id,
      name: p.title,
      price: p.price,
      category: p.category,
      image: p.thumbnail,
      discount: p.discountPercentage,
      stock: p.stock
    });

    const bestSellers = products.filter(p => p.stock > 80).map(simplify);
    const onSale = products.filter(p => p.discountPercentage > 5).map(simplify);
    const all = products.map(simplify);

    res.json({
      bestSellers,
      onSale,
      all
    });
  } catch (err) {
    console.error("Failed to fetch products:", err);
    res.status(500).json({ error: "Could not load products" });
  }
});




app.listen(PORT, () => {
  console.log(`Product service running on port ${PORT}`);
});

