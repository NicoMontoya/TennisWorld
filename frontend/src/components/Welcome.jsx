import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'

const Welcome = ({ user }) => {
  const navigate = useNavigate()
  const [featuredTournament, setFeaturedTournament] = useState(null)
  const [topPlayers, setTopPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch a featured tournament
        const tournamentsResponse = await axios.get('http://localhost:5001/api/tennis/tournaments')
        if (tournamentsResponse.data && tournamentsResponse.data.data.tournaments) {
          // Find an ongoing tournament or the next upcoming one
          const tournaments = tournamentsResponse.data.data.tournaments
          const ongoingTournament = tournaments.find(t => t.status === 'In Progress')
          const upcomingTournaments = tournaments.filter(t => t.status === 'Upcoming')
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
          
          setFeaturedTournament(ongoingTournament || upcomingTournaments[0] || tournaments[0])
        }
        
        // Fetch top players
        const rankingsResponse = await axios.get('http://localhost:5001/api/tennis/rankings/ATP')
        if (rankingsResponse.data && rankingsResponse.data.data.rankings) {
          setTopPlayers(rankingsResponse.data.data.rankings.slice(0, 3))
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const handleLogout = () => {
    // In a real app, we would call a logout API
    // For now, we'll just redirect to the register page
    navigate('/')
    // Force a page reload to clear the user state
    window.location.reload()
  }

  return (
    <div className="modern-card fade-in" style={{ maxWidth: '1000px' }}>
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        position: 'relative',
        padding: '20px 0'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
          zIndex: 1
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v12"></path>
            <path d="M6 12h12"></path>
          </svg>
        </div>
        
        <h1 style={{ 
          color: 'var(--primary-color)', 
          fontSize: '36px', 
          fontWeight: 'bold',
          marginTop: '40px',
          position: 'relative',
          display: 'inline-block'
        }}>
          Welcome to TennisWorld!
          <div style={{
            height: '4px',
            width: '60px',
            background: 'var(--secondary-color)',
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: 'var(--border-radius-full)'
          }}></div>
        </h1>
        
        <div style={{ 
          maxWidth: '600px', 
          margin: '30px auto 0',
          backgroundColor: 'rgba(46, 139, 87, 0.05)',
          padding: '20px',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid rgba(46, 139, 87, 0.1)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            marginBottom: '10px',
            color: 'var(--primary-dark)'
          }}>
            Hello, {user.username}!
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-light)' }}>
            Thank you for joining our tennis community. Here you'll be able to track tennis results, 
            explore player profiles, and stay updated with the latest tournaments.
          </p>
        </div>
      </div>
      
      {/* Feature Cards */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* Rankings Card */}
        <div className="glass-card hover-card" style={{
          padding: '30px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, var(--primary-light) 0%, transparent 70%)',
            opacity: '0.2',
            borderRadius: '0 var(--border-radius-lg) 0 100px'
          }}></div>
          
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
          </div>
          
          <h3 style={{ 
            color: 'var(--primary-color)', 
            marginBottom: '15px',
            fontSize: '22px',
            fontWeight: 'bold'
          }}>
            Player Rankings
          </h3>
          
          <p style={{ 
            marginBottom: '25px',
            color: 'var(--text-light)',
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            View the latest ATP and WTA rankings for the top tennis players in the world.
            Track your favorite players' progress throughout the season.
          </p>
          
          <Link to="/rankings" style={{ textDecoration: 'none' }}>
            <button className="btn btn-gradient" style={{ 
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              View Rankings
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </Link>
          
          {!loading && topPlayers.length > 0 && (
            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '10px' }}>
                Current Top 3:
              </h4>
              {topPlayers.map((player, index) => (
                <div 
                  key={player.player_id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '8px',
                    padding: '6px 10px',
                    backgroundColor: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                    borderRadius: 'var(--border-radius-sm)'
                  }}
                  onClick={() => navigate(`/player/${player.player_id}`)}
                  className="clickable-row"
                >
                  <span style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                    color: index === 0 ? '#000' : index === 1 ? '#000' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    marginRight: '10px'
                  }}>
                    {index + 1}
                  </span>
                  <span style={{ fontWeight: '500', flex: 1 }} className="clickable-text">
                    {player.player_name}
                  </span>
                  <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>
                    {player.points.toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Tournaments Card */}
        <div className="glass-card hover-card" style={{
          padding: '30px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, var(--secondary-light) 0%, transparent 70%)',
            opacity: '0.2',
            borderRadius: '0 var(--border-radius-lg) 0 100px'
          }}></div>
          
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--secondary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          
          <h3 style={{ 
            color: 'var(--secondary-color)', 
            marginBottom: '15px',
            fontSize: '22px',
            fontWeight: 'bold'
          }}>
            Tournaments
          </h3>
          
          <p style={{ 
            marginBottom: '25px',
            color: 'var(--text-light)',
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            Explore current and upcoming tennis tournaments from around the world.
            Get detailed information about draws, matches, and results.
          </p>
          
          <Link to="/tournaments" style={{ textDecoration: 'none' }}>
            <button className="btn" style={{ 
              width: '100%',
              backgroundColor: 'var(--secondary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              View Tournaments
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </Link>
          
          {!loading && featuredTournament && (
            <div style={{ 
              marginTop: '20px', 
              textAlign: 'left',
              backgroundColor: 'rgba(0,0,0,0.02)',
              padding: '15px',
              borderRadius: 'var(--border-radius-md)'
            }}>
              <h4 style={{ 
                fontSize: '14px', 
                color: 'var(--secondary-color)', 
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                Featured Tournament:
              </h4>
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/tournament/${featuredTournament.tournament_id}`)}
              >
                <h5 style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: 'var(--text-color)',
                  fontSize: '16px'
                }} className="clickable-text">
                  {featuredTournament.name}
                </h5>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  color: 'var(--text-light)',
                  marginBottom: '5px'
                }}>
                  <span>Location:</span>
                  <span>{featuredTournament.location}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  color: 'var(--text-light)',
                  marginBottom: '5px'
                }}>
                  <span>Dates:</span>
                  <span>
                    {new Date(featuredTournament.start_date).toLocaleDateString()} - {new Date(featuredTournament.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  color: 'var(--text-light)'
                }}>
                  <span>Surface:</span>
                  <span>{featuredTournament.surface}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Coming Soon Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
        padding: '30px', 
        borderRadius: 'var(--border-radius-lg)',
        marginBottom: '40px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>
        
        <h3 style={{ 
          marginBottom: '20px',
          fontSize: '24px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Coming Soon:
        </h3>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '20px', 
            borderRadius: 'var(--border-radius-md)',
            backdropFilter: 'blur(5px)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '10px',
              gap: '10px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
              <h4 style={{ fontWeight: 'bold', fontSize: '18px' }}>Live Match Tracking</h4>
            </div>
            <p style={{ fontSize: '14px', opacity: '0.9' }}>
              Follow matches in real-time with point-by-point updates, live statistics, and interactive visualizations.
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '20px', 
            borderRadius: 'var(--border-radius-md)',
            backdropFilter: 'blur(5px)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '10px',
              gap: '10px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <h4 style={{ fontWeight: 'bold', fontSize: '18px' }}>Match Predictions</h4>
            </div>
            <p style={{ fontSize: '14px', opacity: '0.9' }}>
              Participate in prediction contests and compete with other tennis fans to forecast match outcomes.
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '20px', 
            borderRadius: 'var(--border-radius-md)',
            backdropFilter: 'blur(5px)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '10px',
              gap: '10px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <h4 style={{ fontWeight: 'bold', fontSize: '18px' }}>Tennis News</h4>
            </div>
            <p style={{ fontSize: '14px', opacity: '0.9' }}>
              Stay updated with the latest tennis news, player interviews, and tournament highlights.
            </p>
          </div>
        </div>
      </div>
      
      {/* Logout Button */}
      <div className="text-center">
        <button 
          className="btn-outline"
          onClick={handleLogout}
          style={{ 
            width: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Welcome
