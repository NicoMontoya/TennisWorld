import { useNavigate } from 'react-router-dom'

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
      
      <div style={{ 
        backgroundColor: 'var(--secondary-color)', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '10px' }}>Coming Soon:</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Live match tracking</li>
          <li>Player statistics and rankings</li>
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
