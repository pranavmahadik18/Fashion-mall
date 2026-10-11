import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, Plus, Minus, CreditCard, Banknote, ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, fetchCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'online') {
      await processOnlinePayment();
    } else {
      await submitOrder();
    }
  };

  const processOnlinePayment = async () => {
    setProcessingPayment(true);
    setOrderError('');
    setPaymentStatusMessage('Initializing secure payment gateway...');

    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      setOrderError('Failed to load Razorpay SDK. Please check your internet connection.');
      setProcessingPayment(false);
      return;
    }

    try {
      setPaymentStatusMessage('Creating order...');
      const orderRes = await api.post('/orders', { paymentMethod: 'online' });
      const localOrder = orderRes.data;

      setPaymentStatusMessage('Connecting to Razorpay...');
      const rzpOrderRes = await api.post('/payments/create-order', { orderId: localOrder.id });
      const rzpOrder = rzpOrderRes.data;
      const rzpData = typeof rzpOrder === 'string' ? JSON.parse(rzpOrder) : rzpOrder;

      setProcessingPayment(false);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Tlv0kjyJi0pHjb',
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: 'Fashion House Koparde',
        description: `Order #${localOrder.id} Payment`,
        order_id: rzpData.id,
        prefill: {
          name: user.name,
          email: user.email || '',
          contact: user.mobileNumber
        },
        handler: async function (response) {
          try {
            setProcessingPayment(true);
            setPaymentStatusMessage('Verifying payment signature...');
            
            await api.post('/payments/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            fetchCart();
            setPlacedOrderDetails(localOrder);
            setOrderPlaced(true);
          } catch (err) {
            setOrderError('Payment Verification Failed! Contact Support: 8468874900');
          } finally {
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function() {
            setOrderError('Payment Cancelled. You can try again or choose Cash on Delivery.');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      setProcessingPayment(false);
      setOrderError('Failed to initiate payment. ' + (error.response?.data || error.message));
    }
  };

  const submitOrder = async () => {
    try {
      const res = await api.post('/orders', { paymentMethod });
      fetchCart();
      setPlacedOrderDetails(res.data);
      setOrderPlaced(true);
    } catch (error) {
      setOrderError('Failed to place order. ' + (error.response?.data || ''));
    }
  };

  // ORDER SUCCESS VIEW
  if (orderPlaced && placedOrderDetails) {
    return (
      <div style={{ maxWidth: '600px', margin: '1rem auto', textAlign: 'center', background: 'white', padding: '2.5rem 1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid #e2e8f0' }}>
        <CheckCircle size={56} color="#10b981" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ color: '#0f172a', fontSize: '1.6rem', fontWeight: 800 }}>Order Placed! 🎉</h2>
        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Order ID: #{placedOrderDetails.id}</p>
        
        <div style={{ margin: '1.75rem 0', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Delivery Schedule</div>
          <p style={{ fontSize: '1.15rem', color: '#2563eb', fontWeight: 800, marginTop: '0.25rem' }}>
            Expected: {placedOrderDetails.estimatedDeliveryDate || 'Pending confirmation'}
          </p>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
            Delivering to: <strong>{user.name}</strong>, {user.address}
          </div>
        </div>

        {paymentMethod === 'online' ? (
          <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #10b981', color: '#065f46' }}>
            <strong>Payment Verified ✓</strong> - Paid via Online Gateway
          </div>
        ) : (
          <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #f59e0b', color: '#92400e' }}>
            Pay <strong>₹{placedOrderDetails.totalAmount}</strong> Cash on Delivery when item arrives.
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary w-100" style={{ padding: '0.85rem' }}>
            Track My Order in Dashboard
          </button>
          <button onClick={() => navigate('/products')} className="btn btn-secondary w-100">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // PROCESSING PAYMENT VIEW
  if (processingPayment) {
    return (
      <div style={{ maxWidth: '500px', margin: '3rem auto', textAlign: 'center', background: 'white', padding: '3rem 1.5rem', borderRadius: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.3rem' }}>Processing Payment...</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{paymentStatusMessage || 'Please do not refresh...'}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // EMPTY CART VIEW
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div style={{ maxWidth: '550px', margin: '2rem auto', textAlign: 'center', background: 'white', padding: '3.5rem 1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <ShoppingBag size={54} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Your Cart is Empty</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Discover trendy fashion items and add your favorites.</p>
        <button onClick={() => navigate('/products')} className="btn btn-primary mt-4" style={{ padding: '0.75rem 2rem' }}>
          Browse Products <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const grandTotal = cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const totalItemsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="cart-container">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem', color: '#0f172a' }}>
        Shopping Cart ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left: Cart Items List */}
        <div>
          {cart.items.map(item => (
            <div key={item.id} className="cart-item-card">
              <img 
                src={getProductImageUrl(item.product.imageUrl)} 
                alt={item.product.name}
                onError={handleImageError}
                style={{ width: '88px', height: '88px', objectFit: 'cover', borderRadius: '10px', background: '#f1f5f9', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.product.name}
                </h2>
                
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span>{item.product.category?.name || 'Fashion'}</span>
                  {item.selectedSize && (
                    <span style={{ padding: '0.1rem 0.4rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', fontWeight: 600 }}>
                      Size: {item.selectedSize}
                    </span>
                  )}
                  {item.selectedColor && (
                    <span style={{ padding: '0.1rem 0.4rem', background: '#fdf2f8', color: '#db2777', borderRadius: '4px', fontWeight: 600 }}>
                      Color: {item.selectedColor}
                    </span>
                  )}
                </div>

                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.65rem' }}>
                  ₹{item.product.price}
                </div>
                
                {/* Quantity + Remove */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '6px', padding: '0.15rem' }}>
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                      style={{ background: 'white', border: 'none', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                      {item.quantity}
                    </span>
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                      style={{ background: 'white', border: 'none', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button 
                    type="button"
                    onClick={() => removeFromCart(item.id)} 
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600, padding: '0.35rem 0.5rem' }}
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary Card */}
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#475569' }}>
            <span>Subtotal ({totalItemsCount} items)</span>
            <span>₹{grandTotal}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#475569' }}>
            <span>Delivery</span>
            <span style={{ color: '#16a34a', fontWeight: 700 }}>FREE</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #cbd5e1', paddingTop: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Total Amount</span>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#2563eb' }}>₹{grandTotal}</span>
          </div>

          {/* Payment Method Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.65rem', color: '#334155' }}>
              Select Payment Method:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px', 
                border: paymentMethod === 'online' ? '2px solid #2563eb' : '1px solid #cbd5e1', 
                background: paymentMethod === 'online' ? '#eff6ff' : 'white',
                cursor: 'pointer' 
              }}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="online" 
                  checked={paymentMethod === 'online'} 
                  onChange={() => setPaymentMethod('online')} 
                />
                <CreditCard size={18} color="#2563eb" />
                <span style={{ fontWeight: paymentMethod === 'online' ? 700 : 500, fontSize: '0.95rem' }}>
                  Pay Online (UPI, Card, NetBanking)
                </span>
              </label>

              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px', 
                border: paymentMethod === 'cod' ? '2px solid #2563eb' : '1px solid #cbd5e1', 
                background: paymentMethod === 'cod' ? '#eff6ff' : 'white',
                cursor: 'pointer' 
              }}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="cod" 
                  checked={paymentMethod === 'cod'} 
                  onChange={() => setPaymentMethod('cod')} 
                />
                <Banknote size={18} color="#16a34a" />
                <span style={{ fontWeight: paymentMethod === 'cod' ? 700 : 500, fontSize: '0.95rem' }}>
                  Cash on Delivery (COD)
                </span>
              </label>
            </div>
          </div>

          {/* Shipping Address */}
          <div style={{ marginBottom: '1.5rem', padding: '0.85rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Delivering To:
            </div>
            <div style={{ fontSize: '0.9rem', color: '#0f172a' }}>
              <strong>{user.name}</strong> • {user.mobileNumber}<br />
              <span style={{ color: '#475569' }}>{user.address || 'Address on profile'}</span>
            </div>
          </div>

          <button 
            onClick={handlePlaceOrder} 
            className="btn btn-accent w-100" 
            style={{ padding: '0.85rem', fontSize: '1.05rem' }}
          >
            Place Order • ₹{grandTotal}
          </button>
          
          {orderError && (
            <div style={{ color: '#dc2626', marginTop: '1rem', fontSize: '0.875rem', textAlign: 'center', background: '#fee2e2', padding: '0.5rem', borderRadius: '6px' }}>
              {orderError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
