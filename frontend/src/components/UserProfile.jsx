import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [brackets, setBrackets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'brackets', 'settings'

  useEffect(() => {
    // Check for tab parameter in URL
    const queryParams = new URLSearchParams(window.location.search);
    const tabParam = queryParams.get('tab');
    if (tabParam && ['profile', 'brackets', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem('userToken');
        
        if (!token) {
          // Redirect to login if no token
          navigate('/login');
          return;
        }
        
        // Set up headers with token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Fetch user profile
        const userResponse = await axios.get('http://localhost:5001/api/users/profile', config);
        
        if (userResponse.data && userResponse.data.data) {
          setUser(userResponse.data.data.user);
          
          // Fetch user brackets
          const bracketsResponse = await axios.get('http://localhost:5001/api/users/brackets', config);
          
          if (bracketsResponse.data && bracketsResponse.data.data) {
            setBrackets(bracketsResponse.data.data.bracketsByTournament);
          }
          
          setError(null);
        } else {
          setError('Invalid user data received');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        
        if (err.response && err.response.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem('userToken');
          navigate('/login');
          return;
        }
        
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  // Render user profile information
  const renderProfileInfo = () => {
    if (!user) return null;
    
    return (
      <div className="glass-card">
        <h3 style={{ 
          color: 'var(--primary-color)', 
          borderBottom: '2px solid var(--secondary-color)',
          paddingBottom: '10px',
          marginBottom: '20px'
        }}>
          Profile Information
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>Username:</span>
            <span>{user.username}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>Name:</span>
            <span>{user.first_name} {user.last_name}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>Email:</span>
            <span>{user.email}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>Account Type:</span>
            <span className={
              user.account_type === 'Premium' 
                ? 'modern-badge modern-badge-primary' 
                : user.account_type === 'Admin' 
                  ? 'modern-badge modern-badge-secondary' 
                  : 'modern-badge modern-badge-gray'
            }>
              {user.account_type}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>Member Since:</span>
            <span>{new Date(user.registration_date).toLocaleDateString()}</span>
          </div>
          
          {user.prediction_stats && (
            <div style={{ 
              marginTop: '20px',
              padding: '15px',
              backgroundColor: 'rgba(46, 139, 87, 0.05)',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid rgba(46, 139, 87, 0.1)'
            }}>
              <h4 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>Prediction Statistics</h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {user.prediction_stats.total_predictions || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>Total Predictions</div>
                </div>
                
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success-color)' }}>
                    {user.prediction_stats.correct_predictions || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>Correct</div>
                </div>
                
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {user.prediction_stats.accuracy_percentage || 0}%
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>Accuracy</div>
                </div>
                
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                    {user.prediction_stats.points || 0}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>Points</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render user preferences
  const renderPreferences = () => {
    if (!user || !user.preferences) return null;
    
    const { preferences } = user;
    
    return (
      <div className="glass-card">
        <h3 style={{ 
          color: 'var(--primary-color)', 
          borderBottom: '2px solid var(--secondary-color)',
          paddingBottom: '10px',
          marginBottom: '20px'
        }}>
          Preferences
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {preferences.favorite_players && preferences.favorite_players.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '10px' }}>Favorite Players</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {preferences.favorite_players.map(playerId => (
                  <div 
                    key={playerId}
                    className="modern-badge modern-badge-primary"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/players/${playerId}`)}
                  >
                    Player {playerId}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {preferences.favorite_tournaments && preferences.favorite_tournaments.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '10px' }}>Favorite Tournaments</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {preferences.favorite_tournaments.map(tournamentId => (
                  <div 
                    key={tournamentId}
                    className="modern-badge modern-badge-secondary"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/tournaments/${tournamentId}`)}
                  >
                    Tournament {tournamentId}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {preferences.preferred_surfaces && preferences.preferred_surfaces.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '10px' }}>Preferred Surfaces</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {preferences.preferred_surfaces.map(surface => (
                  <div 
                    key={surface}
                    className="modern-badge modern-badge-gray"
                  >
                    {surface}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {preferences.display_settings && (
            <div>
              <h4 style={{ marginBottom: '10px' }}>Display Settings</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Dark Mode:</span>
                  <span>{preferences.display_settings.dark_mode ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Stats Display:</span>
                  <span>{preferences.display_settings.stats_display_preference}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Default Ranking Type:</span>
                  <span>{preferences.display_settings.default_ranking_type}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render user brackets
  const renderBrackets = () => {
    if (!brackets || Object.keys(brackets).length === 0) {
      return (
        <div className="glass-card" style={{ textAlign: 'center', padding: '30px' }}>
          <p>You haven't created any brackets yet.</p>
          <button 
            className="btn"
            onClick={() => navigate('/tournaments')}
            style={{ marginTop: '20px' }}
          >
            Browse Tournaments
          </button>
        </div>
      );
    }
    
    return (
      <div>
        <h3 style={{ 
          color: 'var(--primary-color)', 
          borderBottom: '2px solid var(--secondary-color)',
          paddingBottom: '10px',
          marginBottom: '20px'
        }}>
          Your Tournament Brackets
        </h3>
        
        {Object.entries(brackets).map(([tournamentId, tournamentData]) => (
          <div key={tournamentId} className="glass-card" style={{ marginBottom: '20px' }}>
            <h4 style={{ 
              color: 'var(--primary-color)', 
              marginBottom: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{tournamentData.tournament.name}</span>
              <button 
                className="btn-outline btn-sm"
                onClick={() => navigate(`/tournaments/${tournamentId}`)}
              >
                View Tournament
              </button>
            </h4>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '15px'
            }}>
              {tournamentData.brackets.map(bracket => (
                <div 
                  key={bracket.bracket_id}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/brackets/${bracket.bracket_id}`)}
                  className="hover-card"
                >
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{bracket.name}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                      Created: {new Date(bracket.created_at).toLocaleDateString()}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: '10px',
                      marginTop: '10px'
                    }}>
                      <span className={
                        bracket.status === 'completed' 
                          ? 'modern-badge modern-badge-success' 
                          : bracket.status === 'locked' 
                            ? 'modern-badge modern-badge-secondary' 
                            : 'modern-badge modern-badge-gray'
                      } style={{ fontSize: '12px' }}>
                        {bracket.status.charAt(0).toUpperCase() + bracket.status.slice(1)}
                      </span>
                      
                      {bracket.is_public && (
                        <span className="modern-badge modern-badge-primary" style={{ fontSize: '12px' }}>
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                      {bracket.score}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                      Points
                    </div>
                    {bracket.stats && (
                      <div style={{ fontSize: '14px', marginTop: '5px' }}>
                        {bracket.stats.correct_picks} / {bracket.stats.total_picks} correct
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button 
                className="btn-gradient"
                onClick={() => navigate(`/tournaments/${tournamentId}/build`)}
              >
                Create New Bracket
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render account settings
  const renderSettings = () => {
    return (
      <div className="glass-card">
        <h3 style={{ 
          color: 'var(--primary-color)', 
          borderBottom: '2px solid var(--secondary-color)',
          paddingBottom: '10px',
          marginBottom: '20px'
        }}>
          Account Settings
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4 style={{ marginBottom: '10px' }}>Update Profile</h4>
            <button 
              className="btn-outline"
              onClick={() => navigate('/profile/edit')}
              style={{ width: '100%' }}
            >
              Edit Profile
            </button>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '10px' }}>Change Password</h4>
            <button 
              className="btn-outline"
              onClick={() => navigate('/profile/password')}
              style={{ width: '100%' }}
            >
              Change Password
            </button>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '10px' }}>Notification Settings</h4>
            <button 
              className="btn-outline"
              onClick={() => navigate('/profile/notifications')}
              style={{ width: '100%' }}
            >
              Manage Notifications
            </button>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <button 
              className="btn"
              onClick={handleLogout}
              style={{ 
                width: '100%',
                backgroundColor: 'var(--error-color)'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="modern-card text-center">
        <div className="modern-spinner"></div>
        <h2>Loading profile...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-card text-center">
        <div className="error-message">{error}</div>
        <button 
          className="btn"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="modern-card fade-in">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
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
            {user ? `${user.first_name}'s Profile` : 'User Profile'}
          </h1>
          <p style={{ color: 'var(--text-light)' }}>
            Manage your profile, brackets, and settings
          </p>
        </div>
        
        <div>
          <button 
            className="btn-outline btn-sm"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="modern-tabs">
        <div 
          className={`modern-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </div>
        <div 
          className={`modern-tab ${activeTab === 'brackets' ? 'active' : ''}`}
          onClick={() => setActiveTab('brackets')}
        >
          My Brackets
        </div>
        <div 
          className={`modern-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </div>
      </div>
      
      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {renderProfileInfo()}
            {renderPreferences()}
          </div>
        )}
        
        {activeTab === 'brackets' && renderBrackets()}
        
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default UserProfile;
