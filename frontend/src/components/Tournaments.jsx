import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Tournaments = () => {
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // Default to showing all tournaments
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Function to fetch tournaments data
  const fetchTournaments = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    try {
      // Fetch from our backend which now uses the tennis API service
      const response = await axios.get('http://localhost:5001/api/tennis/tournaments')
      setTournaments(response.data.data.tournaments || [])
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error('Error fetching tournaments:', err)
      setError('Failed to load tournaments. Please try again later.')
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    // Fetch tournaments only when the component mounts
    fetchTournaments(true)
    
    // Check if we should refresh based on last update time
    const lastRefreshTime = localStorage.getItem('tournamentsLastRefresh')
    if (lastRefreshTime) {
      const lastRefresh = new Date(lastRefreshTime)
      const now = new Date()
      const hoursSinceLastRefresh = (now - lastRefresh) / (1000 * 60 * 60)
      
      // Only auto-refresh if it's been more than 24 hours
      if (hoursSinceLastRefresh >= 24) {
        fetchTournaments()
        localStorage.setItem('tournamentsLastRefresh', now.toISOString())
      }
    } else {
      // First time visiting, set the refresh time
      localStorage.setItem('tournamentsLastRefresh', new Date().toISOString())
    }
  }, [])

  // Filter tournaments based on selected category
  const filteredTournaments = filter === 'all' 
    ? tournaments 
    : tournaments.filter(tournament => tournament.category === filter)

  // Group tournaments by category for display
  const groupedTournaments = filteredTournaments.reduce((acc, tournament) => {
    if (!acc[tournament.category]) {
      acc[tournament.category] = []
    }
    acc[tournament.category].push(tournament)
    return acc
  }, {})

  // Sort tournaments by start date within each category
  Object.keys(groupedTournaments).forEach(category => {
    groupedTournaments[category].sort((a, b) => 
      new Date(a.start_date) - new Date(b.start_date)
    )
  })

  // Get unique categories for filter buttons
  const categories = [...new Set(tournaments.map(t => t.category))]

  return (
    <div className="modern-card fade-in">
      <h1 style={{ 
        color: 'var(--primary-color)', 
        fontSize: '32px', 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: '24px',
        position: 'relative',
        display: 'inline-block',
        left: '50%',
        transform: 'translateX(-50%)'
      }}>
        Tennis Tournaments
        <div style={{
          height: '4px',
          width: '60px',
          background: 'var(--secondary-color)',
          position: 'absolute',
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderRadius: 'var(--border-radius-full)'
        }}></div>
      </h1>
      
      <div className="text-center" style={{ marginBottom: '36px', marginTop: '30px' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '12px' }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
          {refreshing && (
            <span style={{ 
              marginLeft: '10px', 
              color: 'var(--primary-color)',
              display: 'inline-flex',
              alignItems: 'center'
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color)',
                marginRight: '6px',
                animation: 'pulsOut 1.5s infinite'
              }}></span>
              Refreshing...
            </span>
          )}
        </p>
        <button 
          className="btn-outline btn-sm"
          onClick={() => {
            fetchTournaments()
            localStorage.setItem('tournamentsLastRefresh', new Date().toISOString())
          }}
          disabled={refreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"></path>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          {refreshing ? 'Refreshing...' : 'Refresh Now'}
        </button>
      </div>

      {/* Filter buttons */}
      <div className="modern-button-group" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <button 
          className={filter === 'all' ? 'btn btn-gradient' : 'btn-outline'}
          onClick={() => setFilter('all')}
        >
          All Tournaments
        </button>
        
        {categories.map(category => (
          <button 
            key={category}
            className={filter === category ? 'btn btn-gradient' : 'btn-outline'}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="modern-flex modern-flex-center" style={{ padding: '60px 0' }}>
          <div className="modern-spinner"></div>
        </div>
      ) : error ? (
        <div style={{ 
          backgroundColor: 'rgba(229, 57, 53, 0.1)', 
          border: '1px solid rgba(229, 57, 53, 0.3)', 
          color: 'var(--error-color)', 
          padding: '16px', 
          borderRadius: 'var(--border-radius-md)', 
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      ) : (
        <div>
          {Object.keys(groupedTournaments).length > 0 ? (
            Object.keys(groupedTournaments).map(category => (
              <div key={category} style={{ marginBottom: '50px', marginTop: '40px' }}>
                <h2 style={{ 
                  color: 'var(--primary-color)', 
                  borderBottom: '2px solid var(--secondary-color)',
                  paddingBottom: '12px',
                  marginBottom: '25px',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  position: 'relative'
                }}>
                  {category}
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '0',
                    width: '50px',
                    height: '4px',
                    backgroundColor: 'var(--primary-color)',
                    borderRadius: 'var(--border-radius-full)'
                  }}></div>
                </h2>
                
                <div className="modern-grid">
                  {groupedTournaments[category].map(tournament => (
                    <div 
                      key={tournament.tournament_id} 
                      className="glass-card"
                      style={{
                        padding: '24px',
                        borderRadius: 'var(--border-radius-lg)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-medium)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onClick={() => navigate(`/tournaments/${tournament.tournament_id}`)}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--card-shadow)';
                      }}
                    >
                      {/* Decorative element */}
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, var(--primary-light) 0%, transparent 70%)',
                        opacity: '0.2',
                        borderRadius: '0 var(--border-radius-lg) 0 80px'
                      }}></div>
                      
                      <h3 style={{ 
                        color: 'var(--primary-color)', 
                        marginBottom: '18px', 
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        {tournament.name}
                      </h3>
                      
                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '10px',
                          alignItems: 'center'
                        }}>
                          <span style={{ 
                            fontWeight: '500', 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'var(--text-light)'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            Location:
                          </span> 
                          <span>{tournament.location}</span>
                        </p>
                        
                        <p style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '10px',
                          alignItems: 'center'
                        }}>
                          <span style={{ 
                            fontWeight: '500', 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'var(--text-light)'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Dates:
                          </span> 
                          <span>{new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}</span>
                        </p>
                        
                        <p style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '10px',
                          alignItems: 'center'
                        }}>
                          <span style={{ 
                            fontWeight: '500', 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'var(--text-light)'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
                              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                              <path d="M18 12a2 2 0 0 0 0 4h2v-4h-2z"></path>
                            </svg>
                            Prize:
                          </span> 
                          <span>{tournament.prize_money}</span>
                        </p>
                        
                        <p style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '10px',
                          alignItems: 'center'
                        }}>
                          <span style={{ 
                            fontWeight: '500', 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'var(--text-light)'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                              <path d="M2 12h20"></path>
                              <path d="M6 16l-4-4 4-4"></path>
                              <path d="M18 8l4 4-4 4"></path>
                            </svg>
                            Surface:
                          </span> 
                          <span>{tournament.surface}</span>
                        </p>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginTop: '20px', 
                        paddingTop: '15px', 
                        borderTop: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <span className={
                          tournament.status === 'Completed' 
                            ? 'modern-badge modern-badge-gray' 
                            : tournament.status === 'In Progress' 
                              ? 'modern-badge modern-badge-success' 
                              : 'modern-badge modern-badge-secondary'
                        }>
                          {tournament.status}
                        </span>
                        <span className="btn-sm btn-gradient" style={{ 
                          padding: '6px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                          View Draw
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center" style={{ padding: '40px 0', color: 'var(--text-light)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>No tournaments found matching the selected filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Tournaments
