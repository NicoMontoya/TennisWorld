import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BracketViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bracket, setBracket] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchBracketData = async () => {
      setLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem('userToken');
        
        if (!token) {
          // Redirect to login if no token
          navigate('/login', { state: { from: `/brackets/${id}` } });
          return;
        }
        
        // Set up headers with token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Fetch bracket details
        const response = await axios.get(`http://localhost:5001/api/users/brackets/${id}`, config);
        
        if (response.data && response.data.data) {
          setBracket(response.data.data.bracket);
          setTournament(response.data.data.tournament);
          
          // Check if the current user is the owner of this bracket
          const userResponse = await axios.get('http://localhost:5001/api/users/profile', config);
          
          if (userResponse.data && userResponse.data.data && userResponse.data.data.user) {
            setIsOwner(userResponse.data.data.user.user_id === response.data.data.bracket.user_id);
          }
          
          setError(null);
        } else {
          setError('Invalid bracket data received');
        }
      } catch (err) {
        console.error('Error fetching bracket data:', err);
        
        if (err.response && err.response.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem('userToken');
          navigate('/login', { state: { from: `/brackets/${id}` } });
          return;
        } else if (err.response && err.response.status === 404) {
          setError('Bracket not found');
        } else {
          setError('Failed to load bracket data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBracketData();
  }, [id, navigate]);

  // Handle edit bracket
  const handleEditBracket = () => {
    navigate(`/tournaments/${tournament.tournament_id}/build?bracket=${id}`);
  };

  // Render match prediction
  const renderMatchPrediction = (prediction) => {
    return (
      <div 
        key={prediction.match_position}
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {prediction.round === 1 ? 'Final' : 
             prediction.round === 2 ? 'Semi-final' : 
             prediction.round === 3 ? 'Quarter-final' : 
             prediction.round === 4 ? 'Round of 16' : 
             prediction.round === 5 ? 'Round of 32' : 
             prediction.round === 6 ? 'Round of 64' : 
             prediction.round === 7 ? 'Round of 128' : 
             `Round ${prediction.round}`}
          </div>
          
          {prediction.is_correct !== undefined && (
            <div style={{ 
              backgroundColor: prediction.is_correct ? 'rgba(67, 160, 71, 0.1)' : 'rgba(229, 57, 53, 0.1)', 
              color: prediction.is_correct ? 'var(--success-color)' : 'var(--error-color)', 
              padding: '4px 8px', 
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {prediction.is_correct ? 'CORRECT' : 'INCORRECT'}
            </div>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '10px',
          backgroundColor: 'rgba(46, 139, 87, 0.05)',
          borderRadius: 'var(--border-radius-sm)',
          marginBottom: '10px'
        }}>
          <div style={{ 
            fontWeight: 'bold',
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Your Prediction: {prediction.predicted_winner_name}</span>
          </div>
          
          {prediction.predicted_score && (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '4px 8px', 
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '14px',
              border: '1px solid #eee'
            }}>
              Score: {prediction.predicted_score}
            </div>
          )}
        </div>
        
        {prediction.actual_winner_name && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            borderRadius: 'var(--border-radius-sm)'
          }}>
            <div style={{ 
              fontWeight: prediction.is_correct ? 'bold' : 'normal',
              color: prediction.is_correct ? 'var(--success-color)' : 'var(--text-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {prediction.is_correct && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
              <span>Actual Result: {prediction.actual_winner_name}</span>
            </div>
            
            {prediction.actual_score && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '4px 8px', 
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '14px',
                border: '1px solid #eee'
              }}>
                Score: {prediction.actual_score}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="modern-card text-center">
        <div className="modern-spinner"></div>
        <h2>Loading bracket...</h2>
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
          onClick={() => navigate('/profile')}
        >
          Back to Profile
        </button>
      </div>
    );
  }

  if (!bracket || !tournament) {
    return (
      <div className="modern-card text-center">
        <h2>Bracket not found</h2>
        <button 
          className="btn"
          onClick={() => navigate('/profile')}
        >
          Back to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="modern-card fade-in">
      <div style={{ marginBottom: '24px' }}>
        <button 
          className="btn-outline btn-sm"
          onClick={() => navigate('/profile')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          Back to Profile
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
            marginBottom: '10px'
          }}>
            {bracket.name}
          </h1>
          <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
            Tournament: {tournament.name}
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            <div className="modern-badge modern-badge-primary">
              {tournament.surface}
            </div>
            <div className="modern-badge modern-badge-secondary">
              {tournament.category}
            </div>
            <div className={`modern-badge ${bracket.status === 'draft' ? 'modern-badge-gray' : bracket.status === 'locked' ? 'modern-badge-secondary' : 'modern-badge-success'}`}>
              {bracket.status.charAt(0).toUpperCase() + bracket.status.slice(1)}
            </div>
            {bracket.is_public && (
              <div className="modern-badge modern-badge-primary">
                Public
              </div>
            )}
          </div>
        </div>
        
        <div>
          {isOwner && bracket.status === 'draft' && (
            <button 
              className="btn-gradient"
              onClick={handleEditBracket}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Edit Bracket
            </button>
          )}
        </div>
      </div>
      
      {/* Bracket stats */}
      {bracket.stats && (
        <div className="glass-card" style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            color: 'var(--primary-color)', 
            borderBottom: '2px solid var(--secondary-color)',
            paddingBottom: '10px',
            marginBottom: '20px'
          }}>
            Bracket Performance
          </h3>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: 'var(--primary-color)',
                marginBottom: '5px'
              }}>
                {bracket.score || 0}
              </div>
              <div style={{ color: 'var(--text-light)' }}>
                Total Points
              </div>
            </div>
            
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: 'var(--success-color)',
                marginBottom: '5px'
              }}>
                {bracket.stats.correct_picks || 0}
              </div>
              <div style={{ color: 'var(--text-light)' }}>
                Correct Picks
              </div>
            </div>
            
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: 'var(--secondary-color)',
                marginBottom: '5px'
              }}>
                {bracket.stats.total_picks ? Math.round((bracket.stats.correct_picks / bracket.stats.total_picks) * 100) : 0}%
              </div>
              <div style={{ color: 'var(--text-light)' }}>
                Accuracy
              </div>
            </div>
            
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: 'var(--info-color)',
                marginBottom: '5px'
              }}>
                #{bracket.stats.rank || '-'}
              </div>
              <div style={{ color: 'var(--text-light)' }}>
                Leaderboard Rank
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Champion prediction */}
      {bracket.bracket_data && bracket.bracket_data.champion && (
        <div className="glass-card" style={{ 
          marginBottom: '30px',
          textAlign: 'center',
          padding: '30px 20px',
          backgroundColor: 'rgba(204, 85, 0, 0.05)'
        }}>
          <h3 style={{ 
            color: 'var(--secondary-color)', 
            marginBottom: '15px'
          }}>
            Champion Prediction
          </h3>
          
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold',
            color: 'var(--secondary-color)',
            marginBottom: '10px'
          }}>
            {bracket.bracket_data.champion.player_name}
          </div>
          
          {bracket.bracket_data.champion.is_correct !== undefined && (
            <div style={{ 
              display: 'inline-block',
              backgroundColor: bracket.bracket_data.champion.is_correct ? 'rgba(67, 160, 71, 0.1)' : 'rgba(229, 57, 53, 0.1)', 
              color: bracket.bracket_data.champion.is_correct ? 'var(--success-color)' : 'var(--error-color)', 
              padding: '8px 16px', 
              borderRadius: 'var(--border-radius-md)',
              fontWeight: 'bold',
              marginTop: '10px'
            }}>
              {bracket.bracket_data.champion.is_correct ? 'CORRECT PREDICTION' : 'INCORRECT PREDICTION'}
            </div>
          )}
        </div>
      )}
      
      {/* Match predictions */}
      <div className="glass-card">
        <h3 style={{ 
          color: 'var(--primary-color)', 
          borderBottom: '2px solid var(--secondary-color)',
          paddingBottom: '10px',
          marginBottom: '20px'
        }}>
          Match Predictions
        </h3>
        
        {bracket.bracket_data && bracket.bracket_data.predictions && bracket.bracket_data.predictions.length > 0 ? (
          <div>
            {/* Group predictions by round */}
            {[...Array(7)].map((_, i) => {
              const round = i + 1;
              const roundPredictions = bracket.bracket_data.predictions.filter(p => p.round === round);
              
              if (roundPredictions.length === 0) return null;
              
              return (
                <div key={round} style={{ marginBottom: '30px' }}>
                  <h4 style={{ 
                    color: 'var(--primary-color)', 
                    marginBottom: '15px' 
                  }}>
                    {round === 1 ? 'Final' : 
                     round === 2 ? 'Semi-finals' : 
                     round === 3 ? 'Quarter-finals' : 
                     round === 4 ? 'Round of 16' : 
                     round === 5 ? 'Round of 32' : 
                     round === 6 ? 'Round of 64' : 
                     round === 7 ? 'Round of 128' : 
                     `Round ${round}`}
                  </h4>
                  
                  {roundPredictions.map(prediction => renderMatchPrediction(prediction))}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <p>No match predictions available.</p>
          </div>
        )}
      </div>
      
      {/* Notes */}
      {bracket.notes && (
        <div className="glass-card" style={{ marginTop: '30px' }}>
          <h3 style={{ 
            color: 'var(--primary-color)', 
            borderBottom: '2px solid var(--secondary-color)',
            paddingBottom: '10px',
            marginBottom: '20px'
          }}>
            Notes
          </h3>
          
          <div style={{ 
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid #eee'
          }}>
            {bracket.notes}
          </div>
        </div>
      )}
    </div>
  );
};

export default BracketViewer;
