import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Store, Search, ShoppingCart, User, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const BottomNav = () => {
  const { user } = useContext(AuthContext);
  const { cart } = useContext(CartContext);

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  if (user?.role === 'ADMIN') {
    return (
      <nav className="bottom-nav">
        <NavLink 
          to="/admin/dashboard" 
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <ShieldCheck size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink 
          to="/admin/products" 
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <Store size={20} />
          <span>Products</span>
        </NavLink>
        <NavLink 
          to="/admin/orders" 
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <ShoppingCart size={20} />
          <span>Orders</span>
        </NavLink>
      </nav>
    );
  }

  return (
    <nav className="bottom-nav" aria-label="Mobile Navigation">
      <NavLink 
        to="/products" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Store size={20} />
        <span>Shop</span>
      </NavLink>

      <NavLink 
        to="/products?searchFocus=1" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Search size={20} />
        <span>Search</span>
      </NavLink>

      <NavLink 
        to="/cart" 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingCart size={20} />
          {cartItemsCount > 0 && (
            <span className="bottom-nav-badge">{cartItemsCount}</span>
          )}
        </div>
        <span>Cart</span>
      </NavLink>

      {user ? (
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <User size={20} />
          <span>Orders</span>
        </NavLink>
      ) : (
        <NavLink 
          to="/login" 
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <User size={20} />
          <span>Login</span>
        </NavLink>
      )}
    </nav>
  );
};

export default BottomNav;
