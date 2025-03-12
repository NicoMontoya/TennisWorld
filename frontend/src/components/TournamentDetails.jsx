import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const TournamentDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tournamentDetails, setTournamentDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('draw') // 'draw', 'live', 'completed'

  useEffect(() => {
    const fetchTournamentDetails = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`http://localhost:5001/api/tennis/tournaments/${id}/details`)
        setTournamentDetails(response.data.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching tournament details:', err)
        setError('Failed to load tournament details. Please try again later.')
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

  // Render match card
  const renderMatchCard = (match) => {
    const isCompleted = match.event_status === 'Finished'
    const isLive = match.event_live === '1'
    const player1Winner = match.event_winner === 'First Player'
    const player2Winner = match.event_winner === 'Second Player'
    
    return (
      <div 
        key={match.event_key} 
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '15px',
          backgroundColor: isLive ? '#f8f9fa' : 'white',
          boxShadow: isLive ? '0 0 10px rgba(0,128,0,0.2)' : 'none'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', color: '#666' }}>{match.tournament_round}</div>
          {isLive && (
            <div style={{ 
              backgroundColor: '#28a745', 
              color: 'white', 
              padding: '3px 8px', 
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              LIVE
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ 
            flex: '1', 
            fontWeight: 'bold',
            color: player1Winner ? 'var(--primary-color)' : 'inherit',
            display: 'flex',
            alignItems: 'center'
          }}>
            {player1Winner && <span style={{ marginRight: '5px' }}>✓</span>}
            {match.event_first_player}
          </div>
          <div style={{ width: '80px', textAlign: 'center' }}>
            {isCompleted || isLive ? renderScore(match.scores) : 'vs'}
          </div>
          <div style={{ 
            flex: '1', 
            fontWeight: 'bold',
            color: player2Winner ? 'var(--primary-color)' : 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}>
            {match.event_second_player}
            {player2Winner && <span style={{ marginLeft: '5px' }}>✓</span>}
          </div>
        </div>
        
        {isLive && (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '5px 10px', 
            borderRadius: '4px',
            fontSize: '0.9rem',
            marginTop: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>Current Set: {match.event_status}</div>
              <div>Serve: {match.event_serve === 'First Player' ? match.event_first_player : match.event_second_player}</div>
            </div>
            <div style={{ marginTop: '5px' }}>
              Game Score: {match.event_game_result}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card" style={{ maxWidth: '1000px', margin: '50px auto', padding: '40px', textAlign: 'center' }}>
        <h2>Loading tournament details...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card" style={{ maxWidth: '1000px', margin: '50px auto', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'red' }}>{error}</h2>
        <button 
          className="btn" 
          onClick={() => navigate('/tournaments')}
          style={{ marginTop: '20px' }}
        >
          Back to Tournaments
        </button>
      </div>
    )
  }

  if (!tournamentDetails || !tournamentDetails.tournament) {
    return (
      <div className="card" style={{ maxWidth: '1000px', margin: '50px auto', padding: '40px', textAlign: 'center' }}>
        <h2>Tournament not found</h2>
        <button 
          className="btn" 
          onClick={() => navigate('/tournaments')}
          style={{ marginTop: '20px' }}
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

  return (
    <div className="card" style={{ maxWidth: '1000px', margin: '50px auto', padding: '40px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          className="btn btn-sm btn-secondary" 
          onClick={() => navigate('/tournaments')}
          style={{ marginBottom: '20px' }}
        >
          ← Back to Tournaments
        </button>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>
            {tournament.name}
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '5px' }}><strong>Location:</strong> {tournament.location}</p>
          <p style={{ fontSize: '1.2rem', marginBottom: '5px' }}><strong>Surface:</strong> {tournament.surface}</p>
          <p style={{ fontSize: '1.2rem', marginBottom: '5px' }}>
            <strong>Dates:</strong> {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
          </p>
          <p style={{ fontSize: '1.2rem', marginBottom: '5px' }}><strong>Prize Money:</strong> {tournament.prize_money}</p>
        </div>
        
        <div style={{ 
          backgroundColor: tournament.status === 'Completed' ? '#d3d3d3' : 'var(--secondary-color)',
          color: 'var(--text-color)',
          padding: '10px 20px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>
          {tournament.status}
        </div>
      </div>
      
      {/* Tab navigation */}
      <div style={{ display: 'flex', borderBottom: '2px solid #ddd', marginBottom: '20px' }}>
        <div 
          style={{ 
            padding: '10px 20px', 
            cursor: 'pointer',
            borderBottom: activeTab === 'draw' ? '3px solid var(--primary-color)' : 'none',
            fontWeight: activeTab === 'draw' ? 'bold' : 'normal'
          }}
          onClick={() => setActiveTab('draw')}
        >
          Tournament Draw
        </div>
        <div 
          style={{ 
            padding: '10px 20px', 
            cursor: 'pointer',
            borderBottom: activeTab === 'live' ? '3px solid var(--primary-color)' : 'none',
            fontWeight: activeTab === 'live' ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center'
          }}
          onClick={() => setActiveTab('live')}
        >
          Live Matches
          {liveMatchesCount > 0 && (
            <span style={{ 
              marginLeft: '5px',
              backgroundColor: '#28a745',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem'
            }}>
              {liveMatchesCount}
            </span>
          )}
        </div>
        <div 
          style={{ 
            padding: '10px 20px', 
            cursor: 'pointer',
            borderBottom: activeTab === 'completed' ? '3px solid var(--primary-color)' : 'none',
            fontWeight: activeTab === 'completed' ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center'
          }}
          onClick={() => setActiveTab('completed')}
        >
          Completed Matches
          {completedMatchesCount > 0 && (
            <span style={{ 
              marginLeft: '5px',
              backgroundColor: '#6c757d',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem'
            }}>
              {completedMatchesCount}
            </span>
          )}
        </div>
      </div>
      
      {/* Tab content */}
      <div>
        {filteredFixtures.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <p>No matches available for this view.</p>
          </div>
        ) : (
          sortedRounds.map(round => (
            <div key={round} style={{ marginBottom: '30px' }}>
              <h3 style={{ 
                color: 'var(--primary-color)', 
                borderBottom: '1px solid var(--secondary-color)',
                paddingBottom: '10px',
                marginBottom: '15px'
              }}>
                {round}
              </h3>
              
              {fixturesByRound[round].map(match => renderMatchCard(match))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TournamentDetails
