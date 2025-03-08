import { useState, useEffect } from 'react'
import axios from 'axios'

const Rankings = () => {
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [type, setType] = useState('ATP') // Default to ATP rankings

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true)
      try {
        // In a real app, we would fetch from our backend which would use the tennis API
        // For now, we'll use mock data from our backend
        const response = await axios.get(`http://localhost:5001/api/tennis/rankings/${type}`)
        setRankings(response.data.data.rankings || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching rankings:', err)
        setError('Failed to load rankings. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchRankings()
  }, [type])

  const handleTypeChange = (newType) => {
    setType(newType)
  }

  return (
    <div className="card" style={{ maxWidth: '1000px', margin: '50px auto', padding: '40px' }}>
      <h1 className="text-center" style={{ color: 'var(--primary-color)', marginBottom: '30px' }}>
        Tennis Rankings
      </h1>

      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <button 
          className={`btn ${type === 'ATP' ? '' : 'btn-secondary'}`} 
          onClick={() => handleTypeChange('ATP')}
          style={{ marginRight: '10px' }}
        >
          ATP (Men)
        </button>
        <button 
          className={`btn ${type === 'WTA' ? '' : 'btn-secondary'}`} 
          onClick={() => handleTypeChange('WTA')}
        >
          WTA (Women)
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading rankings...</div>
      ) : error ? (
        <div className="error text-center">{error}</div>
      ) : (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--secondary-color)' }}>
                <th style={tableHeaderStyle}>Rank</th>
                <th style={tableHeaderStyle}>Player</th>
                <th style={tableHeaderStyle}>Country</th>
                <th style={tableHeaderStyle}>Points</th>
              </tr>
            </thead>
            <tbody>
              {rankings.slice(0, 100).map((player) => (
                <tr key={player.player_id} style={tableRowStyle}>
                  <td style={tableCellStyle}>{player.rank}</td>
                  <td style={tableCellStyle}>{player.player_name}</td>
                  <td style={tableCellStyle}>{player.country}</td>
                  <td style={tableCellStyle}>{player.points.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {rankings.length === 0 && (
            <div className="text-center" style={{ marginTop: '20px' }}>
              No rankings data available.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Styles
const tableHeaderStyle = {
  padding: '12px 15px',
  textAlign: 'left',
  fontWeight: 'bold',
  borderBottom: '2px solid var(--primary-color)'
}

const tableRowStyle = {
  borderBottom: '1px solid #ddd'
}

const tableCellStyle = {
  padding: '12px 15px'
}

export default Rankings
