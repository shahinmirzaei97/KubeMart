import React, { useEffect, useState, useRef } from 'react';
import { Container, Navbar, Form, FormControl, Button, Dropdown, ListGroup, Badge, Row, Col, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [sections, setSections] = useState({ bestSellers: [], onSale: [], all: [] });
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const scrollRefs = {
    "🏆 Best Sellers": useRef(null),
    "🔖 On Sale": useRef(null),
    "📦 All Products": useRef(null),
    "🔍 Search Results": useRef(null)
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_PRODUCT_API}/products`)
      .then(res => res.json())
      .then(data => setSections(data))
      .catch(err => console.error("Failed to load products:", err));
  }, []);

  useEffect(() => { loadCart(); }, []);

  const loadCart = () => {
    fetch(`${process.env.REACT_APP_CART_API}/cart`)
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(err => console.error("Failed to load cart:", err));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === "") return setSearchResults([]);

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
      .catch(() => setSearchResults([]));
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
      });
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
      });
  };

  const handleRemoveCompletely = (id) => {
    fetch(`${process.env.REACT_APP_CART_API}/cart/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(data => {
        setCart(data.cart);
        setMessage("🗑️ Item removed from cart.");
        setTimeout(() => setMessage(""), 3000);
      });
  };

  const handleClearCart = () => {
    fetch(`${process.env.REACT_APP_CART_API}/cart`, { method: "DELETE" })
      .then(res => res.json())
      .then(() => {
        setMessage("❌ Cart cleared.");
        loadCart();
        setTimeout(() => setMessage(""), 3000);
      });
  };

  const scrollHorizontally = (sectionTitle, dir) => {
    const ref = scrollRefs[sectionTitle];
    if (ref && ref.current) {
      const scrollAmount = 600;
      const el = ref.current;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
      const atStart = el.scrollLeft <= 5;

      if (dir === 'right' && atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (dir === 'left' && atStart) {
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const renderProductList = (title, items) => (
    <div className="mb-5">
      <h2 className="mb-3 d-flex justify-content-between align-items-center">
        <Button variant="outline-secondary" size="sm" onClick={() => scrollHorizontally(title, 'left')}>◀</Button>
        <span>{title}</span>
        <Button variant="outline-secondary" size="sm" onClick={() => scrollHorizontally(title, 'right')}>▶</Button>
      </h2>
      <div className="d-flex overflow-auto gap-3" ref={scrollRefs[title]} style={{ paddingBottom: '1rem' }}>
        {items.map((product, index) => (
          <Card
            key={product.id}
            className={`flex-shrink-0 ${index % 2 === 0 ? 'bg-light' : 'bg-white'} border-0`}
            style={{ width: '220px', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)' }
          >
            <Card.Img
              variant="top"
              src={product.image}
              style={{ height: '130px', objectFit: 'contain', padding: '1rem' }}
            />
            <Card.Body>
              <Card.Title style={{ fontSize: '1rem' }}>{product.name}</Card.Title>
              <Card.Text>
                <small className="text-muted">{product.category}</small><br />
                <strong>${product.price}</strong>
              </Card.Text>
              <Button variant="primary" size="sm" onClick={() => handleAddToCart(product)}>
                Add to Cart
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <Container className="py-4">
      {message && (
        <div className="alert alert-success position-fixed bottom-0 end-0 mb-3 me-3" style={{ zIndex: 1050 }}>
          {message}
        </div>
      )}

      <Navbar bg="light" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>KubeMart 🛍️</Navbar.Brand>
          <Form className="d-flex w-50">
            <FormControl
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="me-2"
            />
          </Form>
          <Dropdown show={drawerOpen} onToggle={() => setDrawerOpen(!drawerOpen)}>
            <Dropdown.Toggle variant="primary">
              🛒 Cart <Badge bg="light" text="dark">{cart.length}</Badge>
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" style={{ minWidth: '22rem' }} className="p-3 shadow-lg border-0">
              {cart.length === 0 ? (
                <Dropdown.ItemText>Your cart is empty.</Dropdown.ItemText>
              ) : (
                <>
                  <ListGroup variant="flush" className="mb-2">
                    {cart.map(item => (
                      <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-semibold text-truncate" style={{ maxWidth: '150px' }}>{item.name}</div>
                          <small>${item.price.toFixed(2)} × {item.quantity}</small>
                        </div>
                        <div>
                          <Button size="sm" variant="outline-secondary" onClick={() => updateCartItem(item.id, 'decrease')} className="me-1">–</Button>
                          <Button size="sm" variant="outline-secondary" onClick={() => updateCartItem(item.id, 'increase')} className="me-1">+</Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleRemoveCompletely(item.id)}>✕</Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  <Button variant="outline-dark" size="sm" onClick={handleClearCart} className="w-100 mb-2">
                    Clear Cart
                  </Button>
                  <hr />
                  {(() => {
                    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                    const tax = subtotal * 0.13;
                    const total = subtotal + tax;
                    return (
                      <div className="text-end">
                        <p className="mb-1"><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
                        <p className="mb-1"><strong>Tax (13%):</strong> ${tax.toFixed(2)}</p>
                        <p className="mb-0"><strong>Total:</strong> ${total.toFixed(2)}</p>
                      </div>
                    );
                  })()}
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </Container>
      </Navbar>

      {searchTerm && searchResults.length > 0 ? (
        renderProductList("🔍 Search Results", searchResults)
      ) : (
        <>
          {renderProductList("🏆 Best Sellers", sections.bestSellers)}
          {renderProductList("🔖 On Sale", sections.onSale)}
          {renderProductList("📦 All Products", sections.all)}
        </>
      )}
    </Container>
  );
}

export default App;
