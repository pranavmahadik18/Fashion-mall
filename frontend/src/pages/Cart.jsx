import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';
import api from '../services/api';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, fetchCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('');

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const [paymentMethod, setPaymentMethod] = useState('online');

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
      setOrderError('Failed to load Razorpay SDK. Are you online?');
      setProcessingPayment(false);
      return;
    }

    try {
      // 1. Create order in our DB (Status: PENDING, Payment: PENDING)
      setPaymentStatusMessage('Creating order...');
      const orderRes = await api.post('/orders', { paymentMethod: 'online' });
      const localOrder = orderRes.data;

      // 2. Create Razorpay order
      setPaymentStatusMessage('Connecting to Razorpay...');
      const rzpOrderRes = await api.post('/payments/create-order', { orderId: localOrder.id });
      const rzpOrder = rzpOrderRes.data; // This is a JSON object stringified, wait, Spring Boot returns string or JSON?
      // Let's assume it returns a JSON object. If it's a string, we might need JSON.parse
      const rzpData = typeof rzpOrder === 'string' ? JSON.parse(rzpOrder) : rzpOrder;

      setProcessingPayment(false);

      // 3. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyId', // Use env var
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: 'Fashion House Koparde',
        description: 'Secure Online Payment',
        order_id: rzpData.id,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.mobileNumber
        },
        handler: async function (response) {
          try {
            setProcessingPayment(true);
            setPaymentStatusMessage('Verifying payment signature...');
            
            // 4. Verify Payment on Backend
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
            setOrderError('Payment Cancelled. You can try again or check My Orders to complete payment later.');
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
      fetchCart(); // Refresh cart (will be empty)
      setPlacedOrderDetails(res.data);
      setOrderPlaced(true);
    } catch (error) {
      setOrderError('Failed to place order. ' + (error.response?.data || ''));
    }
  };

  if (orderPlaced && placedOrderDetails) {
    return (
      <div className="text-center" style={{ padding: '4rem 2rem', background: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#16a34a' }}>Order Placed Successfully! 🎉</h2>
        <p className="mt-2 text-muted">Order ID: #{placedOrderDetails.id}</p>
        
        <div style={{ margin: '2rem auto', maxWidth: '400px', background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Delivery Details</h3>
          <p style={{ fontSize: '1.25rem', color: '#2563eb', fontWeight: 'bold' }}>
            Expected Delivery: {placedOrderDetails.estimatedDeliveryDate || 'Pending confirmation'}
          </p>
          <p className="text-muted mt-2" style={{ fontSize: '0.875rem' }}>
            You can track your order status in the "My Orders" section.
          </p>
        </div>

        {paymentMethod === 'online' ? (
          <div style={{ background: '#ecfdf5', padding: '1.5rem', borderRadius: '0.5rem', marginTop: '1rem', display: 'inline-block', border: '1px solid #10b981' }}>
            <h3 style={{ color: '#059669', marginBottom: '0.5rem' }}>Payment Successful ✓</h3>
            <p style={{ fontSize: '1.125rem' }}>Paid via Secure Online Gateway</p>
            <p className="text-muted mt-2">Payment Support: 8468874900</p>
          </div>
        ) : (
          <>
            <p className="mt-4" style={{ fontSize: '1.25rem' }}>
              You chose Cash on Delivery. You will pay <strong>₹{placedOrderDetails.totalAmount}</strong> when the order arrives.
            </p>
          </>
        )}

        <div className="mt-4">
          <button onClick={() => navigate('/dashboard')} className="btn" style={{ padding: '0.75rem 2rem' }}>Track My Order</button>
        </div>
      </div>
    );
  }

  if (processingPayment) {
    return (
      <div className="text-center" style={{ padding: '6rem 2rem', background: 'white', borderRadius: '0.5rem' }}>
        <h2>Processing Payment...</h2>
        <p className="text-muted mt-2">{paymentStatusMessage || 'Please wait...'}</p>
        <div style={{ marginTop: '2rem' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center" style={{ padding: '4rem 2rem', background: 'white', borderRadius: '0.5rem' }}>
        <h2>Your Cart is Empty</h2>
        <p className="mt-2 text-muted">Looks like you haven't added anything yet.</p>
        <button onClick={() => navigate('/products')} className="btn mt-4">Browse Products</button>
      </div>
    );
  }

  const grandTotal = cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem' }}>
      <h2 className="mb-4">Shopping Cart</h2>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Left Side: Cart Items */}
        <div style={{ flex: '1 1 60%' }}>
          {cart.items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #e2e8f0' }}>
              <img 
                src={item.product.imageUrl ? `http://localhost:8081${item.product.imageUrl}` : 'https://via.placeholder.com/100'} 
                alt={item.product.name}
                style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '0.5rem' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{item.product.name}</h3>
                <p className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  {item.product.category?.name || 'General'}
                  {item.selectedSize && <span style={{ marginLeft: '10px', padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', border: '1px solid #cbd5e1', color: '#0f172a' }}>Size: {item.selectedSize}</span>}
                </p>
                <div style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '1rem' }}>
                  ₹{item.product.price}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>-</button>
                    <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Order Summary */}
        <div style={{ flex: '1 1 30%', background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', alignSelf: 'flex-start', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginBottom: '1rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Items ({cart.items.reduce((acc, item) => acc + item.quantity, 0)}):</span>
            <span>₹{grandTotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Delivery:</span>
            <span style={{ color: '#16a34a' }}>Free</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#b91c1c' }}>Order Total:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#b91c1c' }}>₹{grandTotal}</span>
          </div>

          <h4 style={{ marginBottom: '0.5rem' }}>Payment Method</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
              Pay Online (Cards, UPI, NetBanking)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
              Cash on Delivery (COD)
            </label>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Shipping To:</h4>
            <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
              <strong>{user.name}</strong><br />
              {user.address || 'No address provided in profile'}<br />
              Phone: {user.mobileNumber}
            </div>
          </div>

          <button onClick={handlePlaceOrder} className="btn w-100" style={{ width: '100%', padding: '0.75rem', fontSize: '1.125rem', background: '#fbbf24', color: '#000', border: '1px solid #d97706', borderRadius: '2rem' }}>
            Place your order
          </button>
          
          {orderError && <div style={{ color: '#dc2626', marginTop: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{orderError}</div>}
        </div>
      </div>
    </div>
  );
};

export default Cart;
