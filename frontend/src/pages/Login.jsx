import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Store, Lock, Phone, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/products', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/login', { 
        mobileNumber: mobileNumber.trim(), 
        password: password 
      });
      
      login(res.data);
      if (res.data.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/products', { replace: true });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || 'Invalid mobile number or password';
      setError(typeof errMsg === 'string' ? errMsg : 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '1rem 0.5rem' }}>
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <Store size={26} />
          </div>
          <h1 className="auth-title">Customer Login</h1>
          <p className="auth-subtitle">Fashion House Koparde - Sign in to start shopping</p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #f87171',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-mobile">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="login-mobile"
                type="tel" 
                inputMode="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber} 
                onChange={(e) => setMobileNumber(e.target.value)} 
                required 
                style={{ paddingLeft: '2.5rem' }}
              />
              <Phone 
                size={18} 
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="login-password"
                type={showPassword ? 'text' : 'password'} 
                placeholder="Enter your password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <Lock 
                size={18} 
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '0.25rem'
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100" 
            disabled={isSubmitting}
            style={{ marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem' }}>
          <span style={{ color: '#64748b' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
            Register Now
          </Link>
        </div>

        {/* Guest Browsing Option */}
        <div className="auth-guest-banner">
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
            Want to see products first?
          </p>
          <Link 
            to="/products" 
            className="btn btn-secondary w-100"
            style={{ fontSize: '0.9rem', padding: '0.65rem' }}
          >
            <span>Explore Store as Guest</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <Link 
            to="/admin/login" 
            style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ShieldCheck size={14} /> Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
