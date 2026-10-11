import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import { Sparkles, ArrowRight, Zap, Check } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItemNotice, setAddedItemNotice] = useState(null);
  const { addToCart } = useContext(CartContext);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    if (product.availableSizes || product.availableColors) {
      window.location.href = `/product/${product.id}`;
      return;
    }
    await addToCart(product.id);
    setAddedItemNotice(product.name);
    setTimeout(() => setAddedItemNotice(null), 2500);
  };

  const filteredProducts = products.filter(p => 
    !searchQuery ||
    p.name.toLowerCase().includes(searchQuery) || 
    (p.category && p.category.name.toLowerCase().includes(searchQuery))
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: '#64748b' }}>Loading Fashion House Koparde...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {addedItemNotice && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0f172a',
          color: 'white',
          padding: '0.65rem 1.25rem',
          borderRadius: '9999px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 1000,
          fontSize: '0.875rem'
        }}>
          <Check size={16} color="#10b981" />
          <span>Added <strong>{addedItemNotice}</strong> to cart!</span>
          <Link to="/cart" style={{ color: '#fbbf24', marginLeft: '0.5rem', fontWeight: 'bold' }}>
            View Cart
          </Link>
        </div>
      )}

      {/* Hero Banner for mobile & desktop */}
      {!searchQuery && (
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: 'white',
          padding: '2rem 1.25rem',
          borderRadius: '16px',
          marginBottom: '1.75rem',
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '600px', position: 'relative', zIndex: 1 }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              background: 'rgba(255,255,255,0.2)', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              marginBottom: '0.75rem' 
            }}>
              <Sparkles size={14} color="#fde047" /> KOPARDE'S EXCLUSIVE FASHION
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem' }}>
              Fashion House Koparde
            </h1>
            <p style={{ color: '#e0e7ff', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              Trendy apparel, modern styles & traditional wear at the best prices with doorstep delivery.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/products" className="btn" style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 700 }}>
                Explore Products <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
          {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
        </h2>
        <Link to="/products" style={{ color: '#2563eb', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
          View All →
        </Link>
      </div>
      
      {filteredProducts.length === 0 ? (
        <p style={{ color: '#64748b' }}>No products found.</p>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <Link to={`/product/${product.id}`} className="product-card-img-wrapper">
                <img 
                  src={getProductImageUrl(product.imageUrl)} 
                  alt={product.name} 
                  onError={handleImageError}
                  className="product-img" 
                  loading="lazy"
                />
                <span className={`product-stock-badge ${product.available ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
                  {product.available ? 'In Stock' : 'Out of Stock'}
                </span>
              </Link>

              <div className="product-info">
                <span className="product-category-tag">
                  {product.category?.name || 'General'}
                </span>
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 className="product-title">{product.name}</h3>
                </Link>
                <div className="product-price">₹{product.price}</div>
                
                <div className="product-card-actions">
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <Link to={`/product/${product.id}`} className="btn btn-secondary" style={{ flex: 1, textDecoration: 'none' }}>
                      Details
                    </Link>
                    {product.available ? (
                      <button onClick={() => handleAddToCart(product)} className="btn btn-primary" style={{ flex: 1.5 }}>
                        {(product.availableSizes || product.availableColors) ? 'Options' : 'Add'}
                      </button>
                    ) : (
                      <button className="btn btn-secondary" disabled style={{ flex: 1.5, opacity: 0.6, cursor: 'not-allowed' }}>
                        Sold Out
                      </button>
                    )}
                  </div>
                  {product.available && (
                    <button 
                      onClick={async () => {
                        if (product.availableSizes || product.availableColors) {
                          window.location.href = `/product/${product.id}`;
                        } else {
                          await addToCart(product.id);
                          window.location.href = '/cart';
                        }
                      }} 
                      className="btn btn-accent" 
                      style={{ width: '100%' }}
                    >
                      <Zap size={14} /> Buy Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
