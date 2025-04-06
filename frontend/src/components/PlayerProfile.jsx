import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const PlayerProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [player, setPlayer] = useState(null)
  const [recentMatches, setRecentMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'matches', 'stats'

  useEffect(() => {
    const fetchPlayerData = async () => {
      setLoading(true)
      try {
        // Fetch player data
        const response = await axios.get(`http://localhost:5001/api/tennis/players/${id}`)
        
        if (response.data && response.data.data) {
          setPlayer(response.data.data.player)
          
          // Fetch recent matches for this player
          const matchesResponse = await axios.get(`http://localhost:5001/api/tennis/players/${id}/matches`)
          if (matchesResponse.data && matchesResponse.data.data) {
            setRecentMatches(matchesResponse.data.data.matches || [])
          }
          
          setError(null)
        } else {
          setError('Invalid player data received')
        }
      } catch (err) {
        console.error('Error fetching player data:', err)
        setError('Failed to load player data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayerData()
  }, [id])

  // Calculate win percentage
  const calculateWinPercentage = () => {
    if (!recentMatches || recentMatches.length === 0) return 0
    
    const wins = recentMatches.filter(match => 
      (match.winner_id === parseInt(id) || 
       match.winner_name === player?.name)
    ).length
    
    return Math.round((wins / recentMatches.length) * 100)
  }

  // Format player data for display
  const formatPlayerData = () => {
    if (!player) return {}
    
    return {
      name: player.name || player.player_name,
      country: player.country,
      age: player.age || 'N/A',
      height: player.height ? `${player.height} cm` : 'N/A',
      weight: player.weight ? `${player.weight} kg` : 'N/A',
      plays: player.plays || 'N/A',
      ranking: player.ranking || player.rank || 'N/A',
      points: player.points ? player.points.toLocaleString() : 'N/A',
      turnedPro: player.turned_pro || 'N/A'
    }
  }

  // Render match result
  const renderMatchResult = (match) => {
    const isWinner = match.winner_id === parseInt(id) || match.winner_name === player?.name
    
    return (
      <div 
        key={match.match_id} 
        className="glass-card"
        style={{
          padding: '20px',
          marginBottom: '15px',
          borderRadius: 'var(--border-radius-md)',
          borderLeft: isWinner ? '4px solid var(--success-color)' : '4px solid var(--error-color)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>{match.tournament_name}</span>
          <span>{new Date(match.date).toLocaleDateString()}</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '40%'
          }}>
            <span style={{ 
              fontWeight: match.player1_id === parseInt(id) ? 'bold' : 'normal',
              color: match.player1_id === parseInt(id) ? 'var(--primary-color)' : 'inherit'
            }}>
              {match.player1_name}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
              {match.player1_country}
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            width: '20%'
          }}>
            <span style={{ fontWeight: 'bold' }}>VS</span>
            <span style={{ 
              fontSize: '12px', 
              color: isWinner ? 'var(--success-color)' : 'var(--error-color)',
              fontWeight: 'bold',
              marginTop: '5px'
            }}>
              {isWinner ? 'WIN' : 'LOSS'}
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-end',
            width: '40%'
          }}>
            <span style={{ 
              fontWeight: match.player2_id === parseInt(id) ? 'bold' : 'normal',
              color: match.player2_id === parseInt(id) ? 'var(--primary-color)' : 'inherit'
            }}>
              {match.player2_name}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
              {match.player2_country}
            </span>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'rgba(0,0,0,0.03)', 
          padding: '10px', 
          borderRadius: 'var(--border-radius-sm)',
          marginTop: '10px',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Score:</span>
            <span>{match.score || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
            <span>Round:</span>
            <span>{match.round || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
            <span>Surface:</span>
            <span>{match.surface || 'N/A'}</span>
          </div>
        </div>
      </div>
    )
  }

  // Render player statistics
  const renderPlayerStats = () => {
    if (!player || !recentMatches || recentMatches.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <p>No statistics available for this player.</p>
        </div>
      )
    }
    
    const winPercentage = calculateWinPercentage()
    const surfaceStats = calculateSurfaceStats()
    
    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          {/* Win Rate */}
          <div className="neumorphic" style={{ 
            padding: '20px', 
            textAlign: 'center',
            minWidth: '200px',
            flex: '1'
          }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Win Rate</h3>
            <div style={{ 
              position: 'relative', 
              width: '120px', 
              height: '120px', 
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke="#e6e6e6" 
                  strokeWidth="12" 
                />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke="var(--primary-color)" 
                  strokeWidth="12" 
                  strokeDasharray={`${2 * Math.PI * 54 * winPercentage / 100} ${2 * Math.PI * 54 * (100 - winPercentage) / 100}`}
                  strokeDashoffset={2 * Math.PI * 54 * 0.25}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                {winPercentage}%
              </div>
            </div>
            <p style={{ marginTop: '15px', fontSize: '14px', color: 'var(--text-light)' }}>
              Based on last {recentMatches.length} matches
            </p>
          </div>
          
          {/* Matches Played */}
          <div className="neumorphic" style={{ 
            padding: '20px', 
            textAlign: 'center',
            minWidth: '200px',
            flex: '1'
          }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Matches</h3>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around',
              marginTop: '20px'
            }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--success-color)' }}>
                  {recentMatches.filter(match => 
                    match.winner_id === parseInt(id) || match.winner_name === player?.name
                  ).length}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>Wins</div>
              </div>
              <div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--error-color)' }}>
                  {recentMatches.filter(match => 
                    match.winner_id !== parseInt(id) && match.winner_name !== player?.name
                  ).length}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>Losses</div>
              </div>
            </div>
            <p style={{ marginTop: '15px', fontSize: '14px', color: 'var(--text-light)' }}>
              Total: {recentMatches.length} matches
            </p>
          </div>
        </div>
        
        {/* Surface Performance */}
        <h3 style={{ 
          color: 'var(--primary-color)', 
          borderBottom: '2px solid var(--secondary-color)',
          paddingBottom: '10px',
          marginBottom: '20px',
          marginTop: '30px'
        }}>
          Performance by Surface
        </h3>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '15px',
          justifyContent: 'space-between'
        }}>
          {Object.entries(surfaceStats).map(([surface, stats]) => (
            <div 
              key={surface}
              className="glass-card"
              style={{
                padding: '15px',
                flex: '1 0 200px',
                minWidth: '200px'
              }}
            >
              <h4 style={{ marginBottom: '10px' }}>{surface}</h4>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#e6e6e6',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${stats.winPercentage}%`, 
                    height: '100%', 
                    backgroundColor: 'var(--primary-color)',
                    borderRadius: '4px'
                  }}></div>
                </div>
                <span style={{ 
                  marginLeft: '10px', 
                  fontWeight: 'bold',
                  minWidth: '40px'
                }}>
                  {stats.winPercentage}%
                </span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                {stats.wins} wins, {stats.losses} losses
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Calculate surface statistics
  const calculateSurfaceStats = () => {
    if (!recentMatches || recentMatches.length === 0) return {}
    
    const stats = {}
    
    recentMatches.forEach(match => {
      const surface = match.surface || 'Unknown'
      
      if (!stats[surface]) {
        stats[surface] = { matches: 0, wins: 0, losses: 0, winPercentage: 0 }
      }
      
      stats[surface].matches++
      
      if (match.winner_id === parseInt(id) || match.winner_name === player?.name) {
        stats[surface].wins++
      } else {
        stats[surface].losses++
      }
    })
    
    // Calculate win percentages
    Object.keys(stats).forEach(surface => {
      stats[surface].winPercentage = Math.round(
        (stats[surface].wins / stats[surface].matches) * 100
      )
    })
    
    return stats
  }

  if (loading) {
    return (
      <div className="modern-card text-center">
        <div className="modern-flex modern-flex-center" style={{ padding: '60px 0' }}>
          <div className="modern-spinner"></div>
        </div>
        <h2 style={{ fontSize: '20px', color: 'var(--text-light)' }}>Loading player profile...</h2>
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
          onClick={() => navigate('/rankings')}
        >
          Back to Rankings
        </button>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="modern-card text-center">
        <h2 style={{ fontSize: '20px', color: 'var(--text-light)', marginBottom: '24px' }}>Player not found</h2>
        <button 
          className="btn"
          onClick={() => navigate('/rankings')}
        >
          Back to Rankings
        </button>
      </div>
    )
  }

  const playerData = formatPlayerData()

  return (
    <div className="modern-card fade-in">
      <div style={{ marginBottom: '24px' }}>
        <button 
          className="btn-outline btn-sm"
          onClick={() => navigate('/rankings')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          Back to Rankings
        </button>
      </div>
      
      {/* Player Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '30px'
      }}>
        {/* Player Avatar */}
        <div style={{ 
          width: '120px', 
          height: '120px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--primary-light)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          fontSize: '48px',
          fontWeight: 'bold',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
        }}>
          {playerData.name.charAt(0)}
        </div>
        
        {/* Player Info */}
        <div style={{ flex: '1' }}>
          <h1 style={{ 
            color: 'var(--primary-color)', 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '10px'
          }}>
            {playerData.name}
          </h1>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '15px',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px',
              color: 'var(--text-light)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {playerData.country}
            </div>
            
            <div className="modern-badge modern-badge-primary">
              Rank: {playerData.ranking}
            </div>
            
            <div className="modern-badge modern-badge-secondary">
              Points: {playerData.points}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="modern-tabs">
        <div 
          className={`modern-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </div>
        <div 
          className={`modern-tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Recent Matches
        </div>
        <div 
          className={`modern-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </div>
      </div>
      
      {/* Tab Content */}
      <div style={{ marginTop: '30px' }}>
        {activeTab === 'overview' && (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div className="glass-card" style={{ padding: '15px' }}>
                <div style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '5px' }}>Age</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{playerData.age}</div>
              </div>
              
              <div className="glass-card" style={{ padding: '15px' }}>
                <div style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '5px' }}>Height</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{playerData.height}</div>
              </div>
              
              <div className="glass-card" style={{ padding: '15px' }}>
                <div style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '5px' }}>Weight</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{playerData.weight}</div>
              </div>
              
              <div className="glass-card" style={{ padding: '15px' }}>
                <div style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '5px' }}>Plays</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{playerData.plays}</div>
              </div>
              
              <div className="glass-card" style={{ padding: '15px' }}>
                <div style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '5px' }}>Turned Pro</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{playerData.turnedPro}</div>
              </div>
            </div>
            
            <h3 style={{ 
              color: 'var(--primary-color)', 
              borderBottom: '2px solid var(--secondary-color)',
              paddingBottom: '10px',
              marginBottom: '20px',
              marginTop: '30px'
            }}>
              Career Highlights
            </h3>
            
            {player.career_titles && player.career_titles.length > 0 ? (
              <div>
                <h4 style={{ marginBottom: '15px' }}>Tournament Titles</h4>
                <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                  {player.career_titles.map((title, index) => (
                    <li key={index} style={{ marginBottom: '10px' }}>
                      {title}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No career highlights available for this player.</p>
            )}
            
            {/* Recent Form */}
            <h3 style={{ 
              color: 'var(--primary-color)', 
              borderBottom: '2px solid var(--secondary-color)',
              paddingBottom: '10px',
              marginBottom: '20px',
              marginTop: '30px'
            }}>
              Recent Form
            </h3>
            
            {recentMatches && recentMatches.length > 0 ? (
              <div style={{ 
                display: 'flex', 
                gap: '10px',
                marginBottom: '20px',
                overflowX: 'auto',
                padding: '10px 0'
              }}>
                {recentMatches.slice(0, 10).map((match, index) => {
                  const isWinner = match.winner_id === parseInt(id) || match.winner_name === player?.name
                  
                  return (
                    <div 
                      key={index}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: isWinner ? 'var(--success-color)' : 'var(--error-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}
                      title={`${match.tournament_name}: ${isWinner ? 'Win' : 'Loss'} against ${
                        match.player1_id === parseInt(id) ? match.player2_name : match.player1_name
                      }`}
                    >
                      {isWinner ? 'W' : 'L'}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p>No recent matches available.</p>
            )}
          </div>
        )}
        
        {activeTab === 'matches' && (
          <div>
            <h3 style={{ 
              color: 'var(--primary-color)', 
              borderBottom: '2px solid var(--secondary-color)',
              paddingBottom: '10px',
              marginBottom: '20px'
            }}>
              Recent Matches
            </h3>
            
            {recentMatches && recentMatches.length > 0 ? (
              recentMatches.map(match => renderMatchResult(match))
            ) : (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <p>No match history available for this player.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'stats' && renderPlayerStats()}
      </div>
    </div>
  )
}

export default PlayerProfile
