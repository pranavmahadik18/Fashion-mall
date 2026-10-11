import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Package, 
  Store, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  Phone,
  UserPlus
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleLogout = () => {
    logout();
    setMobileDrawerOpen(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
    setMobileSearchVisible(false);
  };

  const closeDrawer = () => {
    setMobileDrawerOpen(false);
  };

  // ADMIN NAVBAR
  if (user?.role === 'ADMIN') {
    return (
      <>
        <nav className="navbar" aria-label="Admin Navigation">
          <div className="nav-container">
            <Link to="/admin/dashboard" className="nav-logo" onClick={closeDrawer}>
              <div className="nav-logo-badge" style={{ background: '#ef4444' }}>
                <ShieldCheck size={20} />
              </div>
              <span>Fashion House <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>ADMIN</span></span>
            </Link>

            <div className="nav-links">
              <Link to="/admin/dashboard">Dashboard</Link>
              <Link to="/admin/products">Products</Link>
              <Link to="/admin/orders">Orders</Link>
              <button onClick={handleLogout} className="btn-logout">
                <LogOut size={17} /> Logout
              </button>
            </div>

            <button 
              className="mobile-nav-toggle"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              aria-label="Toggle menu"
            >
              {mobileDrawerOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {mobileDrawerOpen && (
          <div className="mobile-drawer-overlay" onClick={closeDrawer}>
            <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-drawer-header">
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#ef4444' }}>Admin Panel</h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.name}</div>
                </div>
                <button onClick={closeDrawer} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>

              <div className="mobile-drawer-body">
                <Link to="/admin/dashboard" className="mobile-drawer-link" onClick={closeDrawer}>
                  <ShieldCheck size={20} /> Dashboard
                </Link>
                <Link to="/admin/products" className="mobile-drawer-link" onClick={closeDrawer}>
                  <Store size={20} /> Manage Products
                </Link>
                <Link to="/admin/orders" className="mobile-drawer-link" onClick={closeDrawer}>
                  <Package size={20} /> Manage Orders
                </Link>
                <Link to="/products" className="mobile-drawer-link" onClick={closeDrawer}>
                  <Store size={20} /> View Store
                </Link>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <button onClick={handleLogout} className="btn btn-danger w-100">
                    <LogOut size={18} /> Logout Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // CUSTOMER & VISITOR NAVBAR
  return (
    <>
      <nav className="navbar" aria-label="Main Navigation">
        <div className="nav-container">
          <Link to={user ? "/products" : "/"} className="nav-logo" onClick={closeDrawer}>
            <div className="nav-logo-badge">
              <Store size={20} />
            </div>
            <span>Fashion House</span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="nav-search-form desktop-search">
            <Search size={18} className="nav-search-icon" />
            <input 
              type="text" 
              placeholder="Search clothes, sarees, shirts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="nav-search-input"
            />
          </form>

          {/* Desktop Links */}
          <div className="nav-links">
            <Link to="/products">
              <Store size={18} /> Products
            </Link>
            
            <Link to="/cart" className="cart-link">
              <ShoppingCart size={18} />
              <span>Cart</span>
              {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
            </Link>

            {user ? (
              <>
                <Link to="/dashboard">
                  <Package size={18} /> My Orders
                </Link>
                <button onClick={handleLogout} className="btn-logout" title="Logout">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary" style={{ padding: '0.45rem 1rem', color: 'white' }}>
                  <User size={16} /> Login
                </Link>
                <Link to="/register" style={{ fontSize: '0.9rem', color: '#2563eb' }}>
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Right Controls: Search Toggle, Cart, Hamburger Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="mobile-nav-controls">
            <button 
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileSearchVisible(!mobileSearchVisible)}
              aria-label="Search"
              style={{ padding: '0.4rem' }}
            >
              <Search size={22} />
            </button>

            <Link 
              to="/cart" 
              className="mobile-nav-toggle cart-link" 
              aria-label="View Cart"
              style={{ padding: '0.4rem', textDecoration: 'none', color: 'inherit' }}
            >
              <ShoppingCart size={22} />
              {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
            </Link>

            <button 
              className="mobile-nav-toggle"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              aria-label="Toggle Navigation Menu"
              style={{ padding: '0.4rem' }}
            >
              {mobileDrawerOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {mobileSearchVisible && (
          <div style={{ padding: '0.5rem 1rem 0.75rem 1rem', borderTop: '1px solid #e2e8f0', background: 'white' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', position: 'relative' }}>
              <Search size={18} className="nav-search-icon" style={{ left: '0.85rem' }} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="nav-search-input"
                style={{ paddingRight: '4rem' }}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ position: 'absolute', right: '4px', top: '4px', bottom: '4px', minHeight: 'unset', padding: '0 0.85rem', borderRadius: '9999px', fontSize: '0.8rem' }}
              >
                Go
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile Drawer (Slide-out menu for all phones) */}
      {mobileDrawerOpen && (
        <div className="mobile-drawer-overlay" onClick={closeDrawer}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="nav-logo-badge" style={{ padding: '0.25rem' }}>
                    <Store size={18} />
                  </div>
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Fashion House</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {user ? `Signed in as ${user.name}` : 'Welcome, Guest!'}
                </div>
              </div>
              <button onClick={closeDrawer} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={22} color="#64748b" />
              </button>
            </div>

            <div className="mobile-drawer-body">
              <Link 
                to="/products" 
                className={`mobile-drawer-link ${location.pathname === '/products' ? 'active' : ''}`}
                onClick={closeDrawer}
              >
                <Store size={20} /> All Products
              </Link>

              <Link 
                to="/cart" 
                className={`mobile-drawer-link ${location.pathname === '/cart' ? 'active' : ''}`}
                onClick={closeDrawer}
              >
                <ShoppingCart size={20} />
                <span>My Cart</span>
                {cartItemsCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '9999px', fontWeight: 'bold' }}>
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`mobile-drawer-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                    onClick={closeDrawer}
                  >
                    <Package size={20} /> My Orders
                  </Link>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <button onClick={handleLogout} className="btn btn-secondary w-100" style={{ color: '#ef4444' }}>
                      <LogOut size={18} /> Logout ({user.name})
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`mobile-drawer-link ${location.pathname === '/login' || location.pathname === '/' ? 'active' : ''}`}
                    onClick={closeDrawer}
                    style={{ background: '#eff6ff', color: '#2563eb' }}
                  >
                    <User size={20} /> Customer Login
                  </Link>

                  <Link 
                    to="/register" 
                    className={`mobile-drawer-link ${location.pathname === '/register' ? 'active' : ''}`}
                    onClick={closeDrawer}
                  >
                    <UserPlus size={20} /> Register New Account
                  </Link>

                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <Link 
                      to="/admin/login" 
                      onClick={closeDrawer} 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', textDecoration: 'none', padding: '0.5rem 0' }}
                    >
                      <ShieldCheck size={16} /> Admin Portal Login
                    </Link>
                  </div>
                </>
              )}

              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                <Phone size={14} /> Help: 8468874900
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
