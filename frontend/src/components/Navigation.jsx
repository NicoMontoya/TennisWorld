import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const Navigation = () => {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  // Handle scroll effect for navigation
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  
  // Close mobile menu when location changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])
  
  return (
    <nav 
      className="modern-nav"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.15)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
        padding: scrolled ? '10px 0' : '15px 0'
      }}
    >
      <div className="modern-nav-container">
        <div className="modern-nav-logo">
          <Link to="/welcome" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: 'white',
            gap: '10px',
            transition: 'transform 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img 
              src="/TennisBall.jpg" 
              alt="Tennis Ball" 
              style={{ 
                height: '40px', 
                width: '40px', 
                borderRadius: '50%',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease'
              }}
            />
            <span style={{ 
              fontWeight: 'bold', 
              fontSize: '20px',
              display: 'none',
              '@media (min-width: 768px)': {
                display: 'block'
              }
            }}>
              TennisWorld
            </span>
          </Link>
        </div>
        
        {/* Desktop menu */}
        <div className="modern-nav-links">
          <NavLink to="/welcome" currentPath={location.pathname} icon="home">
            Home
          </NavLink>
          <NavLink to="/rankings" currentPath={location.pathname} icon="trophy">
            Rankings
          </NavLink>
          <NavLink to="/tournaments" currentPath={location.pathname} icon="calendar">
            Tournaments
          </NavLink>
        </div>
        
        {/* Mobile menu button */}
        <div 
          className="mobile-menu-button"
          style={{ 
            display: 'block',
            '@media (min-width: 768px)': {
              display: 'none'
            }
          }}
        >
          <button 
            style={{ 
              color: 'white', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              transition: 'background-color 0.3s ease'
            }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg style={{ height: '24px', width: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        className="mobile-menu"
        style={{
          display: isMenuOpen ? 'block' : 'none',
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'var(--primary-color)',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          animation: isMenuOpen ? 'fadeIn 0.3s ease forwards' : 'none',
          zIndex: 1000
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
          <MobileNavLink to="/welcome" currentPath={location.pathname} icon="home">
            Home
          </MobileNavLink>
          <MobileNavLink to="/rankings" currentPath={location.pathname} icon="trophy">
            Rankings
          </MobileNavLink>
          <MobileNavLink to="/tournaments" currentPath={location.pathname} icon="calendar">
            Tournaments
          </MobileNavLink>
        </div>
      </div>
    </nav>
  )
}

// Helper component for desktop navigation links
const NavLink = ({ to, currentPath, children, icon }) => {
  const isActive = currentPath === to
  
  return (
    <Link 
      to={to} 
      className={`modern-nav-link ${isActive ? 'active' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {icon === 'home' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )}
      {icon === 'trophy' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
        </svg>
      )}
      {icon === 'calendar' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      )}
      {children}
      
      {/* Animated underline effect */}
      <span style={{
        position: 'absolute',
        bottom: '-2px',
        left: isActive ? '0' : '50%',
        width: isActive ? '100%' : '0',
        height: '2px',
        backgroundColor: 'white',
        transition: 'all 0.3s ease',
        opacity: isActive ? 1 : 0
      }}></span>
    </Link>
  )
}

// Helper component for mobile navigation links
const MobileNavLink = ({ to, currentPath, children, onClick, icon }) => {
  const isActive = currentPath === to
  
  return (
    <Link 
      to={to} 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        color: 'white',
        textDecoration: 'none',
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
        borderRadius: '4px',
        transition: 'all 0.3s ease',
        fontWeight: isActive ? 'bold' : 'normal'
      }}
      onClick={onClick}
      onMouseOver={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
      onMouseOut={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {icon === 'home' && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )}
      {icon === 'trophy' && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
        </svg>
      )}
      {icon === 'calendar' && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      )}
      {children}
    </Link>
  )
}

export default Navigation
