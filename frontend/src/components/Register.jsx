import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      })
    }
    
    // Clear server error when user makes any change
    if (serverError) {
      setServerError(null)
    }
  }
  
  const validate = () => {
    const newErrors = {}
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    return newErrors
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setLoading(true)
    setServerError(null)
    
    try {
      // Remove confirmPassword before sending to the server
      const { confirmPassword, ...userData } = formData
      
      const result = await register(userData)
      
      if (result.success) {
        // Registration successful, navigate to welcome page
        navigate('/welcome')
      } else {
        // Registration failed, show error
        setServerError(result.message)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setServerError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
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
          Create your account to get started
        </p>
      </div>
      
      {serverError && (
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
          <span>{serverError}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="username" 
            style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: 'var(--text-dark)'
            }}
          >
            Username
          </label>
          <input 
            type="text" 
            id="username" 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
            required 
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--border-radius-md)',
              border: errors.username ? '1px solid var(--error-color)' : '1px solid #ddd',
              fontSize: '16px'
            }}
            placeholder="Choose a username"
          />
          {errors.username && <div style={{ color: 'var(--error-color)', fontSize: '14px', marginTop: '5px' }}>{errors.username}</div>}
        </div>
        
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
              border: errors.email ? '1px solid var(--error-color)' : '1px solid #ddd',
              fontSize: '16px'
            }}
            placeholder="Enter your email"
          />
          {errors.email && <div style={{ color: 'var(--error-color)', fontSize: '14px', marginTop: '5px' }}>{errors.email}</div>}
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
              border: errors.password ? '1px solid var(--error-color)' : '1px solid #ddd',
              fontSize: '16px'
            }}
            placeholder="Create a password"
          />
          {errors.password && <div style={{ color: 'var(--error-color)', fontSize: '14px', marginTop: '5px' }}>{errors.password}</div>}
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="confirmPassword" 
            style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: 'var(--text-dark)'
            }}
          >
            Confirm Password
          </label>
          <input 
            type="password" 
            id="confirmPassword" 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            required 
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--border-radius-md)',
              border: errors.confirmPassword ? '1px solid var(--error-color)' : '1px solid #ddd',
              fontSize: '16px'
            }}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <div style={{ color: 'var(--error-color)', fontSize: '14px', marginTop: '5px' }}>{errors.confirmPassword}</div>}
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
              Creating account...
            </span>
          ) : 'Create Account'}
        </button>
      </form>
      
      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center',
        padding: '20px',
        borderTop: '1px solid #eee'
      }}>
        <p style={{ marginBottom: '15px', color: 'var(--text-light)' }}>
          Already have an account?
        </p>
        <a 
          href="/" 
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
          Sign In
        </a>
      </div>
    </div>
  )
}

export default Register
