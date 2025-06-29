import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('userToken')
        const response = await axios.get('http://localhost:5001/api/users/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (response.data && response.data.status === 'success') {
          setDashboardData(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="modern-card fade-in" style={{ maxWidth: '1200px', textAlign: 'center', padding: '60px 20px' }}>
        <div className="modern-spinner" style={{ margin: '0 auto 20px' }}></div>
        <p style={{ color: 'var(--text-light)' }}>Loading your dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="modern-card fade-in" style={{ maxWidth: '1200px', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ color: 'var(--error-color)', marginBottom: '20px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 15px', display: 'block' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <h3>Unable to Load Dashboard</h3>
          <p>{error}</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    )
  }

  const userData = dashboardData?.user || {}
  const stats = dashboardData?.stats || {}
  const favoritePlayers = dashboardData?.favorite_players || []
  const upcomingTournaments = dashboardData?.upcoming_tournaments || []
  const upcomingMatches = dashboardData?.upcoming_matches || []

  return (
    <div className="dashboard-container fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Dashboard Header */}
      <div className="dashboard-header" style={{
        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '40px',
        marginBottom: '30px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 15px 35px rgba(46, 139, 87, 0.2)'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
                Welcome back, {userData.first_name || userData.username}! 🎾
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '6px 12px',
                  borderRadius: 'var(--border-radius-full)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {userData.account_type} Member
                </span>
                {stats.rank && (
                  <span style={{
                    backgroundColor: 'rgba(255,215,0,0.3)',
                    padding: '6px 12px',
                    borderRadius: 'var(--border-radius-full)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    🏆 Rank #{stats.rank}
                  </span>
                )}
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  padding: '6px 12px',
                  borderRadius: 'var(--border-radius-full)',
                  fontSize: '14px'
                }}>
                  Member for {userData.days_since_registration || 0} days
                </span>
              </div>
            </div>
            
            <button 
              className="btn-outline"
              onClick={handleLogout}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 'var(--border-radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
          
          {/* Quick Stats */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '20px',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                {stats.accuracy_percentage || 0}%
              </div>
              <div style={{ fontSize: '14px', opacity: '0.9' }}>Prediction Accuracy</div>
            </div>
            
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '20px',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                {stats.total_predictions || 0}
              </div>
              <div style={{ fontSize: '14px', opacity: '0.9' }}>Total Predictions</div>
            </div>
            
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '20px',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                {stats.points || 0}
              </div>
              <div style={{ fontSize: '14px', opacity: '0.9' }}>Points Earned</div>
            </div>
            
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '20px',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                {stats.brackets_created || 0}
              </div>
              <div style={{ fontSize: '14px', opacity: '0.9' }}>Brackets Created</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '30px',
        marginBottom: '30px'
      }}>
        {/* Favorite Players Card */}
        <div className="glass-card hover-card" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <h3 style={{ color: 'var(--primary-color)', fontSize: '20px', fontWeight: 'bold' }}>
              Your Favorite Players
            </h3>
          </div>
          
          {favoritePlayers.length > 0 ? (
            <div>
              {favoritePlayers.map((player, index) => (
                <div 
                  key={player.player_id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '15px',
                    padding: '15px',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 'var(--border-radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => navigate(`/players/${player.player_id}`)}
                  className="clickable-row"
                >
                  <span style={{ 
                    width: '30px', 
                    height: '30px', 
                    borderRadius: '50%', 
                    backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                    color: index === 0 ? '#000' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    marginRight: '15px'
                  }}>
                    #{player.rank}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                      {player.player_name}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                      {player.country} • {player.points?.toLocaleString()} pts
                    </div>
                  </div>
                </div>
              ))}
              <Link to="/rankings" style={{ textDecoration: 'none' }}>
                <button className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }}>
                  View All Rankings
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: 'var(--text-light)', marginBottom: '15px' }}>
                You haven't selected any favorite players yet.
              </p>
              <Link to="/rankings" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary">
                  Explore Players
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Tournaments Card */}
        <div className="glass-card hover-card" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--secondary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3 style={{ color: 'var(--secondary-color)', fontSize: '20px', fontWeight: 'bold' }}>
              Upcoming Tournaments
            </h3>
          </div>
          
          {upcomingTournaments.length > 0 ? (
            <div>
              {upcomingTournaments.map((tournament) => (
                <div 
                  key={tournament.tournament_id}
                  style={{ 
                    marginBottom: '15px',
                    padding: '15px',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 'var(--border-radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => navigate(`/tournaments/${tournament.tournament_id}`)}
                  className="clickable-row"
                >
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                    {tournament.name}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '5px' }}>
                    📍 {tournament.location}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '5px' }}>
                    🏟️ {tournament.surface} • {tournament.category}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                    📅 {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
              <Link to="/tournaments" style={{ textDecoration: 'none' }}>
                <button className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }}>
                  View All Tournaments
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: 'var(--text-light)', marginBottom: '15px' }}>
                No upcoming tournaments found.
              </p>
              <Link to="/tournaments" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary">
                  Explore Tournaments
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card" style={{ padding: '30px', marginBottom: '30px' }}>
        <h3 style={{ 
          color: 'var(--text-color)', 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Quick Actions
        </h3>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <button className="btn btn-outline" style={{ 
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '15px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              View Profile
            </button>
          </Link>
          
          <Link to="/tournaments" style={{ textDecoration: 'none' }}>
            <button className="btn btn-outline" style={{ 
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '15px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
              </svg>
              Create Bracket
            </button>
          </Link>
          
          <Link to="/rankings" style={{ textDecoration: 'none' }}>
            <button className="btn btn-outline" style={{ 
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '15px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              View Rankings
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
