import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { ArrowLeft } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState('');
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

  if (loading) return <div>Loading product...</div>;
  if (!product) return <div>Product not found!</div>;

  const handleAddToCart = () => {
    if (product.availableSizes && !selectedSize) {
      setSizeError('Please select a size first');
      return;
    }
    setSizeError('');
    addToCart(product.id, quantity, selectedSize);
  };

  const handleBuyNow = async () => {
    if (product.availableSizes && !selectedSize) {
      setSizeError('Please select a size first');
      return;
    }
    setSizeError('');
    await addToCart(product.id, quantity, selectedSize);
    navigate('/cart');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '0.5rem' }}>
      <button onClick={() => navigate(-1)} className="btn mb-4" style={{ background: '#f1f5f9', color: '#0f172a' }}>
        <ArrowLeft size={18} /> Back
      </button>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <img 
            src={product.imageUrl ? `http://localhost:8081${product.imageUrl}` : 'https://via.placeholder.com/400'} 
            alt={product.name} 
            style={{ width: '100%', borderRadius: '0.5rem', objectFit: 'cover' }} 
          />
        </div>
        
        <div style={{ flex: '2 1 300px' }}>
          <div className="text-muted" style={{ marginBottom: '0.5rem' }}>{product.category?.name || 'General'}</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{product.name}</h1>
          <div style={{ fontSize: '1.5rem', color: '#2563eb', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            ₹{product.price}
          </div>
          
          <p style={{ marginBottom: '2rem', color: '#475569' }}>
            {product.description || 'No description available for this product.'}
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <strong>Status: </strong>
            <span style={{ color: product.available ? 'green' : 'red' }}>
              {product.available ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          
          {product.availableSizes && (
            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Select Size:</strong>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.availableSizes.split(',').map(size => size.trim()).map(size => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(''); }}
                    style={{
                      padding: '0.5rem 1rem',
                      border: selectedSize === size ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: selectedSize === size ? '#eff6ff' : 'white',
                      color: selectedSize === size ? '#1d4ed8' : '#334155',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontWeight: selectedSize === size ? 'bold' : 'normal'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && <div style={{ color: 'red', marginTop: '0.5rem', fontSize: '0.875rem' }}>{sizeError}</div>}
            </div>
          )}

          {product.available && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  max={product.stockQuantity > 0 ? product.stockQuantity : 10}
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value))} 
                  style={{ width: '80px' }}
                />
              </div>
              <button onClick={handleAddToCart} className="btn" style={{ padding: '0.75rem 2rem', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                Add to Cart
              </button>
              <button onClick={handleBuyNow} className="btn" style={{ padding: '0.75rem 2rem', background: '#fbbf24', color: '#000', border: '1px solid #d97706' }}>
                Buy Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
