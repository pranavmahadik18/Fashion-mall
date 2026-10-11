import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import { ShoppingBag, Zap, Check } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [addedItemNotice, setAddedItemNotice] = useState(null);
  const { addToCart } = useContext(CartContext);
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  // If searchFocus query param exists, auto-focus search
  useEffect(() => {
    if (searchParams.get('searchFocus') && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [location.search]);

  const fetchProductsAndCategories = async () => {
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        api.get('/products'),
        api.get('/categories')
      ]);

      if (prodRes.status === 'fulfilled') {
        setProducts(prodRes.value.data);
      }
      if (catRes.status === 'fulfilled') {
        setCategories(catRes.value.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (product.availableSizes || product.availableColors) {
      navigate(`/product/${product.id}`);
      return;
    }
    await addToCart(product.id);
    setAddedItemNotice(product.name);
    setTimeout(() => setAddedItemNotice(null), 2500);
  };

  const handleBuyNow = async (product) => {
    if (product.availableSizes || product.availableColors) {
      navigate(`/product/${product.id}`);
      return;
    }
    await addToCart(product.id);
    navigate('/cart');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery) || 
      (p.category && p.category.name.toLowerCase().includes(searchQuery)) ||
      (p.description && p.description.toLowerCase().includes(searchQuery));

    const matchesCategory = selectedCategory === 'ALL' || 
      (p.category && p.category.name === selectedCategory) ||
      (p.category && String(p.category.id) === String(selectedCategory));

    return matchesSearch && matchesCategory;
  });

  // Extract unique category names
  const allCategoryNames = Array.from(new Set([
    ...categories.map(c => c.name),
    ...products.map(p => p.category?.name).filter(Boolean)
  ]));

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{
          width: '40px', 
          height: '40px', 
          border: '3px solid #e2e8f0', 
          borderTopColor: '#2563eb', 
          borderRadius: '50%', 
          animation: 'spin 0.8s linear infinite', 
          margin: '0 auto 1rem'
        }} />
        <p style={{ color: '#64748b' }}>Loading fashion items...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Toast Notification when item added */}
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
          fontSize: '0.875rem',
          animation: 'fadeIn 0.2s'
        }}>
          <Check size={16} color="#10b981" />
          <span>Added <strong>{addedItemNotice}</strong> to cart!</span>
          <Link to="/cart" style={{ color: '#fbbf24', marginLeft: '0.5rem', fontWeight: 'bold', textDecoration: 'none' }}>
            View Cart
          </Link>
        </div>
      )}

      {/* Header and Search */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {searchQuery ? `Search Results` : 'Latest Collections'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {filteredProducts.length} items found
            </p>
          </div>

          {searchQuery && (
            <button 
              onClick={() => navigate('/products')} 
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', minHeight: 'unset' }}
            >
              Clear Search "{searchQuery}" ✕
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="category-filter-bar">
          <button 
            type="button"
            className={`category-chip ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            All Items
          </button>
          {allCategoryNames.map(cat => (
            <button 
              key={cat}
              type="button"
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <ShoppingBag size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', color: '#1e293b' }}>No products found</h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Try adjusting your search terms or category filter.
          </p>
          <button 
            onClick={() => { setSelectedCategory('ALL'); navigate('/products'); }} 
            className="btn btn-primary" 
            style={{ marginTop: '1.25rem' }}
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              {/* Product Image Wrapper */}
              <Link to={`/product/${product.id}`} className="product-card-img-wrapper">
                <img 
                  src={getProductImageUrl(product.imageUrl)} 
                  alt={product.name} 
                  onError={handleImageError}
                  className="product-img" 
                  loading="lazy"
                />
                <span className={`product-stock-badge ${product.available ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
                  {product.available ? 'In Stock' : 'Sold Out'}
                </span>
              </Link>

              {/* Product Info */}
              <div className="product-info">
                <span className="product-category-tag">
                  {product.category?.name || 'Fashion'}
                </span>

                <Link 
                  to={`/product/${product.id}`} 
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <h2 className="product-title">{product.name}</h2>
                </Link>

                <div className="product-price">
                  ₹{product.price}
                </div>

                {/* Mobile Touch Action Buttons */}
                <div className="product-card-actions">
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <Link 
                      to={`/product/${product.id}`} 
                      className="btn btn-secondary" 
                      style={{ flex: 1, textDecoration: 'none' }}
                    >
                      View
                    </Link>

                    {product.available ? (
                      <button 
                        onClick={() => handleAddToCart(product)} 
                        className="btn btn-primary" 
                        style={{ flex: 1.5 }}
                      >
                        {(product.availableSizes || product.availableColors) ? 'Options' : 'Add'}
                      </button>
                    ) : (
                      <button 
                        className="btn btn-secondary" 
                        disabled 
                        style={{ flex: 1.5, opacity: 0.6, cursor: 'not-allowed' }}
                      >
                        Sold Out
                      </button>
                    )}
                  </div>

                  {product.available && (
                    <button 
                      onClick={() => handleBuyNow(product)} 
                      className="btn btn-accent" 
                      style={{ width: '100%' }}
                    >
                      <Zap size={15} /> Buy Now
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

export default Products;
