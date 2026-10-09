import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Package, Store } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/products');
    }
  };

  if (user?.role === 'ADMIN') {
    return (
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/admin/dashboard" className="nav-logo">
            <Store size={24} /> Fashion House Koparde Admin
          </Link>
          <div className="nav-links">
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/products">Products</Link>
            <Link to="/admin/orders">Orders</Link>
            <button onClick={handleLogout} className="btn-logout"><LogOut size={18} /> Logout</button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Store size={24} /> Fashion House Koparde
        </Link>
        
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '400px', margin: '0 20px', display: 'flex' }}>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px 0 0 4px', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}>Search</button>
        </form>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          
          <Link to="/cart" className="cart-link">
            <ShoppingCart size={20} />
            {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
            Cart
          </Link>

          {user ? (
            <>
              <Link to="/dashboard"><Package size={18} /> My Orders</Link>
              <button onClick={handleLogout} className="btn-logout"><LogOut size={18} /> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login"><User size={18} /> Login</Link>
              <Link to="/admin/login" style={{ fontSize: '0.8rem', color: '#666', marginLeft: '10px' }}>Admin Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
