import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Package } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleUpdate = async (orderId, newStatus, newDeliveryDate) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { 
        status: newStatus,
        estimatedDeliveryDate: newDeliveryDate
      });
      await fetchOrders();
    } catch (error) {
      alert('Error updating order');
    } finally {
      setUpdatingId(null);
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: '#64748b' }}>Loading customer orders...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Manage Customer Orders</h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{orders.length} total orders received</p>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Package size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.2rem', color: '#1e293b' }}>No orders yet</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Orders placed by customers will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map(order => (
            <div key={order.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              {/* Top Row: Order ID, Date, Amount */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '0.85rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Order #{order.id}
                  </h2>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    Placed: {new Date(order.orderDate).toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    ₹{order.totalAmount}
                  </div>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: 'white', 
                    backgroundColor: getStatusColor(order.status) 
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Customer & Payment Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem' }}>
                  <strong>Customer:</strong> {order.customerName}<br />
                  <strong>Mobile:</strong> <a href={`tel:${order.customerMobile}`} style={{ color: '#2563eb' }}>{order.customerMobile}</a><br />
                  <strong>Address:</strong> {order.customerAddress}
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  <strong>Payment:</strong> {order.paymentMethod?.toUpperCase()} ({order.paymentStatus})<br />
                  {order.razorpayPaymentId && (
                    <div style={{ color: '#64748b', fontSize: '0.775rem' }}>Rzp Txn: {order.razorpayPaymentId}</div>
                  )}
                  {order.estimatedDeliveryDate && (
                    <div style={{ color: '#16a34a', fontWeight: 600, marginTop: '0.25rem' }}>
                      Delivery ETA: {order.estimatedDeliveryDate}
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div style={{ marginBottom: '1.25rem' }}>
                <strong style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Items Ordered:</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.4rem' }}>
                  {order.items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span>{item.product?.name || 'Deleted item'}</span>
                        {item.selectedSize && (
                          <span style={{ fontSize: '0.72rem', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600, color: '#475569' }}>
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                            Color: {item.selectedColor}
                          </span>
                        )}
                        <span style={{ color: '#64748b' }}>× {item.quantity}</span>
                      </div>
                      <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Form Controls */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.85rem', 
                background: '#eff6ff', 
                borderRadius: '8px', 
                border: '1px solid #bfdbfe' 
              }}>
                <div style={{ flex: '1 1 180px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.25rem' }}>
                    Update Status:
                  </label>
                  <select 
                    value={order.status} 
                    onChange={(e) => handleUpdate(order.id, e.target.value, order.estimatedDeliveryDate)}
                    disabled={updatingId === order.id}
                    style={{ 
                      width: '100%',
                      padding: '0.45rem', 
                      borderRadius: '6px', 
                      border: `2px solid ${getStatusColor(order.status)}`, 
                      fontWeight: 700, 
                      color: getStatusColor(order.status),
                      background: 'white'
                    }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.25rem' }}>
                    Delivery ETA Date:
                  </label>
                  <input 
                    type="date"
                    defaultValue={order.estimatedDeliveryDate || ''}
                    onBlur={(e) => {
                      if (e.target.value && e.target.value !== order.estimatedDeliveryDate) {
                        handleUpdate(order.id, order.status, e.target.value);
                      }
                    }}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
