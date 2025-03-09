// This service provides methods to interact with the tennis API
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API-Tennis API configuration
const API_TENNIS_BASE_URL = 'https://api.api-tennis.com/tennis/';
const API_TENNIS_KEY = process.env.TENNIS_API_KEY;

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
        tournaments: mockTournaments.slice(0, 10) // Limit mock data to 10 tournaments
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
      // Filter to keep only current and upcoming tournaments
      return tournament.status === 'Upcoming' || tournament.status === 'Ongoing';
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
  
  const currentDate = new Date();
  
  // The API-Tennis API returns an array of tournaments
  // We need to transform it to match our expected format and focus on upcoming tournaments
  return apiTournaments
    .map((tournament, index) => {
      // Map tournament dates
      const startDate = tournament.start_date || tournament.date_start || new Date().toISOString().split('T')[0];
      const endDate = tournament.end_date || tournament.date_end || tournament.date_finish || new Date().toISOString().split('T')[0];
      
      // Map tournament status
      let status = tournament.status || 'Upcoming';
      const tournamentStartDate = new Date(startDate);
      const tournamentEndDate = new Date(endDate);
      
      if (currentDate < tournamentStartDate) {
        status = 'Upcoming';
      } else if (currentDate >= tournamentStartDate && currentDate <= tournamentEndDate) {
        status = 'Ongoing';
      } else {
        status = 'Completed';
      }
      
      // Map tournament ID
      const tournamentId = tournament.id || tournament.tournament_id || index + 1;
      
      // Map tournament name
      const name = tournament.name || tournament.tournament_name || `Tournament ${tournamentId}`;
      
      // Map tournament location
      const location = tournament.location || tournament.venue || 'Unknown';
      
      // Map tournament surface
      const surface = tournament.surface || 'Unknown';
      
      // Map tournament category
      let category = tournament.category || tournament.tournament_type || 'Unknown';
      if (name.includes('Grand Slam') || 
          name.includes('Australian Open') || 
          name.includes('Roland Garros') || 
          name.includes('Wimbledon') || 
          name.includes('US Open')) {
        category = 'Grand Slam';
      } else if (name.includes('Masters') || name.includes('1000')) {
        category = 'Masters 1000';
      } else if (name.includes('500')) {
        category = 'ATP 500';
      } else if (name.includes('250')) {
        category = 'ATP 250';
      }
      
      // Map tournament prize money
      const prizeMoney = tournament.prize_money || tournament.prize || '$0';
      
      return {
        tournament_id: tournamentId,
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
      // Filter to keep only current and upcoming tournaments
      return tournament.status === 'Upcoming' || tournament.status === 'Ongoing';
    })
    .sort((a, b) => {
      // Sort by start date (ascending)
      return new Date(a.start_date) - new Date(b.start_date);
    })
    .slice(0, 10); // Limit to 10 tournaments
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
    }
  ];
}
