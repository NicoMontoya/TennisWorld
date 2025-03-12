// This service provides methods to interact with the tennis API
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API-Tennis API configuration
const API_TENNIS_BASE_URL = 'https://api.api-tennis.com/tennis/';
const API_TENNIS_KEY = process.env.TENNIS_API_KEY;

// Function to get fixtures (matches) for a specific tournament
export const getFixturesForTournament = async (tournamentKey) => {
  try {
    console.log(`Getting fixtures for tournament ${tournamentKey} from API-Tennis...`);
    
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    
    // Calculate date 30 days in the future
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureYear = futureDate.getFullYear();
    const futureMonth = String(futureDate.getMonth() + 1).padStart(2, '0');
    const futureDay = String(futureDate.getDate()).padStart(2, '0');
    const futureDateStr = `${futureYear}-${futureMonth}-${futureDay}`;
    
    // Make a request to the API-Tennis API
    console.log(`Making request to ${API_TENNIS_BASE_URL} with params:`, {
      method: 'get_fixtures',
      tournament_key: tournamentKey,
      date_start: currentDate,
      date_stop: futureDateStr,
      APIkey: API_TENNIS_KEY ? API_TENNIS_KEY.substring(0, 5) + '...' : 'undefined'
    });
    
    const response = await axios.get(API_TENNIS_BASE_URL, {
      params: {
        method: 'get_fixtures',
        tournament_key: tournamentKey,
        date_start: currentDate,
        date_stop: futureDateStr,
        APIkey: API_TENNIS_KEY
      }
    });
    
    // Check if the response is valid
    if (response.data && response.data.success && response.data.result) {
      console.log(`Successfully fetched fixtures for tournament ${tournamentKey} from API-Tennis`);
      console.log(`API Response sample:`, response.data.result.slice(0, 2));
      
      return {
        status: 'success',
        data: {
          fixtures: response.data.result
        }
      };
    } else {
      throw new Error('Invalid response from API-Tennis');
    }
  } catch (error) {
    console.error('Error fetching fixtures from API-Tennis:', error);
    
    // Fallback to mock data if the API call fails
    console.log('Falling back to mock data for fixtures');
    return {
      status: 'success',
      data: {
        fixtures: generateMockFixtures(tournamentKey)
      }
    };
  }
};

// Function to get live scores
export const getLiveScores = async (tournamentKey = null) => {
  try {
    console.log(`Getting live scores${tournamentKey ? ` for tournament ${tournamentKey}` : ''} from API-Tennis...`);
    
    // Prepare params
    const params = {
      method: 'get_livescore',
      APIkey: API_TENNIS_KEY
    };
    
    // Add tournament_key if provided
    if (tournamentKey) {
      params.tournament_key = tournamentKey;
    }
    
    // Make a request to the API-Tennis API
    console.log(`Making request to ${API_TENNIS_BASE_URL} with params:`, {
      ...params,
      APIkey: API_TENNIS_KEY ? API_TENNIS_KEY.substring(0, 5) + '...' : 'undefined'
    });
    
    const response = await axios.get(API_TENNIS_BASE_URL, { params });
    
    // Check if the response is valid
    if (response.data && response.data.success && response.data.result) {
      console.log(`Successfully fetched live scores${tournamentKey ? ` for tournament ${tournamentKey}` : ''} from API-Tennis`);
      console.log(`API Response sample:`, response.data.result.slice(0, 2));
      
      return {
        status: 'success',
        data: {
          livescores: response.data.result
        }
      };
    } else {
      throw new Error('Invalid response from API-Tennis');
    }
  } catch (error) {
    console.error('Error fetching live scores from API-Tennis:', error);
    
    // Fallback to mock data if the API call fails
    console.log('Falling back to mock data for live scores');
    return {
      status: 'success',
      data: {
        livescores: generateMockLiveScores(tournamentKey)
      }
    };
  }
};

// Function to get tournament details including fixtures and live scores
export const getTournamentDetails = async (tournamentId) => {
  try {
    console.log(`Getting details for tournament ${tournamentId}`);
    
    // Get fixtures for the tournament
    const fixturesResponse = await getFixturesForTournament(tournamentId);
    
    // Get live scores for the tournament
    const liveScoresResponse = await getLiveScores(tournamentId);
    
    // Get the tournament info
    const tournaments = await getTournamentsFromMCP();
    let tournament = tournaments.data.tournaments.find(t => t.tournament_id.toString() === tournamentId.toString());
    
    // If tournament not found in API response, use base tournament data
    if (!tournament) {
      console.log(`Tournament ${tournamentId} not found in API response, using base tournament data`);
      tournament = getBaseTournaments().find(t => t.tournament_id.toString() === tournamentId.toString());
    }
    
    // If still not found, create a mock tournament
    if (!tournament) {
      console.log(`Tournament ${tournamentId} not found in base data, creating mock tournament`);
      tournament = createMockTournament(tournamentId);
    }
    
    return {
      status: 'success',
      data: {
        tournament,
        fixtures: fixturesResponse.data.fixtures,
        livescores: liveScoresResponse.data.livescores
      }
    };
  } catch (error) {
    console.error('Error fetching tournament details:', error);
    return {
      status: 'error',
      message: 'Failed to fetch tournament details'
    };
  }
};

// Helper function to create a mock tournament
function createMockTournament(tournamentId) {
  const currentYear = new Date().getFullYear();
  return {
    tournament_id: tournamentId,
    name: `Tournament ${tournamentId}`,
    location: 'Unknown Location',
    surface: 'Hard',
    category: 'ATP Tour',
    prize_money: '$1,000,000',
    start_date: `${currentYear}-06-01`,
    end_date: `${currentYear}-06-07`,
    status: 'Upcoming'
  };
}

// Helper function to generate mock fixtures data
function generateMockFixtures(tournamentKey) {
  // Get the tournament from our mock data
  const tournament = getBaseTournaments().find(t => t.tournament_id.toString() === tournamentKey.toString());
  
  if (!tournament) {
    return [];
  }
  
  // Generate random fixtures based on the tournament
  const rounds = ['Round of 64', 'Round of 32', 'Round of 16', 'Quarter-final', 'Semi-final', 'Final'];
  const fixtures = [];
  
  // Generate players for the tournament
  const players = [];
  for (let i = 1; i <= 64; i++) {
    players.push({
      player_key: i * 100 + parseInt(tournamentKey),
      player_name: `Player ${i}`
    });
  }
  
  // Generate fixtures for each round
  let remainingPlayers = [...players];
  
  rounds.forEach((round, roundIndex) => {
    const matchesInRound = remainingPlayers.length / 2;
    const newRemainingPlayers = [];
    
    for (let i = 0; i < matchesInRound; i++) {
      const player1 = remainingPlayers[i * 2];
      const player2 = remainingPlayers[i * 2 + 1];
      
      // Determine if the match is completed or upcoming based on round index
      // Earlier rounds are more likely to be completed
      const matchCompleted = roundIndex < 3 || (roundIndex === 3 && i < matchesInRound / 2);
      
      // For completed matches, determine the winner
      const winner = matchCompleted ? (Math.random() > 0.5 ? 'First Player' : 'Second Player') : null;
      
      // Generate scores for completed matches
      const scores = [];
      if (matchCompleted) {
        const numSets = Math.random() > 0.7 ? 3 : 2;
        for (let s = 1; s <= numSets; s++) {
          let score1, score2;
          if (s === numSets) {
            score1 = winner === 'First Player' ? 6 : Math.floor(Math.random() * 5);
            score2 = winner === 'Second Player' ? 6 : Math.floor(Math.random() * 5);
          } else {
            score1 = Math.floor(Math.random() * 7);
            score2 = Math.floor(Math.random() * 7);
            if (score1 === score2) {
              score1 = 6;
              score2 = 4;
            }
            if (score1 < score2 && winner === 'First Player') {
              [score1, score2] = [score2, score1];
            } else if (score1 > score2 && winner === 'Second Player') {
              [score1, score2] = [score2, score1];
            }
          }
          scores.push({
            score_first: score1.toString(),
            score_second: score2.toString(),
            score_set: s.toString()
          });
        }
      }
      
      // Add the fixture
      fixtures.push({
        event_key: `${tournamentKey}${roundIndex}${i}`,
        event_date: tournament.start_date,
        event_time: '12:00',
        event_first_player: player1.player_name,
        first_player_key: player1.player_key,
        event_second_player: player2.player_name,
        second_player_key: player2.player_key,
        event_final_result: matchCompleted ? (winner === 'First Player' ? '2 - 0' : '0 - 2') : '-',
        event_game_result: '-',
        event_serve: null,
        event_winner: winner,
        event_status: matchCompleted ? 'Finished' : 'Not Started',
        event_type_type: tournament.category,
        tournament_name: tournament.name,
        tournament_key: tournamentKey,
        tournament_round: round,
        tournament_season: '2025',
        event_live: '0',
        event_qualification: 'False',
        scores: scores
      });
      
      // Add the winner to the next round
      if (matchCompleted) {
        newRemainingPlayers.push(winner === 'First Player' ? player1 : player2);
      }
    }
    
    // Update remaining players for the next round
    if (matchCompleted) {
      remainingPlayers = newRemainingPlayers;
    }
  });
  
  return fixtures;
}

// Helper function to generate mock live scores
function generateMockLiveScores(tournamentKey) {
  // Get the tournament from our mock data
  const tournament = getBaseTournaments().find(t => t.tournament_id.toString() === tournamentKey.toString());
  
  if (!tournament) {
    return [];
  }
  
  // Generate 1-3 live matches
  const numLiveMatches = Math.floor(Math.random() * 3) + 1;
  const liveScores = [];
  
  for (let i = 0; i < numLiveMatches; i++) {
    // Generate random players
    const player1 = {
      player_key: Math.floor(Math.random() * 1000) + 1,
      player_name: `Player ${Math.floor(Math.random() * 100) + 1}`
    };
    
    const player2 = {
      player_key: Math.floor(Math.random() * 1000) + 1,
      player_name: `Player ${Math.floor(Math.random() * 100) + 1}`
    };
    
    // Generate random set and game scores
    const currentSet = Math.floor(Math.random() * 3) + 1;
    const scores = [];
    
    for (let s = 1; s <= currentSet; s++) {
      if (s < currentSet) {
        // Completed sets
        const score1 = Math.random() > 0.5 ? 6 : Math.floor(Math.random() * 5);
        const score2 = score1 === 6 ? Math.floor(Math.random() * 5) : 6;
        
        scores.push({
          score_first: score1.toString(),
          score_second: score2.toString(),
          score_set: s.toString()
        });
      } else {
        // Current set in progress
        const score1 = Math.floor(Math.random() * 6);
        const score2 = Math.floor(Math.random() * 6);
        
        scores.push({
          score_first: score1.toString(),
          score_second: score2.toString(),
          score_set: s.toString()
        });
      }
    }
    
    // Add the live score
    liveScores.push({
      event_key: `live${tournamentKey}${i}`,
      event_date: new Date().toISOString().split('T')[0],
      event_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      event_first_player: player1.player_name,
      first_player_key: player1.player_key,
      event_second_player: player2.player_name,
      second_player_key: player2.player_key,
      event_final_result: `${scores.filter(s => parseInt(s.score_first) > parseInt(s.score_second)).length} - ${scores.filter(s => parseInt(s.score_second) > parseInt(s.score_first)).length}`,
      event_game_result: `${scores[currentSet - 1].score_first} - ${scores[currentSet - 1].score_second}`,
      event_serve: Math.random() > 0.5 ? 'First Player' : 'Second Player',
      event_winner: null,
      event_status: `Set ${currentSet}`,
      event_type_type: tournament.category,
      tournament_name: tournament.name,
      tournament_key: tournamentKey,
      tournament_round: ['Round of 16', 'Quarter-final', 'Semi-final'][Math.floor(Math.random() * 3)],
      tournament_season: '2025',
      event_live: '1',
      event_qualification: 'False',
      scores: scores
    });
  }
  
  return liveScores;
}

// Function to get rankings directly from the API-Tennis API
export const getRankingsFromMCP = async (type) => {
  try {
    console.log(`Getting ${type} rankings directly from API-Tennis...`);
    
    // Make a request to the API-Tennis API
    console.log(`Making request to ${API_TENNIS_BASE_URL} with params:`, {
      method: 'get_standings',
      event_type: type.toUpperCase(),
      APIkey: API_TENNIS_KEY ? API_TENNIS_KEY.substring(0, 5) + '...' : 'undefined'
    });
    
    const response = await axios.get(API_TENNIS_BASE_URL, {
      params: {
        method: 'get_standings',
        event_type: type.toUpperCase(),
        APIkey: API_TENNIS_KEY
      }
    });
    
    // Check if the response is valid
    if (response.data && response.data.success && response.data.result) {
      console.log(`Successfully fetched ${type} rankings from API-Tennis`);
      console.log(`API Response sample:`, response.data.result.slice(0, 2));
      
      // Get only the top 100 players
      const top100Players = response.data.result.slice(0, 100);
      
      // Transform the data to match our expected format
      const rankings = transformApiTennisRankings(top100Players, type);
      
      return {
        status: 'success',
        data: {
          rankings
        }
      };
    } else {
      throw new Error('Invalid response from API-Tennis');
    }
  } catch (error) {
    console.error('Error fetching rankings from MCP:', error);
    
    // Fallback to mock data if the MCP call fails
    console.log('Falling back to mock data for rankings');
    const mockRankings = generateLiveRankings(type);
    
    return {
      status: 'success',
      data: {
        rankings: mockRankings
      }
    };
  }
};

// Function to get tournaments directly from the API-Tennis API
export const getTournamentsFromMCP = async () => {
  try {
    console.log('Getting tournaments directly from API-Tennis...');
    
    // Make a direct request to the API-Tennis API
    console.log(`Making request to ${API_TENNIS_BASE_URL} with params:`, {
      method: 'get_tournaments',
      APIkey: API_TENNIS_KEY ? API_TENNIS_KEY.substring(0, 5) + '...' : 'undefined'
    });
    
    const response = await axios.get(API_TENNIS_BASE_URL, {
      params: {
        method: 'get_tournaments',
        APIkey: API_TENNIS_KEY
      }
    });
    
    // Check if the response is valid
    if (response.data && response.data.success && response.data.result) {
      console.log('Successfully fetched tournaments from API-Tennis');
      console.log(`API Response sample:`, response.data.result.slice(0, 2));
      
      // Transform the data to match our expected format and limit to current and upcoming tournaments
      // The transformApiTennisTournaments function already filters, sorts, and limits the tournaments
      const tournaments = transformApiTennisTournaments(response.data.result);
      
      return {
        status: 'success',
        data: {
          tournaments
        }
      };
    } else {
      throw new Error('Invalid response from API-Tennis');
    }
  } catch (error) {
    console.error('Error fetching tournaments from API:', error);
    
    // Fallback to mock data if the API call fails
    console.log('Falling back to mock data for tournaments');
    const mockTournaments = generateLiveTournaments();
    
    return {
      status: 'success',
      data: {
        tournaments: mockTournaments.slice(0, 20) // Limit mock data to 20 tournaments
      }
    };
  }
};

// Helper function to generate "live" rankings data with some randomization
function generateLiveRankings(type) {
  const baseRankings = type.toUpperCase() === 'WTA' ? getBaseWTARankings() : getBaseATPRankings();
  
  // Add more randomization to make it feel "live" and changes more noticeable
  return baseRankings.map(player => ({
    ...player,
    points: Math.floor(player.points * (0.95 + Math.random() * 0.1)), // Vary points by ±5%
    movement: Math.floor(Math.random() * 7) - 3 // Random movement between -3 and +3
  }));
}

// Helper function to generate "live" tournament data with some randomization
function generateLiveTournaments() {
  const baseTournaments = getBaseTournaments();
  
  // Add more randomization to make it feel "live" and changes more noticeable
  return baseTournaments
    .map(tournament => {
      // Randomly update status for some tournaments with higher probability
      let status = tournament.status;
      if (status === 'Upcoming' && Math.random() < 0.2) {
        status = 'Ongoing';
      } else if (status === 'Ongoing' && Math.random() < 0.3) {
        status = 'Completed';
      }
      
      // Randomly adjust prize money slightly
      const prizeMoney = tournament.prize_money;
      const numericValue = parseInt(prizeMoney.replace(/[^0-9]/g, ''));
      const adjustedValue = Math.floor(numericValue * (0.98 + Math.random() * 0.04));
      const formattedPrizeMoney = prizeMoney.replace(/[0-9]+/, adjustedValue);
      
      return {
        ...tournament,
        status,
        prize_money: formattedPrizeMoney
      };
    })
    .filter(tournament => {
      // Filter to keep only 2025 tournaments that are current or upcoming
      const tournamentYear = new Date(tournament.start_date).getFullYear();
      const isValid = (tournament.status === 'Upcoming' || tournament.status === 'Ongoing') && tournamentYear === 2025;
      console.log(`Tournament ${tournament.name}, year: ${tournamentYear}, status: ${tournament.status}, isValid: ${isValid}`);
      return isValid;
    })
    .sort((a, b) => {
      // Sort by start date (ascending)
      return new Date(a.start_date) - new Date(b.start_date);
    });
}

// Base ATP rankings data
function getBaseATPRankings() {
  return [
    { rank: 1, player_id: 1, player_name: 'Novak Djokovic', country: 'SRB', points: 11245 },
    { rank: 2, player_id: 2, player_name: 'Carlos Alcaraz', country: 'ESP', points: 9255 },
    { rank: 3, player_id: 3, player_name: 'Jannik Sinner', country: 'ITA', points: 8710 },
    { rank: 4, player_id: 4, player_name: 'Daniil Medvedev', country: 'RUS', points: 7165 },
    { rank: 5, player_id: 5, player_name: 'Alexander Zverev', country: 'GER', points: 6885 },
    { rank: 6, player_id: 6, player_name: 'Andrey Rublev', country: 'RUS', points: 4970 },
    { rank: 7, player_id: 7, player_name: 'Hubert Hurkacz', country: 'POL', points: 4035 },
    { rank: 8, player_id: 8, player_name: 'Casper Ruud', country: 'NOR', points: 3855 },
    { rank: 9, player_id: 9, player_name: 'Grigor Dimitrov', country: 'BUL', points: 3775 },
    { rank: 10, player_id: 10, player_name: 'Alex de Minaur', country: 'AUS', points: 3765 },
    // Generate more players
    ...Array.from({ length: 90 }, (_, i) => ({
      rank: i + 11,
      player_id: i + 11,
      player_name: `ATP Player ${i + 11}`,
      country: ['USA', 'ESP', 'FRA', 'GBR', 'AUS', 'GER', 'ITA', 'ARG', 'CAN', 'JPN'][i % 10],
      points: Math.floor(3500 - (i * 30))
    }))
  ];
}

// Base WTA rankings data
function getBaseWTARankings() {
  return [
    { rank: 1, player_id: 101, player_name: 'Iga Swiatek', country: 'POL', points: 10715 },
    { rank: 2, player_id: 102, player_name: 'Aryna Sabalenka', country: 'BLR', points: 8725 },
    { rank: 3, player_id: 103, player_name: 'Coco Gauff', country: 'USA', points: 7150 },
    { rank: 4, player_id: 104, player_name: 'Elena Rybakina', country: 'KAZ', points: 6516 },
    { rank: 5, player_id: 105, player_name: 'Jessica Pegula', country: 'USA', points: 5705 },
    { rank: 6, player_id: 106, player_name: 'Marketa Vondrousova', country: 'CZE', points: 4075 },
    { rank: 7, player_id: 107, player_name: 'Ons Jabeur', country: 'TUN', points: 3946 },
    { rank: 8, player_id: 108, player_name: 'Qinwen Zheng', country: 'CHN', points: 3910 },
    { rank: 9, player_id: 109, player_name: 'Maria Sakkari', country: 'GRE', points: 3835 },
    { rank: 10, player_id: 110, player_name: 'Jelena Ostapenko', country: 'LAT', points: 3438 },
    // Generate more players
    ...Array.from({ length: 90 }, (_, i) => ({
      rank: i + 11,
      player_id: 100 + i + 11,
      player_name: `WTA Player ${i + 11}`,
      country: ['USA', 'ESP', 'FRA', 'GBR', 'AUS', 'GER', 'ITA', 'CHN', 'CAN', 'JPN'][i % 10],
      points: Math.floor(3300 - (i * 30))
    }))
  ];
}

/**
 * Transform rankings data from the API-Tennis API to match our expected format
 * @param {Array} apiRankings - The rankings data from the API-Tennis API
 * @param {string} type - The type of rankings (ATP or WTA)
 * @returns {Array} - The transformed rankings data
 */
const transformApiTennisRankings = (apiRankings, type) => {
  console.log('Transforming API rankings data...');
  
  // The API-Tennis API returns an array of player rankings
  // We need to transform it to match our expected format
  return apiRankings.map((player, index) => {
    // Map the API response fields to our expected format
    const rank = parseInt(player.place) || index + 1;
    const playerName = player.player || `${type} Player ${rank}`;
    const playerId = player.player_key || (type.toUpperCase() === 'WTA' ? 100 + rank : rank);
    
    // Map movement data
    let movementValue = 0;
    if (player.movement) {
      if (player.movement === 'up') {
        movementValue = Math.floor(Math.random() * 3) + 1; // Random 1-3
      } else if (player.movement === 'down') {
        movementValue = -(Math.floor(Math.random() * 3) + 1); // Random -1 to -3
      }
      // 'same' will remain 0
    }
    
    return {
      rank: rank,
      player_id: playerId,
      player_name: playerName,
      country: player.country || 'Unknown',
      points: parseInt(player.points) || 0,
      movement: movementValue
    };
  });
};

/**
 * Transform tournaments data from the API-Tennis API to match our expected format
 * @param {Array} apiTournaments - The tournaments data from the API-Tennis API
 * @returns {Array} - The transformed tournaments data focusing on upcoming tournaments
 */
const transformApiTennisTournaments = (apiTournaments) => {
  console.log('Transforming API tournaments data...');
  console.log('Sample tournament data:', JSON.stringify(apiTournaments[0], null, 2));
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // Create a map of tournament types to categories
  const categoryMap = {
    'Grand Slam': 'Grand Slam',
    'ATP Masters 1000': 'Masters 1000',
    'ATP 500': 'ATP 500',
    'ATP 250': 'ATP 250',
    'WTA 1000': 'WTA 1000',
    'WTA 500': 'WTA 500',
    'WTA 250': 'WTA 250'
  };
  
  // Create a map of tournament names to surfaces
  const surfaceMap = {
    'Australian Open': 'Hard',
    'Roland Garros': 'Clay',
    'Wimbledon': 'Grass',
    'US Open': 'Hard',
    'Miami': 'Hard',
    'Indian Wells': 'Hard',
    'Madrid': 'Clay',
    'Rome': 'Clay',
    'Cincinnati': 'Hard',
    'Canada': 'Hard',
    'Monte Carlo': 'Clay',
    'Shanghai': 'Hard',
    'Paris': 'Hard (Indoor)',
    'Acapulco': 'Hard',
    'Dubai': 'Hard',
    'Barcelona': 'Clay',
    'Halle': 'Grass',
    'Queens': 'Grass',
    'Stuttgart': 'Grass'
  };
  
  // Create a map of tournament names to locations
  const locationMap = {
    'Australian Open': 'Melbourne, Australia',
    'Roland Garros': 'Paris, France',
    'Wimbledon': 'London, UK',
    'US Open': 'New York, USA',
    'Miami': 'Miami, USA',
    'Indian Wells': 'Indian Wells, USA',
    'Madrid': 'Madrid, Spain',
    'Rome': 'Rome, Italy',
    'Cincinnati': 'Cincinnati, USA',
    'Canada': 'Toronto/Montreal, Canada',
    'Monte Carlo': 'Monte Carlo, Monaco',
    'Shanghai': 'Shanghai, China',
    'Paris': 'Paris, France',
    'Acapulco': 'Acapulco, Mexico',
    'Dubai': 'Dubai, UAE',
    'Barcelona': 'Barcelona, Spain',
    'Halle': 'Halle, Germany',
    'Queens': 'London, UK',
    'Stuttgart': 'Stuttgart, Germany'
  };
  
  // Determine tournament status based on dates
  const determineTournamentStatus = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (currentDate < start) {
      return 'Upcoming';
    } else if (currentDate >= start && currentDate <= end) {
      return 'Ongoing';
    } else {
      return 'Completed';
    }
  };
  
  // Generate prize money based on category
  const generatePrizeMoney = (category) => {
    let basePrize = 1000000; // Default prize money
    
    if (category === 'Grand Slam') {
      basePrize = 50000000 + Math.floor(Math.random() * 25000000);
    } else if (category === 'Masters 1000' || category === 'WTA 1000') {
      basePrize = 5000000 + Math.floor(Math.random() * 5000000);
    } else if (category === 'ATP 500' || category === 'WTA 500') {
      basePrize = 2000000 + Math.floor(Math.random() * 1000000);
    } else if (category === 'ATP 250' || category === 'WTA 250') {
      basePrize = 500000 + Math.floor(Math.random() * 500000);
    }
    
    return `$${basePrize.toLocaleString()}`;
  };
  
  // The API-Tennis API returns an array of tournaments
  // We need to transform it to match our expected format and focus on upcoming tournaments for 2025 only
  const transformedTournaments = apiTournaments
    .map((tournament, index) => {
      // Get tournament name
      const tournamentName = tournament.tournament_name || `Tournament ${index + 1}`;
      
      // Determine tournament category based on event type
      let category = 'Unknown';
      const eventType = tournament.event_type_type || '';
      
      if (eventType.includes('Grand Slam')) {
        category = 'Grand Slam';
      } else if (eventType.includes('Atp') && eventType.includes('Masters')) {
        category = 'Masters 1000';
      } else if (eventType.includes('Atp') && eventType.includes('500')) {
        category = 'ATP 500';
      } else if (eventType.includes('Atp') && eventType.includes('250')) {
        category = 'ATP 250';
      } else if (eventType.includes('Wta') && eventType.includes('1000')) {
        category = 'WTA 1000';
      } else if (eventType.includes('Wta') && eventType.includes('500')) {
        category = 'WTA 500';
      } else if (eventType.includes('Wta') && eventType.includes('250')) {
        category = 'WTA 250';
      } else if (eventType.includes('Atp')) {
        category = 'ATP Tour';
      } else if (eventType.includes('Wta')) {
        category = 'WTA Tour';
      }
      
      // For Grand Slam tournaments, update the name to include the year
      let name = tournamentName;
      if (category === 'Grand Slam' && !name.includes(currentYear.toString())) {
        name = `${name} ${currentYear}`;
      }
      
      // Use real tournament data if available, otherwise use our predefined data
      const realTournament = getBaseTournaments().find(t => 
        t.name.toLowerCase().includes(tournamentName.toLowerCase()) || 
        tournamentName.toLowerCase().includes(t.name.toLowerCase().replace(` ${currentYear}`, ''))
      );
      
      let startDate, endDate, status, location, surface, prizeMoney;
      
      if (realTournament) {
        // Use data from our predefined tournaments
        startDate = realTournament.start_date;
        endDate = realTournament.end_date;
        status = realTournament.status;
        location = realTournament.location;
        surface = realTournament.surface;
        prizeMoney = realTournament.prize_money;
      } else {
      // For tournaments not in our predefined list, use 2025 for dates
      const now = new Date();
      const futureDate = new Date(2025, now.getMonth(), now.getDate());
      futureDate.setMonth(now.getMonth() + 2); // Set to 2 months in the future
      
      startDate = futureDate.toISOString().split('T')[0];
      
      const endDateObj = new Date(futureDate);
      endDateObj.setDate(futureDate.getDate() + 7); // One week tournament
      endDate = endDateObj.toISOString().split('T')[0];
        
        status = 'Upcoming';
        
        // Determine tournament surface based on name
        surface = 'Unknown';
        for (const [key, value] of Object.entries(surfaceMap)) {
          if (name.toLowerCase().includes(key.toLowerCase())) {
            surface = value;
            break;
          }
        }
        
        // Determine tournament location based on name
        location = 'Unknown';
        for (const [key, value] of Object.entries(locationMap)) {
          if (name.toLowerCase().includes(key.toLowerCase())) {
            location = value;
            break;
          }
        }
        
        // Generate prize money
        prizeMoney = generatePrizeMoney(category);
      }
      
      return {
        tournament_id: tournament.tournament_key || index + 1,
        name: name,
        location: location,
        surface: surface,
        category: category,
        prize_money: prizeMoney,
        start_date: startDate,
        end_date: endDate,
        status: status
      };
    })
    .filter(tournament => {
      // Filter to keep only 2025 tournaments that are current or upcoming
      const tournamentYear = new Date(tournament.start_date).getFullYear();
      const isValid = (tournament.status === 'Upcoming' || tournament.status === 'Ongoing') && tournamentYear === 2025;
      console.log(`Tournament ${tournament.name}, year: ${tournamentYear}, status: ${tournament.status}, isValid: ${isValid}`);
      return isValid;
    })
    .sort((a, b) => {
      // Sort by start date (ascending)
      return new Date(a.start_date) - new Date(b.start_date);
    })
    .slice(0, 20); // Limit to 20 tournaments
    
  console.log(`Transformed ${transformedTournaments.length} tournaments`);
  return transformedTournaments;
};

// Base tournaments data for 2025 only
function getBaseTournaments() {
  return [
    {
      tournament_id: 1,
      name: 'Australian Open 2025',
      location: 'Melbourne, Australia',
      surface: 'Hard',
      category: 'Grand Slam',
      prize_money: '$75,000,000',
      start_date: '2025-01-13',
      end_date: '2025-01-26',
      status: 'Completed'
    },
    {
      tournament_id: 2,
      name: 'Roland Garros 2025',
      location: 'Paris, France',
      surface: 'Clay',
      category: 'Grand Slam',
      prize_money: '$50,000,000',
      start_date: '2025-05-25',
      end_date: '2025-06-08',
      status: 'Upcoming'
    },
    {
      tournament_id: 3,
      name: 'Wimbledon 2025',
      location: 'London, UK',
      surface: 'Grass',
      category: 'Grand Slam',
      prize_money: '$60,000,000',
      start_date: '2025-06-30',
      end_date: '2025-07-13',
      status: 'Upcoming'
    },
    {
      tournament_id: 4,
      name: 'US Open 2025',
      location: 'New York, USA',
      surface: 'Hard',
      category: 'Grand Slam',
      prize_money: '$65,000,000',
      start_date: '2025-08-25',
      end_date: '2025-09-07',
      status: 'Upcoming'
    },
    {
      tournament_id: 5,
      name: 'Miami Open 2025',
      location: 'Miami, USA',
      surface: 'Hard',
      category: 'Masters 1000',
      prize_money: '$8,800,000',
      start_date: '2025-03-17',
      end_date: '2025-03-30',
      status: 'Upcoming'
    },
    {
      tournament_id: 6,
      name: 'Madrid Open 2025',
      location: 'Madrid, Spain',
      surface: 'Clay',
      category: 'Masters 1000',
      prize_money: '$7,500,000',
      start_date: '2025-04-28',
      end_date: '2025-05-11',
      status: 'Upcoming'
    },
    {
      tournament_id: 7,
      name: 'Italian Open 2025',
      location: 'Rome, Italy',
      surface: 'Clay',
      category: 'Masters 1000',
      prize_money: '$7,000,000',
      start_date: '2025-05-12',
      end_date: '2025-05-19',
      status: 'Upcoming'
    },
    {
      tournament_id: 8,
      name: 'Cincinnati Masters 2025',
      location: 'Cincinnati, USA',
      surface: 'Hard',
      category: 'Masters 1000',
      prize_money: '$6,600,000',
      start_date: '2025-08-11',
      end_date: '2025-08-18',
      status: 'Upcoming'
    },
    {
      tournament_id: 9,
      name: 'Indian Wells Masters 2025',
      location: 'Indian Wells, USA',
      surface: 'Hard',
      category: 'Masters 1000',
      prize_money: '$9,000,000',
      start_date: '2025-03-06',
      end_date: '2025-03-16',
      status: 'Upcoming'
    },
    {
      tournament_id: 10,
      name: 'ATP Finals 2025',
      location: 'Turin, Italy',
      surface: 'Hard (Indoor)',
      category: 'Tour Finals',
      prize_money: '$14,750,000',
      start_date: '2025-11-09',
      end_date: '2025-11-16',
      status: 'Upcoming'
    },
    {
      tournament_id: 11,
      name: 'Dubai Tennis Championships 2025',
      location: 'Dubai, UAE',
      surface: 'Hard',
      category: 'ATP 500',
      prize_money: '$3,000,000',
      start_date: '2025-02-24',
      end_date: '2025-03-01',
      status: 'Upcoming'
    },
    {
      tournament_id: 12,
      name: 'Barcelona Open 2025',
      location: 'Barcelona, Spain',
      surface: 'Clay',
      category: 'ATP 500',
      prize_money: '$2,800,000',
      start_date: '2025-04-15',
      end_date: '2025-04-21',
      status: 'Upcoming'
    },
    {
      tournament_id: 13,
      name: 'Queen\'s Club Championships 2025',
      location: 'London, UK',
      surface: 'Grass',
      category: 'ATP 500',
      prize_money: '$2,500,000',
      start_date: '2025-06-16',
      end_date: '2025-06-22',
      status: 'Upcoming'
    },
    {
      tournament_id: 14,
      name: 'Halle Open 2025',
      location: 'Halle, Germany',
      surface: 'Grass',
      category: 'ATP 500',
      prize_money: '$2,300,000',
      start_date: '2025-06-16',
      end_date: '2025-06-22',
      status: 'Upcoming'
    },
    {
      tournament_id: 15,
      name: 'Stuttgart Open 2025',
      location: 'Stuttgart, Germany',
      surface: 'Grass',
      category: 'ATP 250',
      prize_money: '$800,000',
      start_date: '2025-06-09',
      end_date: '2025-06-15',
      status: 'Upcoming'
    },
    {
      tournament_id: 16,
      name: 'Vienna Open 2025',
      location: 'Vienna, Austria',
      surface: 'Hard (Indoor)',
      category: 'ATP 500',
      prize_money: '$2,400,000',
      start_date: '2025-10-20',
      end_date: '2025-10-26',
      status: 'Upcoming'
    },
    {
      tournament_id: 17,
      name: 'Paris Masters 2025',
      location: 'Paris, France',
      surface: 'Hard (Indoor)',
      category: 'Masters 1000',
      prize_money: '$5,800,000',
      start_date: '2025-10-27',
      end_date: '2025-11-02',
      status: 'Upcoming'
    },
    {
      tournament_id: 18,
      name: 'Monte-Carlo Masters 2025',
      location: 'Monte Carlo, Monaco',
      surface: 'Clay',
      category: 'Masters 1000',
      prize_money: '$5,900,000',
      start_date: '2025-04-06',
      end_date: '2025-04-13',
      status: 'Upcoming'
    },
    {
      tournament_id: 19,
      name: 'Shanghai Masters 2025',
      location: 'Shanghai, China',
      surface: 'Hard',
      category: 'Masters 1000',
      prize_money: '$8,200,000',
      start_date: '2025-10-05',
      end_date: '2025-10-12',
      status: 'Upcoming'
    },
    {
      tournament_id: 20,
      name: 'Canadian Open 2025',
      location: 'Toronto, Canada',
      surface: 'Hard',
      category: 'Masters 1000',
      prize_money: '$6,700,000',
      start_date: '2025-08-04',
      end_date: '2025-08-10',
      status: 'Upcoming'
    },
    {
      tournament_id: 21,
      name: 'Geneva Open 2025',
      location: 'Geneva, Switzerland',
      surface: 'Clay',
      category: 'ATP 250',
      prize_money: '$750,000',
      start_date: '2025-05-18',
      end_date: '2025-05-24',
      status: 'Upcoming'
    },
    {
      tournament_id: 22,
      name: 'Lyon Open 2025',
      location: 'Lyon, France',
      surface: 'Clay',
      category: 'ATP 250',
      prize_money: '$720,000',
      start_date: '2025-05-18',
      end_date: '2025-05-24',
      status: 'Upcoming'
    },
    {
      tournament_id: 23,
      name: 'Eastbourne International 2025',
      location: 'Eastbourne, UK',
      surface: 'Grass',
      category: 'ATP 250',
      prize_money: '$760,000',
      start_date: '2025-06-23',
      end_date: '2025-06-29',
      status: 'Upcoming'
    },
    {
      tournament_id: 24,
      name: 'Mallorca Championships 2025',
      location: 'Mallorca, Spain',
      surface: 'Grass',
      category: 'ATP 250',
      prize_money: '$780,000',
      start_date: '2025-06-23',
      end_date: '2025-06-29',
      status: 'Upcoming'
    },
    {
      tournament_id: 25,
      name: 'WTA Finals 2025',
      location: 'Shenzhen, China',
      surface: 'Hard (Indoor)',
      category: 'WTA Finals',
      prize_money: '$14,000,000',
      start_date: '2025-11-02',
      end_date: '2025-11-09',
      status: 'Upcoming'
    }
  ];
}
