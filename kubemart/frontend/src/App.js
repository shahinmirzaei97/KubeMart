import React, { useEffect, useState, useRef } from 'react';
import { Container, Navbar, Form, FormControl, Button, Dropdown, ListGroup, Badge, Row, Col, Card, FormSelect } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [sections, setSections] = useState({ bestSellers: [], onSale: [], all: [] });
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [availableCategories, setAvailableCategories] = useState([]);

  const dropdownRef = useRef();

  const scrollRefs = {
    "🏆 Best Sellers": useRef(null),
    "🔖 On Sale": useRef(null),
    "🗂 Browse by Category": useRef(null),
    "🔍 Search Results": useRef(null)
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_PRODUCT_API}/products`)
      .then(res => res.json())
      .then(data => {
        setSections(data);
        const uniqueCategories = [...new Set(data.all.map(product => product.category))];
        setAvailableCategories(["All", ...uniqueCategories]);
      })
      .catch(err => console.error("Failed to load products:", err));
  }, []);

  useEffect(() => { loadCart(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        const simplified = data.products.map(p => ({ id: p.id, name: p.title, price: p.price, category: p.category, image: p.thumbnail }));
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
      if (dir === 'right' && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
      else if (dir === 'left' && atStart) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      else el.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const renderProductList = (title, items) => (
    <div className="mb-5">
      <h2 className="mb-3 d-flex justify-content-between align-items-center">
        <Button variant="outline-secondary" size="sm" onClick={() => scrollHorizontally(title, 'left')}>◀</Button>
        <span>{title}</span>
        <Button variant="outline-secondary" size="sm" onClick={() => scrollHorizontally(title, 'right')}>▶</Button>
      </h2>
      <div className="d-flex overflow-auto gap-3" ref={scrollRefs[title]}>
        {items.map((product, index) => (
          <Card key={product.id} className={`flex-shrink-0 ${index % 2 === 0 ? 'bg-light' : 'bg-white'}`} style={{ width: '220px' }}>
            <Card.Img variant="top" src={product.image} style={{ height: '150px', objectFit: 'contain', padding: '1rem' }} />
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

  const filteredProducts = selectedCategory === "All" ? sections.all : sections.all.filter(p => p.category === selectedCategory);

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
            <FormControl type="search" placeholder="Search products..." value={searchTerm} onChange={handleSearch} className="me-2" />
          </Form>
          <Dropdown show={drawerOpen} ref={dropdownRef} onToggle={() => setDrawerOpen(prev => !prev)}>
            <Dropdown.Toggle variant="primary">
              🛒 Cart <Badge bg="light" text="dark">{cart.length}</Badge>
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" style={{ minWidth: '22rem' }} className="p-0 shadow-lg border-0">
              <div style={{ maxHeight: '40vh', overflowY: 'auto', padding: '1rem' }}>
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
                  </>
                )}
              </div>
              {cart.length > 0 && (
                <div className="border-top px-3 py-2 bg-light text-end">
                  {(() => {
                    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                    const tax = subtotal * 0.13;
                    const total = subtotal + tax;
                    return (
                      <>
                        <p className="mb-1"><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
                        <p className="mb-1"><strong>Tax (13%):</strong> ${tax.toFixed(2)}</p>
                        <p className="mb-0"><strong>Total:</strong> ${total.toFixed(2)}</p>
                      </>
                    );
                  })()}
                </div>
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

          <div className="mb-4">
            <h2 className="mb-3">🗂 Browse by Category</h2>
            <FormSelect value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="mb-3" style={{ maxWidth: '300px' }}>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </FormSelect>
            {renderProductList("🗂 Browse by Category", filteredProducts)}
          </div>
        </>
      )}
    </Container>
  );
}

export default App;
