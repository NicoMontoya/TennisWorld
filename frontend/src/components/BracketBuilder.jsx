import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BracketBuilder = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [tournamentDraw, setTournamentDraw] = useState(null);
  const [userBracket, setUserBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bracketName, setBracketName] = useState('My Tournament Bracket');
  const [isPublic, setIsPublic] = useState(true);
  const [notes, setNotes] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [champion, setChampion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const fetchTournamentData = async () => {
      setLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem('userToken');
        
        if (!token) {
          // Redirect to login if no token
          navigate('/login', { state: { from: `/tournaments/${tournamentId}/build` } });
          return;
        }
        
        // Set up headers with token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Fetch tournament details
        const tournamentResponse = await axios.get(`http://localhost:5001/api/tennis/tournaments/${tournamentId}/details`);
        
        if (tournamentResponse.data && tournamentResponse.data.data) {
          setTournament(tournamentResponse.data.data.tournament);
          
          // Get tournament draw
          const drawResponse = await axios.get(`http://localhost:5001/api/tennis/tournaments/${tournamentId}/draw`);
          
          if (drawResponse.data && drawResponse.data.data && drawResponse.data.data.draw) {
            setTournamentDraw(drawResponse.data.data.draw);
            
            // Initialize predictions based on the draw
            const initialPredictions = [];
            const matches = tournamentResponse.data.data.matches || [];
            
            matches.forEach(match => {
              initialPredictions.push({
                match_position: match.match_position || initialPredictions.length + 1,
                round: match.round || 1,
                match_id: match.match_id,
                predicted_winner_id: null,
                predicted_winner_name: null,
                predicted_score: null
              });
            });
            
            setPredictions(initialPredictions);
          }
          
          // Check if user already has brackets for this tournament
          const userBracketsResponse = await axios.get('http://localhost:5001/api/users/brackets', config);
          
          if (userBracketsResponse.data && userBracketsResponse.data.data) {
            const { bracketsByTournament } = userBracketsResponse.data.data;
            
            if (bracketsByTournament[tournamentId]) {
              // User already has brackets for this tournament
              // We could load one of them for editing, but for now we'll just create a new one
              setBracketName(`${tournament.name} Bracket ${bracketsByTournament[tournamentId].brackets.length + 1}`);
            }
          }
          
          setError(null);
        } else {
          setError('Invalid tournament data received');
        }
      } catch (err) {
        console.error('Error fetching tournament data:', err);
        
        if (err.response && err.response.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem('userToken');
          navigate('/login', { state: { from: `/tournaments/${tournamentId}/build` } });
          return;
        }
        
        setError('Failed to load tournament data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, [tournamentId, navigate]);

  // Handle prediction change
  const handlePredictionChange = (matchPosition, winnerId, winnerName) => {
    // Update the prediction for this match
    const updatedPredictions = predictions.map(prediction => {
      if (prediction.match_position === matchPosition) {
        return {
          ...prediction,
          predicted_winner_id: winnerId,
          predicted_winner_name: winnerName
        };
      }
      return prediction;
    });
    
    setPredictions(updatedPredictions);
    
    // If this is the final match, also update the champion
    const finalMatch = updatedPredictions.find(p => p.round === 1);
    if (finalMatch && finalMatch.match_position === matchPosition) {
      setChampion({
        player_id: winnerId,
        player_name: winnerName
      });
    }
  };

  // Handle score prediction change
  const handleScorePredictionChange = (matchPosition, score) => {
    const updatedPredictions = predictions.map(prediction => {
      if (prediction.match_position === matchPosition) {
        return {
          ...prediction,
          predicted_score: score
        };
      }
      return prediction;
    });
    
    setPredictions(updatedPredictions);
  };

  // Save bracket
  const saveBracket = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        navigate('/login', { state: { from: `/tournaments/${tournamentId}/build` } });
        return;
      }
      
      // Set up headers with token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Prepare bracket data
      const bracketData = {
        tournament_id: tournamentId,
        name: bracketName,
        is_public: isPublic,
        notes,
        bracket_data: {
          predictions,
          champion
        },
        status: 'draft'
      };
      
      // Create the bracket
      const response = await axios.post('http://localhost:5001/api/users/brackets', bracketData, config);
      
      if (response.data && response.data.data) {
        setUserBracket(response.data.data.bracket);
        setSaveSuccess(true);
        
        // Redirect to the bracket view after a short delay
        setTimeout(() => {
          navigate(`/brackets/${response.data.data.bracket.bracket_id}`);
        }, 2000);
      } else {
        setSaveError('Failed to save bracket. Please try again.');
      }
    } catch (err) {
      console.error('Error saving bracket:', err);
      setSaveError('Error saving bracket: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  // Render match card for prediction
  const renderMatchCard = (match, round) => {
    // Find the prediction for this match
    const prediction = predictions.find(p => p.match_position === match.match_position);
    
    // Determine if a winner has been predicted
    const hasWinner = prediction && prediction.predicted_winner_id;
    const player1IsWinner = hasWinner && prediction.predicted_winner_id === match.player1_id;
    const player2IsWinner = hasWinner && prediction.predicted_winner_id === match.player2_id;
    
    return (
      <div 
        key={match.match_position}
        style={{
          border: '1px solid #ddd',
          borderRadius: 'var(--border-radius-md)',
          padding: '15px',
          marginBottom: '15px',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          transition: 'all var(--transition-medium)'
        }}
      >
        <div style={{ marginBottom: '10px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
          {round === 1 ? 'Final' : 
           round === 2 ? 'Semi-final' : 
           round === 3 ? 'Quarter-final' : 
           round === 4 ? 'Round of 16' : 
           round === 5 ? 'Round of 32' : 
           round === 6 ? 'Round of 64' : 
           round === 7 ? 'Round of 128' : 
           `Round ${round}`}
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '10px',
          padding: '8px',
          borderRadius: 'var(--border-radius-sm)',
          backgroundColor: player1IsWinner ? 'rgba(67, 160, 71, 0.1)' : 'transparent',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)'
        }}
        onClick={() => handlePredictionChange(match.match_position, match.player1_id, match.player1_name)}
        >
          <div style={{ 
            fontWeight: player1IsWinner ? 'bold' : 'normal',
            color: player1IsWinner ? 'var(--success-color)' : 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {player1IsWinner && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
            <span>{match.player1_name}</span>
            {match.player1_seed && (
              <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>[{match.player1_seed}]</span>
            )}
          </div>
          
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: player1IsWinner ? '2px solid var(--success-color)' : '2px solid #ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {player1IsWinner && (
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-color)'
              }}></div>
            )}
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px',
          borderRadius: 'var(--border-radius-sm)',
          backgroundColor: player2IsWinner ? 'rgba(67, 160, 71, 0.1)' : 'transparent',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)'
        }}
        onClick={() => handlePredictionChange(match.match_position, match.player2_id, match.player2_name)}
        >
          <div style={{ 
            fontWeight: player2IsWinner ? 'bold' : 'normal',
            color: player2IsWinner ? 'var(--success-color)' : 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {player2IsWinner && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
            <span>{match.player2_name}</span>
            {match.player2_seed && (
              <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>[{match.player2_seed}]</span>
            )}
          </div>
          
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: player2IsWinner ? '2px solid var(--success-color)' : '2px solid #ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {player2IsWinner && (
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-color)'
              }}></div>
            )}
          </div>
        </div>
        
        {hasWinner && (
          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-light)' }}>
              Predicted Score:
            </label>
            <select 
              value={prediction.predicted_score || ''}
              onChange={(e) => handleScorePredictionChange(match.match_position, e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              <option value="">Select a score</option>
              <option value="2-0">2-0</option>
              <option value="2-1">2-1</option>
              <option value="3-0">3-0</option>
              <option value="3-1">3-1</option>
              <option value="3-2">3-2</option>
            </select>
          </div>
        )}
      </div>
    );
  };

  // Group matches by round
  const getMatchesByRound = () => {
    if (!tournamentDraw || !tournamentDraw.matches) return {};
    
    const matchesByRound = {};
    
    tournamentDraw.matches.forEach(match => {
      const round = match.round || 1;
      if (!matchesByRound[round]) {
        matchesByRound[round] = [];
      }
      matchesByRound[round].push(match);
    });
    
    return matchesByRound;
  };

  if (loading) {
    return (
      <div className="modern-card text-center">
        <div className="modern-spinner"></div>
        <h2>Loading tournament data...</h2>
      </div>
    );
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
          marginBottom: '24px' 
        }}>
          {error}
        </div>
        <button 
          className="btn"
          onClick={() => navigate(`/tournaments/${tournamentId}`)}
        >
          Back to Tournament
        </button>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="modern-card text-center">
        <h2>Tournament not found</h2>
        <button 
          className="btn"
          onClick={() => navigate('/tournaments')}
        >
          Back to Tournaments
        </button>
      </div>
    );
  }

  const matchesByRound = getMatchesByRound();
  const rounds = Object.keys(matchesByRound).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="modern-card fade-in">
      <div style={{ marginBottom: '24px' }}>
        <button 
          className="btn-outline btn-sm"
          onClick={() => navigate(`/tournaments/${tournamentId}`)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          Back to Tournament
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
            marginBottom: '16px'
          }}>
            Build Your Bracket: {tournament.name}
          </h1>
          <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
            Make your predictions for each match to create your tournament bracket.
          </p>
        </div>
      </div>
      
      {/* Bracket settings */}
      <div className="glass-card" style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          color: 'var(--primary-color)', 
          borderBottom: '2px solid var(--secondary-color)',
          paddingBottom: '10px',
          marginBottom: '20px'
        }}>
          Bracket Settings
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Bracket Name:
            </label>
            <input 
              type="text"
              value={bracketName}
              onChange={(e) => setBracketName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
              placeholder="Enter a name for your bracket"
            />
          </div>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Make this bracket public (visible to other users)</span>
            </label>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Notes (optional):
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid #ddd',
                fontSize: '16px',
                minHeight: '100px',
                resize: 'vertical'
              }}
              placeholder="Add any notes or comments about your bracket"
            />
          </div>
        </div>
      </div>
      
      {/* Bracket builder */}
      <div className="glass-card">
        <h3 style={{ 
          color: 'var(--primary-color)', 
          borderBottom: '2px solid var(--secondary-color)',
          paddingBottom: '10px',
          marginBottom: '20px'
        }}>
          Make Your Predictions
        </h3>
        
        {rounds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <p>No matches available for this tournament.</p>
          </div>
        ) : (
          <div>
            {/* Instructions */}
            <div style={{ 
              backgroundColor: 'rgba(46, 139, 87, 0.05)', 
              border: '1px solid rgba(46, 139, 87, 0.1)', 
              borderRadius: 'var(--border-radius-md)', 
              padding: '15px', 
              marginBottom: '20px' 
            }}>
              <p style={{ marginBottom: '10px' }}>
                <strong>How to build your bracket:</strong>
              </p>
              <ol style={{ paddingLeft: '20px' }}>
                <li style={{ marginBottom: '5px' }}>Click on the player you predict will win each match</li>
                <li style={{ marginBottom: '5px' }}>Optionally select a predicted score for each match</li>
                <li style={{ marginBottom: '5px' }}>Complete all matches to finalize your bracket</li>
                <li>Click "Save Bracket" when you're done</li>
              </ol>
            </div>
            
            {/* Render matches by round */}
            {rounds.map(round => (
              <div key={round} style={{ marginBottom: '30px' }}>
                <h4 style={{ 
                  color: 'var(--primary-color)', 
                  marginBottom: '15px' 
                }}>
                  {round === '1' ? 'Final' : 
                   round === '2' ? 'Semi-finals' : 
                   round === '3' ? 'Quarter-finals' : 
                   round === '4' ? 'Round of 16' : 
                   round === '5' ? 'Round of 32' : 
                   round === '6' ? 'Round of 64' : 
                   round === '7' ? 'Round of 128' : 
                   `Round ${round}`}
                </h4>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: '20px' 
                }}>
                  {matchesByRound[round].map(match => renderMatchCard(match, parseInt(round)))}
                </div>
              </div>
            ))}
            
            {/* Champion prediction */}
            {champion && (
              <div style={{ 
                backgroundColor: 'rgba(204, 85, 0, 0.05)', 
                border: '1px solid rgba(204, 85, 0, 0.1)', 
                borderRadius: 'var(--border-radius-md)', 
                padding: '20px', 
                marginTop: '30px',
                textAlign: 'center'
              }}>
                <h4 style={{ 
                  color: 'var(--secondary-color)', 
                  marginBottom: '15px' 
                }}>
                  Your Champion Prediction
                </h4>
                
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: 'var(--secondary-color)'
                }}>
                  {champion.player_name}
                </div>
              </div>
            )}
            
            {/* Save button */}
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <button 
                className="btn-gradient btn-lg"
                onClick={saveBracket}
                disabled={isSaving || !champion}
                style={{ 
                  minWidth: '200px',
                  opacity: !champion ? 0.7 : 1
                }}
              >
                {isSaving ? 'Saving...' : 'Save Bracket'}
              </button>
              
              {!champion && (
                <p style={{ color: 'var(--text-light)', marginTop: '10px' }}>
                  Complete all predictions to save your bracket
                </p>
              )}
              
              {saveSuccess && (
                <div style={{ 
                  backgroundColor: 'rgba(67, 160, 71, 0.1)', 
                  border: '1px solid rgba(67, 160, 71, 0.3)', 
                  color: 'var(--success-color)', 
                  padding: '16px', 
                  borderRadius: 'var(--border-radius-md)', 
                  marginTop: '20px' 
                }}>
                  Bracket saved successfully! Redirecting...
                </div>
              )}
              
              {saveError && (
                <div style={{ 
                  backgroundColor: 'rgba(229, 57, 53, 0.1)', 
                  border: '1px solid rgba(229, 57, 53, 0.3)', 
                  color: 'var(--error-color)', 
                  padding: '16px', 
                  borderRadius: 'var(--border-radius-md)', 
                  marginTop: '20px' 
                }}>
                  {saveError}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BracketBuilder;
