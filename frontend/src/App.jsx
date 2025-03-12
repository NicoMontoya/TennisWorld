import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Register from './components/Register'
import Welcome from './components/Welcome'
import Rankings from './components/Rankings'
import Tournaments from './components/Tournaments'
import TournamentDetails from './components/TournamentDetails'
import Navigation from './components/Navigation'

function App() {
  const [user, setUser] = useState(null)

  return (
    <div className="container">
      <Navigation />
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/welcome" /> : <Register setUser={setUser} />} 
        />
        <Route 
          path="/welcome" 
          element={user ? <Welcome user={user} /> : <Navigate to="/" />} 
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
          path="/tournament/:id" 
          element={<TournamentDetails />} 
        />
      </Routes>
    </div>
  )
}

export default App
