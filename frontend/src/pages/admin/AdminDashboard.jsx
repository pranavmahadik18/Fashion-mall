import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Package, Users, ShoppingBag } from 'lucide-react';

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

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h2 className="mb-4">Admin Dashboard - Welcome {user.name}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #2563eb' }}>
          <ShoppingBag size={40} color="#2563eb" />
          <div>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.products}</h3>
            <div className="text-muted">Total Products</div>
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #10b981' }}>
          <Users size={40} color="#10b981" />
          <div>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.customers}</h3>
            <div className="text-muted">Customers</div>
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #8b5cf6' }}>
          <Package size={40} color="#8b5cf6" />
          <div>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.orders}</h3>
            <div className="text-muted">Total Orders</div>
          </div>
        </div>
        
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #f59e0b' }}>
          <Package size={40} color="#f59e0b" />
          <div>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.pendingOrders}</h3>
            <div className="text-muted">Pending Orders</div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/admin/products" className="btn" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
          Manage Products
        </Link>
        <Link to="/admin/orders" className="btn" style={{ padding: '1rem', flex: 1, textAlign: 'center', background: '#10b981' }}>
          Manage Orders
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
