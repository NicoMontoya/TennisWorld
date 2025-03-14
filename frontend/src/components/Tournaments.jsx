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
    <div className="card" style={{ maxWidth: '1000px', margin: '50px auto', padding: '40px' }}>
      <h1 className="text-center" style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>
        Tennis Tournaments
      </h1>
      <div className="text-center" style={{ marginBottom: '30px' }}>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
          {refreshing && <span style={{ marginLeft: '10px', color: 'var(--primary-color)' }}>● Refreshing...</span>}
        </p>
        <button 
          className="btn btn-sm btn-secondary" 
          onClick={() => {
            fetchTournaments()
            localStorage.setItem('tournamentsLastRefresh', new Date().toISOString())
          }}
          disabled={refreshing}
          style={{ fontSize: '0.8rem' }}
        >
          Refresh Now
        </button>
      </div>

      {/* Filter buttons */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <button 
          className={`btn ${filter === 'all' ? '' : 'btn-secondary'}`} 
          onClick={() => setFilter('all')}
          style={{ marginRight: '10px', marginBottom: '10px' }}
        >
          All Tournaments
        </button>
        
        {categories.map(category => (
          <button 
            key={category}
            className={`btn ${filter === category ? '' : 'btn-secondary'}`} 
            onClick={() => setFilter(category)}
            style={{ marginRight: '10px', marginBottom: '10px' }}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center">Loading tournaments...</div>
      ) : error ? (
        <div className="error text-center">{error}</div>
      ) : (
        <div>
          {Object.keys(groupedTournaments).length > 0 ? (
            Object.keys(groupedTournaments).map(category => (
              <div key={category} style={{ marginBottom: '40px' }}>
                <h2 style={{ 
                  color: 'var(--primary-color)', 
                  borderBottom: '2px solid var(--secondary-color)',
                  paddingBottom: '10px',
                  marginBottom: '20px'
                }}>
                  {category}
                </h2>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                  {groupedTournaments[category].map(tournament => (
                    <div 
                      key={tournament.tournament_id} 
                      style={{
                        flex: '1 0 300px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '15px',
                        backgroundColor: tournament.status === 'Completed' ? '#f9f9f9' : 'white',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        position: 'relative'
                      }}
                      onClick={() => navigate(`/tournament/${tournament.tournament_id}`)}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <h3 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>
                        {tournament.name}
                      </h3>
                      <p><strong>Location:</strong> {tournament.location}</p>
                      <p><strong>Surface:</strong> {tournament.surface}</p>
                      <p><strong>Dates:</strong> {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}</p>
                      <p><strong>Prize Money:</strong> {tournament.prize_money}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        <span 
                          style={{
                            display: 'inline-block',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            backgroundColor: tournament.status === 'Completed' ? '#d3d3d3' : 'var(--secondary-color)',
                            color: 'var(--text-color)',
                            fontWeight: 'bold'
                          }}
                        >
                          {tournament.status}
                        </span>
                        <span 
                          style={{
                            display: 'inline-block',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          View Draw
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center" style={{ marginTop: '20px' }}>
              No tournaments found matching the selected filter.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Tournaments
