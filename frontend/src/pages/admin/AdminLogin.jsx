import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { ShieldCheck, Phone, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
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
      
      if (res.data.role !== 'ADMIN') {
        setError('Unauthorized access. This portal is for store admins only.');
        setIsSubmitting(false);
        return;
      }
      
      login(res.data);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || 'Invalid admin credentials';
      setError(typeof errMsg === 'string' ? errMsg : 'Admin verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '1rem 0.5rem' }}>
      <div className="auth-container" style={{ borderTop: '4px solid #ef4444' }}>
        <div className="auth-header">
          <div className="auth-brand-badge" style={{ background: '#fee2e2', color: '#ef4444' }}>
            <ShieldCheck size={28} />
          </div>
          <h1 className="auth-title" style={{ color: '#0f172a' }}>Admin Portal</h1>
          <p className="auth-subtitle">Fashion House Koparde Administration</p>
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
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="admin-mobile">Admin Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="admin-mobile"
                type="tel" 
                inputMode="tel"
                placeholder="Enter admin mobile number"
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
            <label htmlFor="admin-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="admin-password"
                type={showPassword ? 'text' : 'password'} 
                placeholder="Enter admin password"
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
                  color: '#94a3b8'
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-danger w-100" 
            disabled={isSubmitting}
            style={{ marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <Link to="/login" style={{ fontSize: '0.9rem', color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowLeft size={16} /> Back to Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
