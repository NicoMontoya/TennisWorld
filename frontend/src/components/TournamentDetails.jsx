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

  // Render match card
  const renderMatchCard = (match) => {
    const isCompleted = match.event_status === 'Finished';
    const isLive = match.event_live === '1';
    const player1Winner = match.event_winner === 'First Player';
    const player2Winner = match.event_winner === 'Second Player';
    
    // Extract player names and seeds
    let player1Name = match.event_first_player;
    let player1Seed = match.first_player_seed;
    let player2Name = match.event_second_player;
    let player2Seed = match.second_player_seed;
    
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
            <span>{player1Name}</span>
            {player1Seed && (
              <span style={bracketStyles.seed}>[{player1Seed}]</span>
            )}
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
            <span>{player2Name}</span>
            {player2Seed && (
              <span style={bracketStyles.seed}>[{player2Seed}]</span>
            )}
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
              <div>Serve: {match.event_serve === 'First Player' ? player1Name : player2Name}</div>
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
    
    // Extract player names and seeds
    let player1Name = match.event_first_player;
    let player1Seed = match.first_player_seed;
    let player2Name = match.event_second_player;
    let player2Seed = match.second_player_seed;
    
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
              maxWidth: '150px',
              display: 'flex',
              alignItems: 'center'
            }}>
              {player1Winner && <span style={{ marginRight: '5px' }}>✓</span>}
              <span>{player1Name}</span>
              {player1Seed && (
                <span style={bracketStyles.seed}>[{player1Seed}]</span>
              )}
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
              maxWidth: '150px',
              display: 'flex',
              alignItems: 'center'
            }}>
              {player2Winner && <span style={{ marginRight: '5px' }}>✓</span>}
              <span>{player2Name}</span>
              {player2Seed && (
                <span style={bracketStyles.seed}>[{player2Seed}]</span>
              )}
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
    seed: {
      fontSize: '12px',
      color: '#666',
      marginLeft: '5px',
      fontWeight: 'normal'
    },
    roundTitle: {
      textAlign: 'center',
      color: 'var(--primary-color)',
      marginBottom: '15px'
    }
  };

  // Render a match box with player names, seeds, and scores
  const renderMatchBox = (match) => {
    const isLive = match.event_live === '1';
    const isCompleted = match.event_status === 'Finished';
    const player1Winner = match.event_winner === 'First Player';
    const player2Winner = match.event_winner === 'Second Player';
    
    // Extract player names and seeds
    let player1Name = match.event_first_player;
    let player1Seed = match.first_player_seed;
    let player2Name = match.event_second_player;
    let player2Seed = match.second_player_seed;
    
    return (
      <div style={{
        ...bracketStyles.matchBox,
        ...(isLive ? bracketStyles.liveMatch : {})
      }}>
        <div style={{
          ...bracketStyles.playerName,
          ...(player1Winner ? bracketStyles.winner : {})
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {player1Winner && <span style={{ marginRight: '5px' }}>✓</span>}
            <span>{player1Name}</span>
            {player1Seed && (
              <span style={bracketStyles.seed}>[{player1Seed}]</span>
            )}
          </div>
          <span style={bracketStyles.score}>
            {isCompleted || isLive ? (match.scores && match.scores[0] ? match.scores[0].score_first : '-') : ''}
          </span>
        </div>
        <div style={{
          ...bracketStyles.playerName,
          ...(player2Winner ? bracketStyles.winner : {})
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {player2Winner && <span style={{ marginRight: '5px' }}>✓</span>}
            <span>{player2Name}</span>
            {player2Seed && (
              <span style={bracketStyles.seed}>[{player2Seed}]</span>
            )}
          </div>
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
    
    // Sort fixtures within each round by seed
    Object.keys(fixturesByRound).forEach(round => {
      fixturesByRound[round] = sortFixturesBySeeding(fixturesByRound[round]);
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

  return (
    <div className="modern-card fade-in">
      <div style={{ marginBottom: '24px' }}>
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
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ 
            color: 'var(--primary-color)', 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            position: 'relative',
            display: 'inline-block'
          }}>
            {tournament.name}
            <div style={{
              height: '3px',
              width: '40px',
              background: 'var(--secondary-color)',
              position: 'absolute',
              bottom: '-8px',
              left: '0',
              borderRadius: 'var(--border-radius-full)'
            }}></div>
          </h1>
          <div style={{ marginTop: '20px' }}>
            <p style={{ 
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span style={{ fontWeight: '600' }}>Location:</span> {tournament.location}
            </p>
            <p style={{ 
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12h20"></path>
                <path d="M6 16l-4-4 4-4"></path>
                <path d="M18 8l4 4-4 4"></path>
              </svg>
              <span style={{ fontWeight: '600' }}>Surface:</span> {tournament.surface}
            </p>
            <p style={{ 
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span style={{ fontWeight: '600' }}>Dates:</span> {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
            </p>
            <p style={{ 
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                <path d="M18 12a2 2 0 0 0 0 4h2v-4h-2z"></path>
              </svg>
              <span style={{ fontWeight: '600' }}>Prize Money:</span> {tournament.prize_money}
            </p>
          </div>
        </div>
        
        <div className={
          tournament.status === 'Completed' 
            ? 'modern-badge modern-badge-gray' 
            : tournament.status === 'In Progress' 
              ? 'modern-badge modern-badge-success' 
              : 'modern-badge modern-badge-secondary'
        } style={{ fontSize: '14px', padding: '8px 16px' }}>
          {tournament.status}
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="modern-tabs">
        <div 
          className={`modern-tab ${activeTab === 'draw' ? 'active' : ''}`}
          onClick={() => setActiveTab('draw')}
        >
          Tournament Draw
        </div>
        <div 
          className={`modern-tab ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          Live Matches
          {liveMatchesCount > 0 && (
            <span className="modern-badge modern-badge-success" style={{ 
              width: '20px', 
              height: '20px', 
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>
              {liveMatchesCount}
            </span>
          )}
        </div>
        <div 
          className={`modern-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          Completed Matches
          {completedMatchesCount > 0 && (
            <span className="modern-badge modern-badge-gray" style={{ 
              width: '20px', 
              height: '20px', 
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
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
