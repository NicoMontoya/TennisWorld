import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get the redirect path from location state, or default to '/dashboard'
  const from = location.state?.from || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Redirect to the page the user was trying to access, or profile page
        navigate(from);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-card fade-in">
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          color: 'var(--primary-color)', 
          fontSize: '28px', 
          fontWeight: 'bold', 
          marginBottom: '10px'
        }}>
          Welcome to TennisWorld
        </h1>
        <p style={{ color: 'var(--text-light)' }}>
          Sign in to access your account
        </p>
      </div>
      
      {error && (
        <div style={{ 
          backgroundColor: 'rgba(229, 57, 53, 0.1)', 
          border: '1px solid rgba(229, 57, 53, 0.3)', 
          color: 'var(--error-color)', 
          padding: '16px', 
          borderRadius: 'var(--border-radius-md)', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="email" 
            style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: 'var(--text-dark)'
            }}
          >
            Email Address
          </label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
            placeholder="Enter your email"
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="password" 
            style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: 'var(--text-dark)'
            }}
          >
            Password
          </label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
            placeholder="Enter your password"
          />
        </div>
        
        <button 
          type="submit" 
          className="btn-gradient"
          style={{ 
            width: '100%', 
            padding: '14px',
            marginTop: '10px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
          disabled={loading}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div className="spinner-small"></div>
              Signing in...
            </span>
          ) : 'Sign In'}
        </button>
      </form>
      
      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center',
        padding: '20px',
        borderTop: '1px solid #eee'
      }}>
        <p style={{ marginBottom: '15px', color: 'var(--text-light)' }}>
          Don't have an account?
        </p>
        <Link 
          to="/register" 
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid var(--primary-color)',
            color: 'var(--primary-color)',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-color)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--primary-color)';
          }}
        >
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
