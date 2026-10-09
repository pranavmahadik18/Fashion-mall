import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleUpdate = async (orderId, currentStatus, currentDeliveryDate) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { 
        status: currentStatus,
        estimatedDeliveryDate: currentDeliveryDate
      });
      fetchOrders();
    } catch (error) {
      alert('Error updating order');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return '#f59e0b'; // orange
      case 'CONFIRMED': return '#3b82f6'; // blue
      case 'SHIPPED': return '#8b5cf6'; // purple
      case 'OUT_FOR_DELIVERY': return '#0ea5e9'; // light blue
      case 'DELIVERED': return '#10b981'; // green
      case 'CANCELLED': return '#ef4444'; // red
      default: return '#64748b'; // gray
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <h2 className="mb-4">Manage Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <div className="flex justify-between items-start mb-4" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>Order #{order.id}</h3>
                  <div className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Placed on: {new Date(order.orderDate).toLocaleString()}
                  </div>
                  <div>
                    <strong>Customer:</strong> {order.customerName} <br />
                    <strong>Mobile:</strong> {order.customerMobile} <br />
                    <strong>Address:</strong> {order.customerAddress}
                  </div>
                  <div className="mt-2" style={{ fontSize: '0.875rem' }}>
                    <strong>Payment:</strong> {order.paymentMethod} <br />
                    <strong>Status:</strong> {order.paymentStatus} <br />
                    {order.razorpayPaymentId && (
                      <span style={{ color: '#64748b' }}>Txn ID: {order.razorpayPaymentId}</span>
                    )}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{order.totalAmount}</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ margin: 0, fontSize: '0.875rem' }}>Status:</label>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleUpdate(order.id, e.target.value, order.estimatedDeliveryDate)}
                        style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '0.25rem',
                          border: `2px solid ${getStatusColor(order.status)}`,
                          fontWeight: 'bold',
                          color: getStatusColor(order.status)
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

                    <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ margin: 0, fontSize: '0.875rem' }}>Est. Delivery:</label>
                      <input 
                        type="text" 
                        defaultValue={order.estimatedDeliveryDate || ''}
                        placeholder="e.g. 15 Oct 2026"
                        onBlur={(e) => handleUpdate(order.id, order.status, e.target.value)}
                        style={{ padding: '0.25rem 0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(Auto-saves on change)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="mb-2" style={{ fontSize: '1rem' }}>Order Items:</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Product</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Price</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Qty</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map(item => (
                      <tr key={item.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.5rem' }}>{item.product?.name || 'Unknown Product'}</td>
                        <td style={{ padding: '0.5rem' }}>₹{item.price}</td>
                        <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
                        <td style={{ padding: '0.5rem' }}>₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
