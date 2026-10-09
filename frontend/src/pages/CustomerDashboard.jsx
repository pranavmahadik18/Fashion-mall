import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Package } from 'lucide-react';

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
      case 'PENDING': return 'orange';
      case 'CONFIRMED': return 'blue';
      case 'SHIPPED': return '#8b5cf6';
      case 'OUT_FOR_DELIVERY': return '#0ea5e9';
      case 'DELIVERED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  const trackingSteps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  if (loading) return <div>Loading your dashboard...</div>;

  return (
    <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem' }}>
        <h2>Welcome, {user.name}</h2>
        <p className="text-muted mt-2">Mobile: {user.mobileNumber}</p>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem' }}>
        <h3 className="mb-4 flex items-center gap-2"><Package /> My Orders</h3>
        
        {orders.length === 0 ? (
          <p className="text-muted">You haven't placed any orders yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => (
              <div key={order.id} style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem' }}>
                <div className="flex justify-between items-center mb-4" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                  <div>
                    <strong>Order #{order.id}</strong>
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                      {new Date(order.orderDate).toLocaleString()}
                    </div>
                    <div className="mt-2" style={{ fontSize: '0.875rem' }}>
                      Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                      {order.razorpayPaymentId && <div style={{ color: '#64748b' }}>Txn ID: {order.razorpayPaymentId}</div>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: getStatusColor(order.status)
                    }}>
                      {order.status}
                    </span>
                    <div className="mt-2" style={{ fontWeight: 'bold' }}>Total: ₹{order.totalAmount}</div>
                  </div>
                </div>

                {/* Tracking Timeline */}
                {order.status !== 'CANCELLED' && (
                  <div style={{ marginBottom: '2rem', marginTop: '1rem' }}>
                    <p style={{ fontWeight: 'bold', color: '#16a34a', marginBottom: '1rem' }}>
                      Expected Delivery: {order.estimatedDeliveryDate || 'Pending confirmation'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '4px', background: '#e2e8f0', zIndex: 0, transform: 'translateY(-50%)' }}></div>
                      <div style={{ position: 'absolute', top: '50%', left: '0', width: `${(trackingSteps.indexOf(order.status) / (trackingSteps.length - 1)) * 100}%`, height: '4px', background: '#2563eb', zIndex: 1, transform: 'translateY(-50%)', transition: 'width 0.3s' }}></div>
                      
                      {trackingSteps.map((step, index) => {
                        const isCompleted = trackingSteps.indexOf(order.status) >= index;
                        return (
                          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                            <div style={{ 
                              width: '24px', height: '24px', borderRadius: '50%', 
                              background: isCompleted ? '#2563eb' : '#e2e8f0',
                              border: '4px solid white',
                              boxShadow: '0 0 0 1px #cbd5e1'
                            }}></div>
                            <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: isCompleted ? 'bold' : 'normal', color: isCompleted ? '#0f172a' : '#64748b' }}>
                              {step.replace(/_/g, ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="mb-2">Items:</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {order.items?.map(item => (
                      <li key={item.id} className="flex justify-between mb-2 pb-2" style={{ borderBottom: '1px dashed #e2e8f0' }}>
                        <span>{item.product?.name || 'Deleted Product'} x {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
