import { Routes, Route, Navigate } from 'react-router-dom'
import Register from './components/Register'
import Login from './components/Login'
import Welcome from './components/Welcome'
import Dashboard from './components/Dashboard'
import Rankings from './components/Rankings'
import Tournaments from './components/Tournaments'
import TournamentDetails from './components/TournamentDetails'
import PlayerProfile from './components/PlayerProfile'
import UserProfile from './components/UserProfile'
import BracketBuilder from './components/BracketBuilder'
import BracketViewer from './components/BracketViewer'
import Navigation from './components/Navigation'
import { AuthProvider, useAuth } from './context/AuthContext'

// Main App component that uses auth context
function AppContent() {
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
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/welcome" 
            element={user ? <Welcome /> : <Navigate to="/" replace />} 
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
            element={isLoggedIn ? <BracketBuilder /> : <Navigate to="/" replace state={{ from: window.location.pathname }} />} 
          />
          <Route 
            path="/players/:id" 
            element={<PlayerProfile />} 
          />
          <Route 
            path="/profile" 
            element={isLoggedIn ? <UserProfile /> : <Navigate to="/" replace state={{ from: window.location.pathname }} />} 
          />
          <Route 
            path="/profile/edit" 
            element={isLoggedIn ? <UserProfile /> : <Navigate to="/" replace state={{ from: window.location.pathname }} />} 
          />
          <Route 
            path="/brackets/:id" 
            element={isLoggedIn ? <BracketViewer /> : <Navigate to="/" replace state={{ from: window.location.pathname }} />} 
          />
        </Routes>
      </div>
    </div>
  )
}

// App wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
