import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const TournamentDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [tournamentDetails, setTournamentDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('draw') // 'draw', 'live', 'completed'
  
  useEffect(() => {
    
    const fetchTournamentDetails = async () => {
      setLoading(true)
      try {
        console.log(`Fetching tournament details for ID: ${id}`)
        const response = await axios.get(`http://localhost:5001/api/tennis/tournaments/${id}/details`)
        
        // Check if we have valid data
        if (response.data && response.data.data) {
          console.log('Tournament details received:', response.data.data.tournament?.name)
          setTournamentDetails(response.data.data)
          setError(null)
        } else {
          console.error('Invalid response format:', response.data)
          setError('Invalid tournament data received. Please try again later.')
        }
      } catch (err) {
        console.error('Error fetching tournament details:', err)
        
        // More detailed error message
        let errorMessage = 'Failed to load tournament details. Please try again later.'
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', err.response.data)
          console.error('Error status:', err.response.status)
          errorMessage = `Server error (${err.response.status}): ${err.response.data.message || 'Unknown error'}`
        } else if (err.request) {
          // The request was made but no response was received
          console.error('No response received:', err.request)
          errorMessage = 'No response from server. Please check your connection.'
        }
        
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchTournamentDetails()
  }, [id])

  // Group fixtures by round
  const groupFixturesByRound = (fixtures) => {
    if (!fixtures) return {}
    
    return fixtures.reduce((acc, fixture) => {
      const round = fixture.tournament_round || 'Unknown Round'
      if (!acc[round]) {
        acc[round] = []
      }
      acc[round].push(fixture)
      return acc
    }, {})
  }

  // Sort rounds in a logical order
  const sortRounds = (rounds) => {
    const roundOrder = {
      'Qualification': 0,
      'Round of 128': 1,
      'Round of 64': 2,
      'Round of 32': 3,
      'Round of 16': 4,
      'Quarter-final': 5,
      'Semi-final': 6,
      'Final': 7
    }
    
    return rounds.sort((a, b) => {
      const orderA = roundOrder[a] !== undefined ? roundOrder[a] : 999
      const orderB = roundOrder[b] !== undefined ? roundOrder[b] : 999
      return orderA - orderB
    })
  }
  
  // Sort fixtures within a round by seed
  const sortFixturesBySeeding = (fixtures) => {
    if (!fixtures) return []
    
    return [...fixtures].sort((a, b) => {
      // First try to sort by first player seed
      const seedA1 = a.first_player_seed !== undefined ? a.first_player_seed : 999
      const seedB1 = b.first_player_seed !== undefined ? b.first_player_seed : 999
      
      if (seedA1 !== seedB1) {
        return seedA1 - seedB1
      }
      
      // If first player seeds are the same, try second player seeds
      const seedA2 = a.second_player_seed !== undefined ? a.second_player_seed : 999
      const seedB2 = b.second_player_seed !== undefined ? b.second_player_seed : 999
      
      return seedA2 - seedB2
    })
  }

  // Filter fixtures based on active tab
  const getFilteredFixtures = () => {
    if (!tournamentDetails || !tournamentDetails.fixtures) return []
    
    if (activeTab === 'draw') {
      return tournamentDetails.fixtures
    } else if (activeTab === 'live') {
      return tournamentDetails.livescores || []
    } else if (activeTab === 'completed') {
      return tournamentDetails.fixtures.filter(fixture => fixture.event_status === 'Finished')
    }
    
    return []
  }

  // Render match score
  const renderScore = (scores) => {
    if (!scores || scores.length === 0) return '-'
    
    return scores.map((set, index) => (
      <span key={index} style={{ marginRight: '5px' }}>
        {set.score_first}-{set.score_second}
        {index < scores.length - 1 ? ', ' : ''}
      </span>
    ))
  }

  // CSS styles for the bracket
  const bracketStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      overflowX: 'auto'
    },
    roundLabels: {
      display: 'flex',
      justifyContent: 'space-around',
      marginBottom: '20px'
    },
    roundLabel: {
      color: 'var(--primary-color)',
      fontWeight: 'bold',
      padding: '5px 10px',
      borderBottom: '2px solid var(--primary-color)',
      textAlign: 'center',
      minWidth: '120px'
    },
    wrapper: {
      display: 'flex',
      justifyContent: 'center',
      padding: '20px',
      overflowX: 'auto',
      minHeight: '600px'
    },
    seed: {
      fontSize: '12px',
      color: '#666',
      marginLeft: '5px',
      fontWeight: 'normal'
    }
  };

  if (loading) {
    return (
      <div className="modern-card text-center">
        <div className="modern-flex modern-flex-center" style={{ padding: '60px 0' }}>
          <div className="modern-spinner"></div>
        </div>
        <h2 style={{ fontSize: '20px', color: 'var(--text-light)' }}>Loading tournament details...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="modern-card text-center">
        <div style={{ 
          backgroundColor: 'rgba(229, 57, 53, 0.1)', 
          border: '1px solid rgba(229, 57, 53, 0.3)', 
          color: 'var(--error-color)', 
          padding: '16px', 
          borderRadius: 'var(--border-radius-md)', 
          marginBottom: '24px',
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
          <span>{error}</span>
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/tournaments')}
        >
          Back to Tournaments
        </button>
      </div>
    )
  }

  if (!tournamentDetails || !tournamentDetails.tournament) {
    return (
      <div className="modern-card text-center">
        <h2 style={{ fontSize: '20px', color: 'var(--text-light)', marginBottom: '24px' }}>Tournament not found</h2>
        <button 
          className="btn"
          onClick={() => navigate('/tournaments')}
        >
          Back to Tournaments
        </button>
      </div>
    )
  }

  const { tournament, fixtures, livescores } = tournamentDetails
  const filteredFixtures = getFilteredFixtures()
  const fixturesByRound = groupFixturesByRound(filteredFixtures)
  const sortedRounds = sortRounds(Object.keys(fixturesByRound))
  
  const liveMatchesCount = livescores ? livescores.length : 0
  const completedMatchesCount = fixtures ? fixtures.filter(f => f.event_status === 'Finished').length : 0

  // Handle build bracket button click
  const handleBuildBracket = () => {
    navigate(`/tournaments/${id}/build`);
  };

  return (
    <div className="modern-card fade-in">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          className="btn-outline btn-sm"
          onClick={() => navigate('/tournaments')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          Back to Tournaments
        </button>
        
        {isLoggedIn && (
          <button 
            className="btn-gradient"
            onClick={handleBuildBracket}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            Build Bracket
          </button>
        )}
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{ 
            color: 'var(--primary-color)', 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '10px'
          }}>
            {tournament.name}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            <div className="modern-badge modern-badge-primary">
              {tournament.surface}
            </div>
            <div className="modern-badge modern-badge-secondary">
              {tournament.category}
            </div>
            {tournament.location && (
              <div className="modern-badge modern-badge-gray">
                {tournament.location}
              </div>
            )}
          </div>
          
          <div style={{ color: 'var(--text-light)', marginBottom: '10px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginRight: '20px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {tournament.start_date} - {tournament.end_date}
            </span>
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <div className="modern-tabs">
          <div 
            className={`modern-tab ${activeTab === 'draw' ? 'active' : ''}`}
            onClick={() => setActiveTab('draw')}
          >
            Draw
          </div>
          <div 
            className={`modern-tab ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            Live Matches {liveMatchesCount > 0 && <span className="modern-badge modern-badge-success">{liveMatchesCount}</span>}
          </div>
          <div 
            className={`modern-tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed {completedMatchesCount > 0 && <span className="modern-badge modern-badge-gray">{completedMatchesCount}</span>}
          </div>
        </div>
        
        <div className="tab-content">
          {activeTab === 'draw' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>Tournament Draw</h3>
              <p>Tournament draw is being loaded...</p>
            </div>
          )}
          
          {activeTab === 'live' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>Live Matches</h3>
              {liveMatchesCount > 0 ? (
                <p>Live matches are being loaded...</p>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <p>No live matches at the moment.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'completed' && (
            <div>
              <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>Completed Matches</h3>
              {completedMatchesCount > 0 ? (
                <p>Completed matches are being loaded...</p>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <p>No completed matches yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TournamentDetails
