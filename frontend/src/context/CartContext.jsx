import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const { user } = useContext(AuthContext);

  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId, quantity = 1, size = null, color = null) => {
    if (!user) {
      showToast('Please login to add items to cart');
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append('quantity', quantity);
      if (size) params.append('size', size);
      if (color) params.append('color', color);
      const res = await api.post(`/cart/add/${productId}?${params.toString()}`);
      setCart(res.data);
      showToast('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Error adding to cart');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await api.delete(`/cart/remove/${itemId}`);
      setCart(res.data);
      showToast('Removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/update/${itemId}?quantity=${quantity}`);
      setCart(res.data);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };
  
  const clearCart = () => {
    setCart({ items: [] });
  }

  return (
    <CartContext.Provider value={{ cart, fetchCart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#333', color: 'white', padding: '1rem', borderRadius: '4px', zIndex: 9999, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {toast}
        </div>
      )}
    </CartContext.Provider>
  );
};
