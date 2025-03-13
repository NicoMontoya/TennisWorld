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
    const isCompleted = match.event_status === 'Finished';
    const isLive = match.event_live === '1';
    const player1Winner = match.event_winner === 'First Player';
    const player2Winner = match.event_winner === 'Second Player';
    
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

  // Render bracket match
  const renderBracketMatch = (match, roundIndex, matchIndex) => {
    const isCompleted = match.event_status === 'Finished';
    const isLive = match.event_live === '1';
    const player1Winner = match.event_winner === 'First Player';
    const player2Winner = match.event_winner === 'Second Player';
    
    return (
      <div 
        key={`${match.event_key}-${roundIndex}-${matchIndex}`} 
        className="bracket-match"
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '10px',
          margin: '5px 0',
          backgroundColor: isLive ? '#f8f9fa' : 'white',
          boxShadow: isLive ? '0 0 10px rgba(0,128,0,0.2)' : 'none',
          width: '220px',
          position: 'relative'
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between'
        }}>
          <div style={{ 
            padding: '5px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: player1Winner ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
            borderRadius: '4px 4px 0 0'
          }}>
            <div style={{ 
              fontWeight: 'bold',
              color: player1Winner ? 'var(--primary-color)' : 'inherit',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '150px'
            }}>
              {player1Winner && <span style={{ marginRight: '5px' }}>✓</span>}
              {match.event_first_player}
            </div>
            <div style={{ marginLeft: '5px' }}>
              {isCompleted || isLive ? (match.scores && match.scores[0] ? match.scores[0].score_first : '-') : ''}
            </div>
          </div>
          
          <div style={{ 
            padding: '5px',
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: player2Winner ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
            borderRadius: '0 0 4px 4px'
          }}>
            <div style={{ 
              fontWeight: 'bold',
              color: player2Winner ? 'var(--primary-color)' : 'inherit',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '150px'
            }}>
              {player2Winner && <span style={{ marginRight: '5px' }}>✓</span>}
              {match.event_second_player}
            </div>
            <div style={{ marginLeft: '5px' }}>
              {isCompleted || isLive ? (match.scores && match.scores[0] ? match.scores[0].score_second : '-') : ''}
            </div>
          </div>
        </div>
        
        {isLive && (
          <div style={{ 
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            backgroundColor: '#28a745', 
            color: 'white', 
            padding: '3px 8px', 
            borderRadius: '50%',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            LIVE
          </div>
        )}
      </div>
    )
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
    bracketColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '0 25px'
    },
    item: {
      display: 'flex',
      flexDirection: 'row-reverse'
    },
    itemParent: {
      position: 'relative',
      marginLeft: '50px',
      display: 'flex',
      alignItems: 'center'
    },
    itemParentAfter: {
      position: 'absolute',
      content: '',
      width: '25px',
      height: '2px',
      left: '0',
      top: '50%',
      backgroundColor: 'var(--primary-color)',
      transform: 'translateX(-100%)'
    },
    itemChildrens: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    itemChild: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      marginTop: '10px',
      marginBottom: '10px',
      position: 'relative'
    },
    itemChildBefore: {
      content: '',
      position: 'absolute',
      backgroundColor: 'var(--primary-color)',
      right: '0',
      top: '50%',
      transform: 'translateX(100%)',
      width: '25px',
      height: '2px'
    },
    itemChildAfter: {
      content: '',
      position: 'absolute',
      backgroundColor: 'var(--primary-color)',
      right: '-25px',
      height: 'calc(50% + 22px)',
      width: '2px',
      top: '50%'
    },
    itemChildLast: {
      transform: 'translateY(-100%)'
    },
    matchBox: {
      padding: '10px',
      margin: '0',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '4px',
      minWidth: '180px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    liveMatch: {
      borderLeft: '4px solid #28a745'
    },
    playerName: {
      margin: '5px 0',
      fontSize: '14px',
      fontWeight: 'normal',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    winner: {
      fontWeight: 'bold',
      color: 'var(--primary-color)'
    },
    score: {
      fontSize: '12px',
      color: '#666'
    },
    roundTitle: {
      textAlign: 'center',
      color: 'var(--primary-color)',
      marginBottom: '15px'
    }
  };

  // Render a match box with player names and scores
  const renderMatchBox = (match) => {
    const isLive = match.event_live === '1';
    const isCompleted = match.event_status === 'Finished';
    const player1Winner = match.event_winner === 'First Player';
    const player2Winner = match.event_winner === 'Second Player';
    
    return (
      <div style={{
        ...bracketStyles.matchBox,
        ...(isLive ? bracketStyles.liveMatch : {})
      }}>
        <div style={{
          ...bracketStyles.playerName,
          ...(player1Winner ? bracketStyles.winner : {})
        }}>
          <span>{player1Winner && "✓ "}{match.event_first_player}</span>
          <span style={bracketStyles.score}>
            {isCompleted || isLive ? (match.scores && match.scores[0] ? match.scores[0].score_first : '-') : ''}
          </span>
        </div>
        <div style={{
          ...bracketStyles.playerName,
          ...(player2Winner ? bracketStyles.winner : {})
        }}>
          <span>{player2Winner && "✓ "}{match.event_second_player}</span>
          <span style={bracketStyles.score}>
            {isCompleted || isLive ? (match.scores && match.scores[0] ? match.scores[0].score_second : '-') : ''}
          </span>
        </div>
      </div>
    );
  };

  // Recursive function to build the bracket structure
  const renderBracketItem = (match, round, roundIndex, matchIndex, rounds, fixturesByRound) => {
    // If this is the final round, just render the match
    if (roundIndex === rounds.length - 1) {
      return (
        <div style={bracketStyles.item}>
          <div style={bracketStyles.itemParent}>
            {renderMatchBox(match)}
            <div style={bracketStyles.itemParentAfter}></div>
          </div>
        </div>
      );
    }
    
    // Find the child matches that feed into this match
    const nextRoundIndex = roundIndex + 1;
    const nextRound = rounds[nextRoundIndex];
    const childMatches = fixturesByRound[nextRound];
    
    // Calculate which matches feed into this one
    const childStartIndex = matchIndex * 2;
    const childEndIndex = childStartIndex + 2;
    const matchChildren = childMatches.slice(childStartIndex, childEndIndex);
    
    return (
      <div style={bracketStyles.item}>
        <div style={bracketStyles.itemParent}>
          {renderMatchBox(match)}
          <div style={bracketStyles.itemParentAfter}></div>
        </div>
        <div style={bracketStyles.itemChildrens}>
          {matchChildren.map((childMatch, i) => (
            <div 
              key={`child-${nextRoundIndex}-${childStartIndex + i}`}
              style={bracketStyles.itemChild}
            >
              <div style={bracketStyles.itemChildBefore}></div>
              <div style={{
                ...bracketStyles.itemChildAfter,
                ...(i === matchChildren.length - 1 ? bracketStyles.itemChildLast : {})
              }}></div>
              {renderBracketItem(childMatch, nextRound, nextRoundIndex, childStartIndex + i, rounds, fixturesByRound)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render bracket view
  const renderBracketView = () => {
    if (!filteredFixtures || filteredFixtures.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <p>No matches available for this view.</p>
        </div>
      );
    }

    // Define round order for sorting
    const roundOrder = {
      'Final': 0,
      'Semi-final': 1,
      'Quarter-final': 2,
      'Round of 16': 3,
      'Round of 32': 4,
      'Round of 64': 5,
      'Round of 128': 6
    };

    // Group fixtures by round
    const fixturesByRound = {};
    filteredFixtures.forEach(fixture => {
      const round = fixture.tournament_round || 'Unknown Round';
      if (!fixturesByRound[round]) {
        fixturesByRound[round] = [];
      }
      fixturesByRound[round].push(fixture);
    });

    // Sort rounds in reverse order (final first, then semi-finals, etc.)
    const sortedRounds = Object.keys(fixturesByRound).sort((a, b) => {
      const orderA = roundOrder[a] !== undefined ? roundOrder[a] : -1;
      const orderB = roundOrder[b] !== undefined ? roundOrder[b] : -1;
      return orderA - orderB;
    });
    
    // Handle case where we don't have a complete bracket structure
    // This is more flexible and will work with different tournament formats
    const prepareAndValidateBracket = () => {
      // If we don't have any rounds, we can't render a bracket
      if (sortedRounds.length === 0) {
        return { isValid: false };
      }
      
      // Get the final round (first in the sorted array)
      const finalRound = sortedRounds[0];
      
      // If we don't have a final match, try to use the most advanced round available
      if (!fixturesByRound[finalRound] || fixturesByRound[finalRound].length === 0) {
        // Find the most advanced round that has matches
        for (const round of sortedRounds) {
          if (fixturesByRound[round] && fixturesByRound[round].length > 0) {
            return {
              isValid: true,
              finalRound: round,
              finalMatch: fixturesByRound[round][0]
            };
          }
        }
        return { isValid: false };
      }
      
      // Get the final match
      const finalMatch = fixturesByRound[finalRound][0];
      
      // For each round, ensure we have the expected number of matches
      let expectedMatches = 1; // Start with 1 for the final
      
      for (let i = 1; i < sortedRounds.length; i++) {
        const round = sortedRounds[i];
        expectedMatches *= 2;
        
        // If we don't have enough matches in this round, pad with empty matches
        if (fixturesByRound[round].length < expectedMatches) {
          const emptyMatchesNeeded = expectedMatches - fixturesByRound[round].length;
          
          for (let j = 0; j < emptyMatchesNeeded; j++) {
            fixturesByRound[round].push({
              event_key: `empty-${round}-${j}`,
              tournament_round: round,
              event_first_player: 'TBD',
              event_second_player: 'TBD',
              event_status: 'Scheduled',
              event_live: '0',
              event_winner: '',
              scores: []
            });
          }
        }
      }
      
      return {
        isValid: true,
        finalRound,
        finalMatch
      };
    };
    
    // Prepare and validate the bracket
    const bracketData = prepareAndValidateBracket();
    
    // If we couldn't create a valid bracket, show a message
    if (!bracketData.isValid) {
      return (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <p>Tournament bracket is not available or incomplete.</p>
        </div>
      );
    }
    
    // Get the final match and round from the validated data
    const { finalRound, finalMatch } = bracketData;
    
    return (
      <div style={bracketStyles.container}>
        {/* Round labels */}
        <div style={bracketStyles.roundLabels}>
          {/* Display rounds in reverse order: earliest rounds first, Final last */}
          {[...sortedRounds].reverse().map((round, index) => (
            <div key={`label-${round}`} style={bracketStyles.roundLabel}>
              {round}
            </div>
          ))}
        </div>
        
        {/* Bracket structure */}
        <div style={bracketStyles.wrapper}>
          {renderBracketItem(finalMatch, finalRound, 0, 0, sortedRounds, fixturesByRound)}
        </div>
      </div>
    );
  };

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
        {activeTab === 'draw' ? (
          // Bracket view for tournament draw
          renderBracketView()
        ) : (
          // List view for live and completed matches
          filteredFixtures.length === 0 ? (
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
          )
        )}
      </div>
    </div>
  )
}

export default TournamentDetails
