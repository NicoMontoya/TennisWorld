import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Register from './components/Register'
import Welcome from './components/Welcome'

function App() {
  const [user, setUser] = useState(null)

  return (
    <div className="container">
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/welcome" /> : <Register setUser={setUser} />} 
        />
        <Route 
          path="/welcome" 
          element={user ? <Welcome user={user} /> : <Navigate to="/" />} 
        />
      </Routes>
    </div>
  )
}

export default App
