import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import { ArrowLeft, ShoppingCart, Zap, Plus, Minus, Check, Palette } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sizeError, setSizeError] = useState('');
  const [colorError, setColorError] = useState('');
  const [addedToast, setAddedToast] = useState(false);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: '#64748b' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '12px' }}>
        <h2>Product not found!</h2>
        <p className="mt-2 text-muted">The requested fashion item might be removed or unavailable.</p>
        <Link to="/products" className="btn btn-primary mt-4">
          Browse All Products
        </Link>
      </div>
    );
  }

  const validateSelections = () => {
    let valid = true;
    if (product.availableSizes && !selectedSize) {
      setSizeError('Please select a size');
      valid = false;
    } else {
      setSizeError('');
    }

    if (product.availableColors && !selectedColor) {
      setColorError('Please select a color');
      valid = false;
    } else {
      setColorError('');
    }
    return valid;
  };

  const handleAddToCart = async () => {
    if (!validateSelections()) return;
    await addToCart(product.id, quantity, selectedSize, selectedColor);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = async () => {
    if (!validateSelections()) return;
    await addToCart(product.id, quantity, selectedSize, selectedColor);
    navigate('/cart');
  };

  const maxStock = product.stockQuantity > 0 ? product.stockQuantity : 10;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {addedToast && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0f172a',
          color: 'white',
          padding: '0.75rem 1.25rem',
          borderRadius: '9999px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 1000,
          fontSize: '0.875rem'
        }}>
          <Check size={16} color="#10b981" />
          <span>Added to cart successfully!</span>
          <Link to="/cart" style={{ color: '#fbbf24', marginLeft: '0.5rem', fontWeight: 'bold' }}>
            Go to Cart
          </Link>
        </div>
      )}

      {/* Back button */}
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-secondary" 
        style={{ marginBottom: '1rem', padding: '0.45rem 0.85rem', fontSize: '0.9rem', minHeight: 'unset' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="details-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {/* Product Image */}
          <div>
            <div style={{ 
              borderRadius: '12px', 
              overflow: 'hidden', 
              background: '#f1f5f9', 
              aspectRatio: '1 / 1',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)' 
            }}>
              <img 
                src={getProductImageUrl(product.imageUrl)} 
                alt={product.name} 
                onError={handleImageError}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          </div>
          
          {/* Product Info & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              color: '#2563eb', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              marginBottom: '0.35rem' 
            }}>
              {product.category?.name || 'Fashion'}
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '0.75rem' }}>
              {product.name}
            </h1>

            <div style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800, marginBottom: '1rem' }}>
              ₹{product.price}
            </div>
            
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {product.description || 'Quality fashion product crafted with premium fabric.'}
            </p>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem', 
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: product.available ? '#dcfce7' : '#fee2e2',
                color: product.available ? '#166534' : '#991b1b'
              }}>
                {product.available ? '✓ In Stock' : '✕ Out of Stock'}
              </span>
            </div>
            
            {/* Color Selector */}
            {product.availableColors && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#334155' }}>
                  <Palette size={16} color="#2563eb" /> Select Color: {selectedColor && <span style={{ color: '#2563eb' }}>({selectedColor})</span>}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.availableColors.split(',').map(c => c.trim()).filter(Boolean).map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => { setSelectedColor(color); setColorError(''); }}
                      style={{
                        padding: '0.5rem 1rem',
                        border: selectedColor === color ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: selectedColor === color ? '#eff6ff' : 'white',
                        color: selectedColor === color ? '#1d4ed8' : '#334155',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: selectedColor === color ? 700 : 500,
                        fontSize: '0.9rem',
                        transition: 'all 0.15s'
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
                {colorError && (
                  <div style={{ color: '#ef4444', marginTop: '0.35rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    ⚠️ {colorError}
                  </div>
                )}
              </div>
            )}

            {/* Size Selector */}
            {product.availableSizes && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#334155' }}>
                  Select Size: {selectedSize && <span style={{ color: '#2563eb' }}>({selectedSize})</span>}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.availableSizes.split(',').map(size => size.trim()).filter(Boolean).map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => { setSelectedSize(size); setSizeError(''); }}
                      style={{
                        padding: '0.5rem 1rem',
                        border: selectedSize === size ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: selectedSize === size ? '#eff6ff' : 'white',
                        color: selectedSize === size ? '#1d4ed8' : '#334155',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: selectedSize === size ? 700 : 500,
                        fontSize: '0.9rem',
                        transition: 'all 0.15s'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <div style={{ color: '#ef4444', marginTop: '0.35rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    ⚠️ {sizeError}
                  </div>
                )}
              </div>
            )}

            {/* Quantity Stepper & Actions */}
            {product.available && (
              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>Quantity:</span>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '0.2rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ background: 'white', border: 'none', borderRadius: '6px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>
                      {quantity}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                      style={{ background: 'white', border: 'none', borderRadius: '6px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={handleAddToCart} 
                    className="btn btn-secondary" 
                    style={{ flex: '1 1 160px', padding: '0.85rem' }}
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                  <button 
                    onClick={handleBuyNow} 
                    className="btn btn-accent" 
                    style={{ flex: '1 1 160px', padding: '0.85rem' }}
                  >
                    <Zap size={18} /> Buy Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
