import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Package, Users, ShoppingBag, Clock, Store, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    orders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          api.get('/products'),
          api.get('/admin/customers'),
          api.get('/admin/orders')
        ]);
        
        const orders = ordersRes.data;
        const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

        setStats({
          products: productsRes.data.length,
          customers: customersRes.data.length,
          orders: orders.length,
          pendingOrders: pendingOrders
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: '#64748b' }}>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Welcome back, {user?.name || 'Administrator'}
          </p>
        </div>

        <Link to="/products" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
          <Store size={16} /> Open Store
        </Link>
      </div>
      
      {/* 4 Stat Cards: 2x2 on mobile, 4 in row on desktop */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Products</span>
            <ShoppingBag size={20} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
            {stats.products}
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Customers</span>
            <Users size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
            {stats.customers}
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Orders</span>
            <Package size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
            {stats.orders}
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Pending</span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
            {stats.pendingOrders}
          </div>
        </div>
      </div>
      
      {/* Quick Action Navigation Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <Link 
          to="/admin/products" 
          className="btn btn-primary" 
          style={{ padding: '1.25rem', textAlign: 'center', borderRadius: '12px', fontSize: '1.05rem', justifyContent: 'center' }}
        >
          <Store size={20} /> Manage Catalog Products
        </Link>
        <Link 
          to="/admin/orders" 
          className="btn" 
          style={{ padding: '1.25rem', textAlign: 'center', background: '#10b981', color: 'white', borderRadius: '12px', fontSize: '1.05rem', justifyContent: 'center' }}
        >
          <Package size={20} /> Process Customer Orders
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
