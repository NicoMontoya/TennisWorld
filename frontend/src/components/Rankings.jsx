import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Rankings = () => {
  const navigate = useNavigate()
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [type, setType] = useState('ATP') // Default to ATP rankings
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Function to fetch rankings data
  const fetchRankings = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    try {
      // Fetch from our backend which now uses the tennis API service
      const response = await axios.get(`http://localhost:5001/api/tennis/rankings/${type}`)
      setRankings(response.data.data.rankings || [])
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error('Error fetching rankings:', err)
      setError('Failed to load rankings. Please try again later.')
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    // Fetch rankings only when the component mounts or type changes
    fetchRankings(true)
    
    // Check if we should refresh based on last update time
    const lastRefreshTime = localStorage.getItem('rankingsLastRefresh')
    if (lastRefreshTime) {
      const lastRefresh = new Date(lastRefreshTime)
      const now = new Date()
      const hoursSinceLastRefresh = (now - lastRefresh) / (1000 * 60 * 60)
      
      // Only auto-refresh if it's been more than 24 hours
      if (hoursSinceLastRefresh >= 24) {
        fetchRankings()
        localStorage.setItem('rankingsLastRefresh', now.toISOString())
      }
    } else {
      // First time visiting, set the refresh time
      localStorage.setItem('rankingsLastRefresh', new Date().toISOString())
    }
  }, [type])

  const handleTypeChange = (newType) => {
    setType(newType)
  }
  
  const handleRefresh = () => {
    fetchRankings()
    localStorage.setItem('rankingsLastRefresh', new Date().toISOString())
  }

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
        Tennis Rankings
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
          onClick={handleRefresh}
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

      <div className="modern-button-group">
        <button 
          className={type === 'ATP' ? 'btn btn-gradient' : 'btn-outline'}
          onClick={() => handleTypeChange('ATP')}
        >
          ATP (Men)
        </button>
        <button 
          className={type === 'WTA' ? 'btn btn-gradient' : 'btn-outline'}
          onClick={() => handleTypeChange('WTA')}
        >
          WTA (Women)
        </button>
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
        <div style={{ overflowX: 'auto', borderRadius: 'var(--border-radius-lg)' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: '70px', borderTopLeftRadius: 'var(--border-radius-md)' }}>Rank</th>
                <th>Player</th>
                <th>Country</th>
                <th>Points</th>
                <th style={{ width: '100px', borderTopRightRadius: 'var(--border-radius-md)' }}>Movement</th>
              </tr>
            </thead>
            <tbody>
              {rankings.slice(0, 100).map((player, index) => (
                <tr key={player.player_id} style={{ 
                  backgroundColor: index % 2 === 0 ? 'white' : 'rgba(0,0,0,0.02)',
                  transition: 'all var(--transition-fast)'
                }}>
                  <td style={{ fontWeight: '600' }}>
                    {player.rank <= 3 ? (
                      <span className="modern-badge" style={{
                        backgroundColor: player.rank === 1 ? '#FFD700' : player.rank === 2 ? '#C0C0C0' : '#CD7F32',
                        color: player.rank === 1 ? '#000' : player.rank === 2 ? '#000' : '#fff',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}>
                        {player.rank}
                      </span>
                    ) : (
                      player.rank
                    )}
                  </td>
                  <td style={{ fontWeight: '600' }}>
                    <span 
                      style={{ 
                        cursor: 'pointer', 
                        color: 'var(--primary-color)',
                        transition: 'all var(--transition-fast)'
                      }}
                      onClick={() => navigate(`/player/${player.player_id}`)}
                      onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                    >
                      {player.player_name}
                    </span>
                  </td>
                  <td>{player.country}</td>
                  <td>{player.points.toLocaleString()}</td>
                  <td>
                    {player.movement > 0 ? (
                      <span className="modern-badge modern-badge-success" style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center',
                        padding: '4px 8px'
                      }}>
                        <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        {player.movement}
                      </span>
                    ) : player.movement < 0 ? (
                      <span className="modern-badge modern-badge-error" style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center',
                        padding: '4px 8px'
                      }}>
                        <svg style={{ width: '14px', height: '14px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {Math.abs(player.movement)}
                      </span>
                    ) : (
                      <span className="modern-badge modern-badge-gray">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {rankings.length === 0 && (
            <div className="text-center" style={{ padding: '40px 0', color: 'var(--text-light)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p>No rankings data available.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Rankings
