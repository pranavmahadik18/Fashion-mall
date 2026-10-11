import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Package, Calendar, Clock, CreditCard, Truck, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my');
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return '#f59e0b';
      case 'CONFIRMED': return '#3b82f6';
      case 'SHIPPED': return '#8b5cf6';
      case 'OUT_FOR_DELIVERY': return '#0284c7';
      case 'DELIVERED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      default: return '#64748b';
    }
  };

  const trackingSteps = [
    { key: 'PENDING', label: 'Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: '#64748b' }}>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexDirection: 'column', maxWidth: '850px', margin: '0 auto' }}>
      {/* Customer Profile Welcome Header */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 800 
          }}>
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              Welcome back, {user.name}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              📱 Mobile: {user.mobileNumber} {user.email ? `• ✉️ ${user.email}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={22} color="#2563eb" /> My Orders ({orders.length})
          </h2>
          <Link to="/products" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', minHeight: 'unset' }}>
            + Shop More
          </Link>
        </div>
        
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <ShoppingBag size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#1e293b' }}>No orders yet</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Your placed orders and delivery status will appear here.</p>
            <Link to="/products" className="btn btn-primary mt-4">
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => {
              const currentStepIndex = trackingSteps.findIndex(s => s.key === order.status);

              return (
                <div key={order.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', background: '#fafbfc' }}>
                  {/* Order Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                        Order #{order.id}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        📅 Placed on {new Date(order.orderDate).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.825rem', marginTop: '0.35rem', color: '#334155' }}>
                        Payment: <strong>{order.paymentMethod?.toUpperCase()}</strong> ({order.paymentStatus})
                        {order.razorpayPaymentId && (
                          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Txn: {order.razorpayPaymentId}</div>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '0.3rem 0.85rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.775rem',
                        fontWeight: 800,
                        color: 'white',
                        backgroundColor: getStatusColor(order.status),
                        textTransform: 'uppercase'
                      }}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
                        ₹{order.totalAmount}
                      </div>
                    </div>
                  </div>

                  {/* Delivery ETA */}
                  {order.status !== 'CANCELLED' && (
                    <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                        <Truck size={18} />
                        <span>Expected Delivery: {order.estimatedDeliveryDate || 'Order under processing'}</span>
                      </div>

                      {/* Stepped Timeline Tracker (Responsive on all phones) */}
                      <div style={{ position: 'relative', marginTop: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                          {/* Background Track Line */}
                          <div style={{ position: 'absolute', top: '10px', left: '12px', right: '12px', height: '3px', background: '#e2e8f0', zIndex: 0 }} />
                          {/* Active Track Line */}
                          {currentStepIndex >= 0 && (
                            <div style={{ 
                              position: 'absolute', 
                              top: '10px', 
                              left: '12px', 
                              width: `${Math.min(100, (currentStepIndex / (trackingSteps.length - 1)) * 100)}%`, 
                              height: '3px', 
                              background: '#2563eb', 
                              zIndex: 1,
                              transition: 'width 0.3s'
                            }} />
                          )}

                          {trackingSteps.map((step, idx) => {
                            const isDone = currentStepIndex >= idx;
                            return (
                              <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                                <div style={{ 
                                  width: '22px', 
                                  height: '22px', 
                                  borderRadius: '50%', 
                                  background: isDone ? '#2563eb' : '#f1f5f9',
                                  border: isDone ? '2px solid #2563eb' : '2px solid #cbd5e1',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.65rem',
                                  fontWeight: 700
                                }}>
                                  {isDone ? '✓' : idx + 1}
                                </div>
                                <span style={{ 
                                  fontSize: '0.65rem', 
                                  marginTop: '0.35rem', 
                                  textAlign: 'center', 
                                  fontWeight: isDone ? 700 : 500, 
                                  color: isDone ? '#0f172a' : '#94a3b8',
                                  lineHeight: 1.1
                                }}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Ordered Items */}
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Items in this shipment:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {order.items?.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ color: '#0f172a', fontWeight: 600 }}>
                              {item.product?.name || 'Item'}
                            </span>
                            {item.selectedSize && (
                              <span style={{ fontSize: '0.72rem', background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600, color: '#475569' }}>
                                Size: {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                                Color: {item.selectedColor}
                              </span>
                            )}
                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>× {item.quantity}</span>
                          </div>
                          <span style={{ fontWeight: 700 }}>
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
