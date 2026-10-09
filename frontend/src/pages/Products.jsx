import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery) || 
    (p.category && p.category.name.toLowerCase().includes(searchQuery))
  );

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      <h2 className="mb-4">{searchQuery ? `Search Results for "${searchQuery}"` : 'Our Products'}</h2>
      
      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <img 
                src={product.imageUrl ? `http://localhost:8081${product.imageUrl}` : 'https://via.placeholder.com/250'} 
                alt={product.name} 
                className="product-img" 
              />
              <div className="product-info">
                <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                  {product.category?.name || 'General'}
                </div>
                <h3 className="product-title">{product.name}</h3>
                <div className="product-price">₹{product.price}</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/product/${product.id}`} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#0f172a', textAlign: 'center' }}>
                      Details
                    </Link>
                    {product.available ? (
                      <button onClick={() => { if(product.availableSizes) { window.location.href = `/product/${product.id}` } else { addToCart(product.id) } }} className="btn" style={{ flex: 1 }}>
                        {product.availableSizes ? 'Select Size' : 'Add to Cart'}
                      </button>
                    ) : (
                      <button className="btn" disabled style={{ flex: 1, background: '#cbd5e1', cursor: 'not-allowed' }}>
                        Out of Stock
                      </button>
                    )}
                  </div>
                  {product.available && (
                    <button onClick={async () => { if(product.availableSizes) { window.location.href = `/product/${product.id}` } else { await addToCart(product.id); window.location.href = '/cart'; } }} className="btn" style={{ width: '100%', background: '#fbbf24', color: '#000', border: '1px solid #d97706' }}>
                      Buy Now
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
