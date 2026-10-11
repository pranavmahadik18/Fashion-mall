import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Store, User, Phone, Mail, MapPin, Lock, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    password: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.mobileNumber.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/register', formData);
      alert('Registration successful! Please login with your mobile number.');
      navigate('/login');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || 'Error registering account';
      setError(typeof errMsg === 'string' ? errMsg : 'Registration failed. Try again.');
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Fashion House Koparde for instant orders</p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #f87171',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.25rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="reg-name"
                type="text" 
                name="name" 
                placeholder="e.g. Rahul Sharma"
                value={formData.name} 
                onChange={handleChange} 
                required 
                style={{ paddingLeft: '2.5rem' }}
              />
              <User 
                size={18} 
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-mobile">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="reg-mobile"
                type="tel" 
                inputMode="tel"
                name="mobileNumber" 
                placeholder="10-digit mobile number"
                value={formData.mobileNumber} 
                onChange={handleChange} 
                required 
                maxLength={15} 
                style={{ paddingLeft: '2.5rem' }}
              />
              <Phone 
                size={18} 
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email (Optional)</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="reg-email"
                type="email" 
                name="email" 
                placeholder="email@example.com"
                value={formData.email} 
                onChange={handleChange} 
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail 
                size={18} 
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-address">Delivery Address</label>
            <div style={{ position: 'relative' }}>
              <textarea 
                id="reg-address"
                name="address" 
                placeholder="House/Flat No., Street, City, Pincode"
                value={formData.address} 
                onChange={handleChange} 
                required 
                rows={3}
                style={{ paddingLeft: '2.5rem' }}
              />
              <MapPin 
                size={18} 
                style={{ position: 'absolute', left: '0.85rem', top: '1rem', color: '#94a3b8' }} 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password (min 6 characters)</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="reg-password"
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                placeholder="Create a strong password"
                value={formData.password} 
                onChange={handleChange} 
                required 
                minLength={6} 
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
            className="btn btn-primary w-100" 
            disabled={isSubmitting}
            style={{ marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {isSubmitting ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4" style={{ fontSize: '0.95rem' }}>
          <span style={{ color: '#64748b' }}>Already have an account? </span>
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
