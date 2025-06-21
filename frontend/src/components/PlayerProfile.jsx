import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const PlayerProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [player, setPlayer] = useState(null)
  const [recentMatches, setRecentMatches] = useState([])
  const [playerStats, setPlayerStats] = useState(null)
  const [playerForm, setPlayerForm] = useState(null)
  const [playerInjury, setPlayerInjury] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'matches', 'stats', 'form', 'h2h'

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
          
          // Fetch player stats
          try {
            const statsResponse = await axios.get(`http://localhost:5001/api/tennis/players/${id}/stats`)
            if (statsResponse.data && statsResponse.data.data) {
              setPlayerStats(statsResponse.data.data.stats || null)
            }
          } catch (statsErr) {
            console.log('Stats not available yet:', statsErr)
          }
          
          // Fetch player form
          try {
            const formResponse = await axios.get(`http://localhost:5001/api/tennis/players/${id}/form`)
            if (formResponse.data && formResponse.data.data) {
              setPlayerForm(formResponse.data.data.form || null)
            }
          } catch (formErr) {
            console.log('Form data not available yet:', formErr)
          }
          
          // Fetch player injury
          try {
            const injuryResponse = await axios.get(`http://localhost:5001/api/tennis/players/${id}/injury`)
            if (injuryResponse.data && injuryResponse.data.data) {
              setPlayerInjury(injuryResponse.data.data.injury || null)
            }
          } catch (injuryErr) {
            console.log('Injury data not available yet:', injuryErr)
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

  // Render player overview
  const renderOverview = () => {
    if (!player) return null
    
    const playerData = formatPlayerData()
    
    return (
      <div>
        <div className="glass-card">
          <h3>Player Information</h3>
          <div>
            <div>Age: {playerData.age}</div>
            <div>Height: {playerData.height}</div>
            <div>Weight: {playerData.weight}</div>
            <div>Plays: {playerData.plays}</div>
            <div>Turned Pro: {playerData.turnedPro}</div>
          </div>
        </div>
        
        {playerInjury && (
          <div className="glass-card">
            <h3>Injury Status</h3>
            <div>
              <div>Status: {playerInjury.status}</div>
              <div>Type: {playerInjury.injury_type}</div>
              <div>Body Part: {playerInjury.body_part}</div>
              <div>Expected Return: {playerInjury.expected_return_date ? new Date(playerInjury.expected_return_date).toLocaleDateString() : 'Unknown'}</div>
            </div>
          </div>
        )}
        
        <h3>Recent Form</h3>
        {recentMatches && recentMatches.length > 0 ? (
          <div className="form-indicators">
            {recentMatches.slice(0, 10).map((match, index) => {
              const isWinner = match.winner_id === parseInt(id) || match.winner_name === player?.name
              return (
                <div 
                  key={index}
                  className={isWinner ? 'win-indicator' : 'loss-indicator'}
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
    )
  }

  // Render match result
  const renderMatchResult = (match) => {
    const isWinner = match.winner_id === parseInt(id) || match.winner_name === player?.name
    
    return (
      <div key={match.match_id} className="glass-card">
        <div>
          <span>{match.tournament_name}</span>
          <span>{new Date(match.date).toLocaleDateString()}</span>
        </div>
        
        <div>
          <div>
            <span>{match.player1_name}</span>
            <span>{match.player1_country}</span>
          </div>
          
          <div>
            <span>VS</span>
            <span>{isWinner ? 'WIN' : 'LOSS'}</span>
          </div>
          
          <div>
            <span>{match.player2_name}</span>
            <span>{match.player2_country}</span>
          </div>
        </div>
        
        <div>
          <div>Score: {match.score || 'N/A'}</div>
          <div>Round: {match.round || 'N/A'}</div>
          <div>Surface: {match.surface || 'N/A'}</div>
        </div>
      </div>
    )
  }

  // Render matches tab
  const renderMatches = () => {
    return (
      <div>
        <h3>Recent Matches</h3>
        {recentMatches && recentMatches.length > 0 ? (
          recentMatches.map(match => renderMatchResult(match))
        ) : (
          <div>
            <p>No match history available for this player.</p>
          </div>
        )}
      </div>
    )
  }

  // Render player statistics
  const renderPlayerStats = () => {
    if (!player || !recentMatches || recentMatches.length === 0) {
      return (
        <div>
          <p>No statistics available for this player.</p>
        </div>
      )
    }
    
    const winPercentage = calculateWinPercentage()
    const surfaceStats = calculateSurfaceStats()
    
    return (
      <div>
        <div className="stats-cards">
          <div className="neumorphic">
            <h3>Win Rate</h3>
            <div>{winPercentage}%</div>
            <p>Based on last {recentMatches.length} matches</p>
          </div>
          
          <div className="neumorphic">
            <h3>Matches</h3>
            <div>
              <div>
                <div>{recentMatches.filter(match => 
                  match.winner_id === parseInt(id) || match.winner_name === player?.name
                ).length}</div>
                <div>Wins</div>
              </div>
              <div>
                <div>{recentMatches.filter(match => 
                  match.winner_id !== parseInt(id) && match.winner_name !== player?.name
                ).length}</div>
                <div>Losses</div>
              </div>
            </div>
            <p>Total: {recentMatches.length} matches</p>
          </div>
        </div>
        
        <h3>Performance by Surface</h3>
        <div className="surface-stats">
          {Object.entries(surfaceStats).map(([surface, stats]) => (
            <div key={surface} className="glass-card">
              <h4>{surface}</h4>
              <div>
                <div style={{ width: `${stats.winPercentage}%` }}></div>
                <span>{stats.winPercentage}%</span>
              </div>
              <div>{stats.wins} wins, {stats.losses} losses</div>
            </div>
          ))}
        </div>
        
        {playerStats && (
          <>
            <h3>Advanced Statistics</h3>
            <div className="advanced-stats">
              <div className="glass-card">
                <h4>Serve Statistics</h4>
                <div>
                  <div>Aces per Match: {playerStats.serve_stats?.aces_per_match || 'N/A'}</div>
                  <div>First Serve %: {playerStats.serve_stats?.first_serve_percentage || 'N/A'}%</div>
                  <div>Service Games Won %: {playerStats.serve_stats?.service_games_won_percentage || 'N/A'}%</div>
                </div>
              </div>
              
              <div className="glass-card">
                <h4>Return Statistics</h4>
                <div>
                  <div>Break Points Converted %: {playerStats.return_stats?.break_points_converted_percentage || 'N/A'}%</div>
                  <div>Return Games Won %: {playerStats.return_stats?.return_games_won_percentage || 'N/A'}%</div>
                </div>
              </div>
              
              <div className="glass-card">
                <h4>Overall Performance</h4>
                <div>
                  <div>Win Percentage: {playerStats.overall_stats?.win_percentage || 'N/A'}%</div>
                  <div>Matches Played: {playerStats.matches_played || 'N/A'}</div>
                  <div>Matches Won: {playerStats.matches_won || 'N/A'}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Render player form
  const renderPlayerForm = () => {
    if (!playerForm) {
      return (
        <div>
          <p>No form data available for this player.</p>
        </div>
      )
    }
    
    return (
      <div>
        <div className="form-cards">
          <div className="neumorphic">
            <h3>Current Form</h3>
            <div>{playerForm.form_rating}</div>
            <p>Form Rating (1-10)</p>
          </div>
          
          <div className="neumorphic">
            <h3>Current Streak</h3>
            <div>{playerForm.current_streak?.count || 0}</div>
            <p>{playerForm.current_streak?.type || 'No'} Streak</p>
          </div>
          
          <div className="neumorphic">
            <h3>Recent Performance</h3>
            <div>
              <div>
                <div>{playerForm.recent_performance?.wins || 0}</div>
                <div>Wins</div>
              </div>
              <div>
                <div>{playerForm.recent_performance?.losses || 0}</div>
                <div>Losses</div>
              </div>
            </div>
            <p>Win Rate: {playerForm.recent_performance?.win_percentage?.toFixed(1) || 0}%</p>
          </div>
        </div>
        
        <h3>Last 10 Matches</h3>
        {playerForm.last_10_matches && playerForm.last_10_matches.length > 0 ? (
          <div className="form-indicators">
            {playerForm.last_10_matches.map((match, index) => (
              <div 
                key={index}
                className={match.result === 'Win' ? 'win-indicator' : 'loss-indicator'}
                title={`${match.tournament_name}: ${match.result} against ${match.opponent_name}`}
              >
                {match.result === 'Win' ? 'W' : 'L'}
              </div>
            ))}
          </div>
        ) : (
          <p>No recent match data available.</p>
        )}
        
        <h3>Surface Form</h3>
        <div className="surface-stats">
          {playerForm.surface_form && Object.entries(playerForm.surface_form).map(([surface, stats]) => (
            <div key={surface} className="glass-card">
              <h4>{surface}</h4>
              <div>
                <div style={{ width: `${stats.win_percentage}%` }}></div>
                <span>{stats.win_percentage}%</span>
              </div>
              <div>{stats.wins} wins, {stats.losses} losses</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="modern-card text-center">
        <div className="modern-spinner"></div>
        <h2>Loading player profile...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="modern-card text-center">
        <div className="error-message">{error}</div>
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
        <h2>Player not found</h2>
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
      <div>
        <button 
          className="btn-outline btn-sm"
          onClick={() => navigate('/rankings')}
        >
          Back to Rankings
        </button>
      </div>
      
      {/* Player Header */}
      <div className="player-header">
        <div className="player-avatar">{playerData.name.charAt(0)}</div>
        
        <div className="player-info">
          <h1>{playerData.name}</h1>
          
          <div className="player-meta">
            <div>{playerData.country}</div>
            <div className="modern-badge">Rank: {playerData.ranking}</div>
            <div className="modern-badge">Points: {playerData.points}</div>
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
        <div 
          className={`modern-tab ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          Form
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'matches' && renderMatches()}
        {activeTab === 'stats' && renderPlayerStats()}
        {activeTab === 'form' && renderPlayerForm()}
      </div>
    </div>
  )
}

export default PlayerProfile
