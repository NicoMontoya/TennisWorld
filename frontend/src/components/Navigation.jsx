import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

const Navigation = () => {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  return (
    <nav className="modern-nav">
      <div className="modern-nav-container">
        <div className="modern-nav-logo">
          <Link to="/welcome" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white' }}>
            <img 
              src="/TennisBall.jpg" 
              alt="Tennis Ball" 
              style={{ height: '40px', width: '40px', borderRadius: '50%' }}
            />
          </Link>
        </div>
        
        {/* Desktop menu */}
        <div className="modern-nav-links">
          <NavLink to="/welcome" currentPath={location.pathname}>
            Home
          </NavLink>
          <NavLink to="/rankings" currentPath={location.pathname}>
            Rankings
          </NavLink>
          <NavLink to="/tournaments" currentPath={location.pathname}>
            Tournaments
          </NavLink>
        </div>
        
        {/* Mobile menu button */}
        <div style={{ display: 'none' }} className="mobile-menu-button">
          <button 
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
      {isMenuOpen && (
        <div style={{ display: 'none' }} className="mobile-menu">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
            <MobileNavLink to="/welcome" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
              Home
            </MobileNavLink>
            <MobileNavLink to="/rankings" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
              Rankings
            </MobileNavLink>
            <MobileNavLink to="/tournaments" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
              Tournaments
            </MobileNavLink>
          </div>
        </div>
      )}
    </nav>
  )
}

// Helper component for desktop navigation links
const NavLink = ({ to, currentPath, children }) => {
  const isActive = currentPath === to
  
  return (
    <Link 
      to={to} 
      className={`modern-nav-link ${isActive ? 'active' : ''}`}
    >
      {children}
    </Link>
  )
}

// Helper component for mobile navigation links
const MobileNavLink = ({ to, currentPath, children, onClick }) => {
  const isActive = currentPath === to
  
  return (
    <Link 
      to={to} 
      style={{
        display: 'block',
        padding: '8px 12px',
        color: 'white',
        textDecoration: 'none',
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
        borderRadius: '4px'
      }}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

export default Navigation
