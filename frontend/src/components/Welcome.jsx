import { useNavigate, Link } from 'react-router-dom'

const Welcome = ({ user }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    // In a real app, we would call a logout API
    // For now, we'll just redirect to the register page
    navigate('/')
    // Force a page reload to clear the user state
    window.location.reload()
  }

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '50px auto', padding: '40px' }}>
      <h1 className="text-center" style={{ color: 'var(--primary-color)', marginBottom: '30px' }}>
        Welcome to TennisWorld!
      </h1>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2>Hello, {user.username}!</h2>
        <p style={{ fontSize: '18px', marginTop: '10px' }}>
          Thank you for joining our tennis community. Here you'll be able to track tennis results 
          and predict match outcomes.
        </p>
      </div>
      
      {/* Feature Cards */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Rankings Card */}
        <div style={{
          flex: '1 0 300px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>Player Rankings</h3>
          <p style={{ marginBottom: '20px' }}>
            View the latest ATP and WTA rankings for the top tennis players in the world.
          </p>
          <Link to="/rankings">
            <button className="btn" style={{ width: '100%' }}>
              View Rankings
            </button>
          </Link>
        </div>
        
        {/* Tournaments Card */}
        <div style={{
          flex: '1 0 300px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>Tournaments</h3>
          <p style={{ marginBottom: '20px' }}>
            Explore current and upcoming tennis tournaments from around the world.
          </p>
          <Link to="/tournaments">
            <button className="btn" style={{ width: '100%' }}>
              View Tournaments
            </button>
          </Link>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: 'var(--secondary-color)', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '10px' }}>Coming Soon:</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Live match tracking</li>
          <li>Match prediction contests</li>
          <li>Tennis news and updates</li>
        </ul>
      </div>
      
      <div className="text-center">
        <button 
          className="btn" 
          onClick={handleLogout}
          style={{ width: '200px' }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Welcome
