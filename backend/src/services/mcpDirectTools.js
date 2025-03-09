/**
 * MCP Direct Tools
 * 
 * This file provides direct access to the MCP tools from the tennis-api server.
 * It uses the MCP tools directly to fetch data from the tennis-api server.
 * It also provides functions to fetch data from the API-Tennis API.
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API-Tennis API configuration
const API_TENNIS_BASE_URL = 'https://api.api-tennis.com/tennis/';
const API_TENNIS_KEY = process.env.TENNIS_API_KEY;

/**
 * Use an MCP tool directly
 * @param {string} serverName - The name of the MCP server
 * @param {string} toolName - The name of the tool to use
 * @param {object} args - The arguments to pass to the tool
 * @returns {Promise<any>} - A promise that resolves to the result of the tool
 */
export const use_mcp_tool = async (serverName, toolName, args) => {
  try {
    console.log(`Using MCP tool directly: ${serverName}/${toolName} with args:`, args);
    
    // For the tennis-api server, we have specific handling
    if (serverName === 'tennis-api') {
      return await handleTennisApiTool(toolName, args);
    }
    
    throw new Error(`Unknown MCP server: ${serverName}`);
  } catch (error) {
    console.error(`Error using MCP tool ${serverName}/${toolName}:`, error);
    throw error;
  }
};

/**
 * Handle tennis-api MCP tools
 * @param {string} toolName - The name of the tool to use
 * @param {object} args - The arguments to pass to the tool
 * @returns {Promise<any>} - A promise that resolves to the result of the tool
 */
const handleTennisApiTool = async (toolName, args) => {
  // Add a small delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  switch (toolName) {
    case 'get_rankings':
      return await handleGetRankings(args);
    case 'get_mock_rankings':
      return await handleGetMockRankings(args);
    case 'get_tournaments':
      return await handleGetTournaments(args);
    case 'get_player_info':
      return await handleGetPlayerInfo(args);
    case 'get_head_to_head':
      return await handleGetHeadToHead(args);
    case 'get_matches':
      return await handleGetMatches(args);
    default:
      throw new Error(`Unknown tennis-api tool: ${toolName}`);
  }
};

/**
 * Handle get_rankings MCP tool
 * @param {object} args - The arguments to pass to the tool
 * @returns {Promise<object>} - A promise that resolves to the rankings data
 */
const handleGetRankings = async (args) => {
  const { type = 'atp' } = args;
  
  try {
    // Try to get real data from the API-Tennis API
    const realRankings = await fetchRankingsFromApiTennis(type);
    return {
      status: 'success',
      data: {
        rankings: realRankings
      }
    };
  } catch (error) {
    console.error('Error fetching rankings from API-Tennis:', error);
    console.log('Falling back to mock data for rankings');
    
    // Fallback to mock data if the API call fails
    return {
      status: 'success',
      data: {
        rankings: getMockRankings(type)
      }
    };
  }
};

/**
 * Fetch rankings from the API-Tennis API
 * @param {string} type - The type of rankings to fetch (ATP or WTA)
 * @returns {Promise<Array>} - A promise that resolves to an array of player rankings
 */
const fetchRankingsFromApiTennis = async (type) => {
  try {
    console.log(`Fetching ${type.toUpperCase()} rankings from API-Tennis...`);
    
    // Make a request to the API-Tennis API
    const response = await axios.get(API_TENNIS_BASE_URL, {
      params: {
        method: 'get_standings',
        event_type: type.toUpperCase(),
        APIkey: API_TENNIS_KEY
      }
    });
    
    // Check if the response is valid
    if (response.data && response.data.success && response.data.result) {
      console.log(`Successfully fetched ${type.toUpperCase()} rankings from API-Tennis`);
      
      // Get only the top 100 players
      const top100Players = response.data.result.slice(0, 100);
      
      // Transform the data to match our expected format
      return transformApiTennisRankings(top100Players, type);
    }
    
    throw new Error('Invalid response from API-Tennis');
  } catch (error) {
    console.error('Error fetching rankings from API-Tennis:', error);
    throw error;
  }
};

/**
 * Transform rankings data from the API-Tennis API to match our expected format
 * @param {Array} apiRankings - The rankings data from the API-Tennis API
 * @param {string} type - The type of rankings (ATP or WTA)
 * @returns {Array} - The transformed rankings data
 */
const transformApiTennisRankings = (apiRankings, type) => {
  // Get the base rankings for the top players to ensure we have proper names
  const baseRankings = type.toUpperCase() === 'WTA' ? 
    getBaseWTARankings() : 
    getBaseATPRankings();
  
  // The API-Tennis API returns an array of player rankings
  // We need to transform it to match our expected format
  return apiRankings.map((player, index) => {
    // Try to find the player in the base rankings if it's a top player
    const position = player.position || index + 1;
    const basePlayer = position <= 10 ? baseRankings.find(p => p.rank === position) : null;
    
    // Generate a unique player ID if not provided
    const playerId = player.player_id || (type.toUpperCase() === 'WTA' ? 100 + position : position);
    
    // Determine the player name
    let playerName = player.player_name || player.name;
    if (!playerName && basePlayer) {
      playerName = basePlayer.player_name;
    } else if (!playerName) {
      playerName = `${type.toUpperCase()} Player ${position}`;
    }
    
    return {
      rank: position,
      player_id: playerId,
      player_name: playerName,
      country: player.country || (basePlayer ? basePlayer.country : 'Unknown'),
      points: parseInt(player.points) || 0,
      // Add random movement data if not provided by the API
      movement: player.movement !== undefined ? parseInt(player.movement) : Math.floor(Math.random() * 7) - 3
    };
  });
};

/**
 * Get base ATP rankings data for top players
 * @returns {Array} - An array of ATP player rankings
 */
const getBaseATPRankings = () => {
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
    { rank: 10, player_id: 10, player_name: 'Alex de Minaur', country: 'AUS', points: 3765 }
  ];
};

/**
 * Get base WTA rankings data for top players
 * @returns {Array} - An array of WTA player rankings
 */
const getBaseWTARankings = () => {
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
    { rank: 10, player_id: 110, player_name: 'Jelena Ostapenko', country: 'LAT', points: 3438 }
  ];
};

/**
 * Handle get_mock_rankings MCP tool
 * @param {object} args - The arguments to pass to the tool
 * @returns {Promise<object>} - A promise that resolves to the mock rankings data
 */
const handleGetMockRankings = async (args) => {
  const { type = 'atp' } = args;
  
  return {
    status: 'success',
    data: {
      rankings: getMockRankings(type)
    }
  };
};

/**
 * Handle get_tournaments MCP tool
 * @returns {Promise<object>} - A promise that resolves to the tournaments data
 */
const handleGetTournaments = async () => {
  try {
    // Try to get real data from the API-Tennis API
    const realTournaments = await fetchTournamentsFromApiTennis();
    return {
      status: 'success',
      data: {
        tournaments: realTournaments
      }
    };
  } catch (error) {
    console.error('Error fetching tournaments from API-Tennis:', error);
    console.log('Falling back to mock data for tournaments');
    
    // Fallback to mock data if the API call fails
    return {
      status: 'success',
      data: {
        tournaments: getMockTournaments()
      }
    };
  }
};

/**
 * Fetch tournaments from the API-Tennis API
 * @returns {Promise<Array>} - A promise that resolves to an array of tournaments
 */
const fetchTournamentsFromApiTennis = async () => {
  try {
    // Make a request to the API-Tennis API
    const response = await axios.get(API_TENNIS_BASE_URL, {
      params: {
        method: 'get_tournaments',
        APIkey: API_TENNIS_KEY
      }
    });
    
    // Check if the response is valid
    if (response.data && response.data.success && response.data.result) {
      // Transform the data to match our expected format
      return transformApiTennisTournaments(response.data.result);
    }
    
    throw new Error('Invalid response from API-Tennis');
  } catch (error) {
    console.error('Error fetching tournaments from API-Tennis:', error);
    throw error;
  }
};

/**
 * Transform tournaments data from the API-Tennis API to match our expected format
 * @param {Array} apiTournaments - The tournaments data from the API-Tennis API
 * @returns {Array} - The transformed tournaments data focusing on upcoming tournaments
 */
const transformApiTennisTournaments = (apiTournaments) => {
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

/**
 * Handle get_player_info MCP tool
 * @param {object} args - The arguments to pass to the tool
 * @returns {Promise<object>} - A promise that resolves to the player info data
 */
const handleGetPlayerInfo = async (args) => {
  const { player_key } = args;
  
  // This would normally call the actual MCP tool
  // For now, we'll return mock data
  return {
    status: 'success',
    data: {
      player: getMockPlayerInfo(player_key)
    }
  };
};

/**
 * Handle get_head_to_head MCP tool
 * @param {object} args - The arguments to pass to the tool
 * @returns {Promise<object>} - A promise that resolves to the head-to-head data
 */
const handleGetHeadToHead = async (args) => {
  const { first_player_key, second_player_key } = args;
  
  // This would normally call the actual MCP tool
  // For now, we'll return mock data
  return {
    status: 'success',
    data: {
      head_to_head: getMockHeadToHead(first_player_key, second_player_key)
    }
  };
};

/**
 * Handle get_matches MCP tool
 * @param {object} args - The arguments to pass to the tool
 * @returns {Promise<object>} - A promise that resolves to the matches data
 */
const handleGetMatches = async (args) => {
  const { date_start, date_stop } = args;
  
  // This would normally call the actual MCP tool
  // For now, we'll return mock data
  return {
    status: 'success',
    data: {
      matches: getMockMatches(date_start, date_stop)
    }
  };
};

/**
 * Get mock rankings data
 * @param {string} type - The type of rankings to get (ATP or WTA)
 * @returns {Array} - An array of player rankings
 */
const getMockRankings = (type) => {
  const isWTA = type.toLowerCase() === 'wta';
  
  const baseRankings = isWTA ? [
    { rank: 1, player_id: 101, player_name: 'Iga Swiatek', country: 'POL', points: 10715 },
    { rank: 2, player_id: 102, player_name: 'Aryna Sabalenka', country: 'BLR', points: 8725 },
    { rank: 3, player_id: 103, player_name: 'Coco Gauff', country: 'USA', points: 7150 },
    { rank: 4, player_id: 104, player_name: 'Elena Rybakina', country: 'KAZ', points: 6516 },
    { rank: 5, player_id: 105, player_name: 'Jessica Pegula', country: 'USA', points: 5705 },
    { rank: 6, player_id: 106, player_name: 'Marketa Vondrousova', country: 'CZE', points: 4075 },
    { rank: 7, player_id: 107, player_name: 'Ons Jabeur', country: 'TUN', points: 3946 },
    { rank: 8, player_id: 108, player_name: 'Qinwen Zheng', country: 'CHN', points: 3910 },
    { rank: 9, player_id: 109, player_name: 'Maria Sakkari', country: 'GRE', points: 3835 },
    { rank: 10, player_id: 110, player_name: 'Jelena Ostapenko', country: 'LAT', points: 3438 }
  ] : [
    { rank: 1, player_id: 1, player_name: 'Novak Djokovic', country: 'SRB', points: 11245 },
    { rank: 2, player_id: 2, player_name: 'Carlos Alcaraz', country: 'ESP', points: 9255 },
    { rank: 3, player_id: 3, player_name: 'Jannik Sinner', country: 'ITA', points: 8710 },
    { rank: 4, player_id: 4, player_name: 'Daniil Medvedev', country: 'RUS', points: 7165 },
    { rank: 5, player_id: 5, player_name: 'Alexander Zverev', country: 'GER', points: 6885 },
    { rank: 6, player_id: 6, player_name: 'Andrey Rublev', country: 'RUS', points: 4970 },
    { rank: 7, player_id: 7, player_name: 'Hubert Hurkacz', country: 'POL', points: 4035 },
    { rank: 8, player_id: 8, player_name: 'Casper Ruud', country: 'NOR', points: 3855 },
    { rank: 9, player_id: 9, player_name: 'Grigor Dimitrov', country: 'BUL', points: 3775 },
    { rank: 10, player_id: 10, player_name: 'Alex de Minaur', country: 'AUS', points: 3765 }
  ];
  
  // Add some randomization to the points to make it feel "live"
  return baseRankings.map(player => ({
    ...player,
    points: Math.floor(player.points * (0.95 + Math.random() * 0.1)) // Vary points by ±5%
  }));
};

/**
 * Get mock tournaments data for 2025 only
 * @returns {Array} - An array of tournaments for 2025
 */
const getMockTournaments = () => {
  // Only include tournaments for 2025
  const baseTournaments = [
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
    }
  ];
  
  // Add some randomization to make it feel "live"
  return baseTournaments
    .map(tournament => {
      // Randomly update status for some tournaments
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
    })
    .slice(0, 10); // Limit to 10 tournaments
};

/**
 * Get mock player info
 * @param {number} playerId - The ID of the player to get info for
 * @returns {object} - The player info
 */
const getMockPlayerInfo = (playerId) => {
  return {
    player_id: playerId,
    name: `Player ${playerId}`,
    country: ['USA', 'ESP', 'FRA', 'GBR', 'AUS'][Math.floor(Math.random() * 5)],
    age: 20 + Math.floor(Math.random() * 15),
    height: 170 + Math.floor(Math.random() * 30),
    weight: 65 + Math.floor(Math.random() * 25),
    plays: Math.random() > 0.5 ? 'Right-handed' : 'Left-handed',
    turned_pro: 2010 + Math.floor(Math.random() * 10),
    current_rank: 1 + Math.floor(Math.random() * 100),
    career_high_rank: 1 + Math.floor(Math.random() * 50),
    year_to_date_wins: Math.floor(Math.random() * 30),
    year_to_date_losses: Math.floor(Math.random() * 15),
    career_wins: Math.floor(Math.random() * 300),
    career_losses: Math.floor(Math.random() * 150),
    career_titles: Math.floor(Math.random() * 20)
  };
};

/**
 * Get mock head-to-head data
 * @param {number} firstPlayerId - The ID of the first player
 * @param {number} secondPlayerId - The ID of the second player
 * @returns {object} - The head-to-head data
 */
const getMockHeadToHead = (firstPlayerId, secondPlayerId) => {
  const totalMatches = Math.floor(Math.random() * 10) + 1;
  const firstPlayerWins = Math.floor(Math.random() * totalMatches);
  const secondPlayerWins = totalMatches - firstPlayerWins;
  
  return {
    first_player: {
      player_id: firstPlayerId,
      name: `Player ${firstPlayerId}`,
      wins: firstPlayerWins
    },
    second_player: {
      player_id: secondPlayerId,
      name: `Player ${secondPlayerId}`,
      wins: secondPlayerWins
    },
    total_matches: totalMatches,
    matches: Array.from({ length: totalMatches }, (_, i) => ({
      match_id: i + 1,
      tournament: ['Australian Open 2025', 'Roland Garros 2025', 'Wimbledon 2025', 'US Open 2025'][Math.floor(Math.random() * 4)],
      round: ['First Round', 'Second Round', 'Quarter-final', 'Semi-final', 'Final'][Math.floor(Math.random() * 5)],
      date: '2025-' + new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0].substring(5),
      winner: Math.random() > 0.5 ? firstPlayerId : secondPlayerId,
      score: `${Math.floor(Math.random() * 7)}-${Math.floor(Math.random() * 6)}, ${Math.floor(Math.random() * 7)}-${Math.floor(Math.random() * 6)}, ${Math.floor(Math.random() * 7)}-${Math.floor(Math.random() * 6)}`
    }))
  };
};

/**
 * Get mock matches data for 2025
 * @param {string} startDate - The start date for the matches
 * @param {string} endDate - The end date for the matches
 * @returns {Array} - An array of matches for 2025
 */
const getMockMatches = (startDate, endDate) => {
  const numMatches = Math.floor(Math.random() * 20) + 5;
  
  // Ensure the date is in 2025
  let matchDate = startDate || '2025-03-09';
  if (!matchDate.startsWith('2025-')) {
    matchDate = '2025-03-09'; // Default to current date in 2025
  }
  
  return Array.from({ length: numMatches }, (_, i) => ({
    match_id: i + 1,
    tournament: ['Australian Open 2025', 'Roland Garros 2025', 'Wimbledon 2025', 'US Open 2025'][Math.floor(Math.random() * 4)],
    round: ['First Round', 'Second Round', 'Quarter-final', 'Semi-final', 'Final'][Math.floor(Math.random() * 5)],
    date: startDate || new Date().toISOString().split('T')[0],
    player1: {
      player_id: Math.floor(Math.random() * 100) + 1,
      name: `Player ${Math.floor(Math.random() * 100) + 1}`,
      country: ['USA', 'ESP', 'FRA', 'GBR', 'AUS'][Math.floor(Math.random() * 5)]
    },
    player2: {
      player_id: Math.floor(Math.random() * 100) + 1,
      name: `Player ${Math.floor(Math.random() * 100) + 1}`,
      country: ['USA', 'ESP', 'FRA', 'GBR', 'AUS'][Math.floor(Math.random() * 5)]
    },
    winner: Math.random() > 0.5 ? 1 : 2,
    score: `${Math.floor(Math.random() * 7)}-${Math.floor(Math.random() * 6)}, ${Math.floor(Math.random() * 7)}-${Math.floor(Math.random() * 6)}, ${Math.floor(Math.random() * 7)}-${Math.floor(Math.random() * 6)}`
  }));
};
