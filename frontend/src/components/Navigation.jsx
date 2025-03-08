import { Link, useLocation } from 'react-router-dom'

const Navigation = () => {
  const location = useLocation()
  
  return (
    <nav style={{
      backgroundColor: 'var(--primary-color)',
      padding: '15px 0',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/welcome" style={{ 
            color: 'white', 
            textDecoration: 'none',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            TennisWorld
          </Link>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
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
      </div>
    </nav>
  )
}

// Helper component for navigation links
const NavLink = ({ to, currentPath, children }) => {
  const isActive = currentPath === to
  
  return (
    <Link 
      to={to} 
      style={{
        color: 'white',
        textDecoration: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
        transition: 'background-color 0.3s'
      }}
    >
      {children}
    </Link>
  )
}

export default Navigation
