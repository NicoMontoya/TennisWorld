import { Routes, Route, Navigate } from 'react-router-dom'
import Register from './components/Register'
import Login from './components/Login'
import Welcome from './components/Welcome'
import Rankings from './components/Rankings'
import Tournaments from './components/Tournaments'
import TournamentDetails from './components/TournamentDetails'
import PlayerProfile from './components/PlayerProfile'
import UserProfile from './components/UserProfile'
import BracketBuilder from './components/BracketBuilder'
import BracketViewer from './components/BracketViewer'
import Navigation from './components/Navigation'
import { AuthProvider, useAuth } from './context/AuthContext'

function App() {
  const { user, isLoggedIn, loading } = useAuth()
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div className="modern-spinner"></div>
        <p>Loading application...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navigation />
      <div className="container">
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/welcome" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/welcome" /> : <Register />} 
          />
          <Route 
            path="/welcome" 
            element={user ? <Welcome /> : <Navigate to="/" />} 
          />
          <Route 
            path="/rankings" 
            element={<Rankings />} 
          />
          <Route 
            path="/tournaments" 
            element={<Tournaments />} 
          />
          <Route 
            path="/tournaments/:id" 
            element={<TournamentDetails />} 
          />
          <Route 
            path="/tournaments/:tournamentId/build" 
            element={isLoggedIn ? <BracketBuilder /> : <Navigate to="/" state={{ from: window.location.pathname }} />} 
          />
          <Route 
            path="/players/:id" 
            element={<PlayerProfile />} 
          />
          <Route 
            path="/profile" 
            element={isLoggedIn ? <UserProfile /> : <Navigate to="/" state={{ from: window.location.pathname }} />} 
          />
          <Route 
            path="/profile/edit" 
            element={isLoggedIn ? <UserProfile /> : <Navigate to="/" state={{ from: window.location.pathname }} />} 
          />
          <Route 
            path="/brackets/:id" 
            element={isLoggedIn ? <BracketViewer /> : <Navigate to="/" state={{ from: window.location.pathname }} />} 
          />
        </Routes>
      </div>
    </div>
  )
}

// Wrap the App component with the AuthProvider
function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}

export default AppWithAuth
