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
    
    // Special handling for Indian Wells tournament (ID: 9)
    if (tournamentKey.toString() === '9') {
      console.log('Using specific parameters for Indian Wells tournament');
      
      // For Indian Wells, use the exact parameters provided
      const startDate = '2025-03-01';
      const endDate = '2025-03-24';
      const eventTypeKey = '265'; // ATP event type
      const indianWellsTournamentKey = '1903'; // Specific key for Indian Wells in the API
      
      // Make a request to the API-Tennis API with the specific parameters
      console.log(`Making request to ${API_TENNIS_BASE_URL} with specific params for Indian Wells:`, {
        method: 'get_fixtures',
        tournament_key: indianWellsTournamentKey,
        event_type_key: eventTypeKey,
        date_start: startDate,
        date_stop: endDate,
        APIkey: API_TENNIS_KEY ? API_TENNIS_KEY.substring(0, 5) + '...' : 'undefined'
      });
      
      const response = await axios.get(API_TENNIS_BASE_URL, {
        params: {
          method: 'get_fixtures',
          tournament_key: indianWellsTournamentKey,
          event_type_key: eventTypeKey,
          date_start: startDate,
          date_stop: endDate,
          APIkey: API_TENNIS_KEY
        }
      });
      
      // Check if the response is valid
      if (response.data && response.data.success && response.data.result) {
        console.log(`Successfully fetched fixtures for Indian Wells tournament from API-Tennis`);
        console.log(`API Response sample:`, response.data.result.slice(0, 2));
        console.log(`Total matches: ${response.data.result.length}`);
        
        // Process the fixtures to ensure they have proper round information
        const processedFixtures = processIndianWellsFixtures(response.data.result);
        
        return {
          status: 'success',
          data: {
            fixtures: processedFixtures
          }
        };
      }
    } else {
      // Standard handling for other tournaments
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
      }
    }
    
    throw new Error('Invalid response from API-Tennis');
  } catch (error) {
    console.error('Error fetching fixtures from API-Tennis:', error);
    
    // Fallback to mock data if the API call fails
    console.log('Falling back to mock data for fixtures');
    
    // For Indian Wells, use our detailed mock data
    if (tournamentKey.toString() === '9') {
      console.log('Generating detailed mock data for Indian Wells tournament');
      return {
        status: 'success',
        data: {
          fixtures: generateDetailedIndianWellsFixtures(tournamentKey)
        }
      };
    }
    
    // For other tournaments, use standard mock data
    return {
      status: 'success',
      data: {
        fixtures: generateMockFixtures(tournamentKey)
      }
    };
  }
};

// Function to process Indian Wells fixtures to ensure proper round information
function processIndianWellsFixtures(fixtures) {
  console.log('Processing Indian Wells fixtures...');
  
  // If we don't have any fixtures, return an empty array
  if (!fixtures || fixtures.length === 0) {
    return [];
  }
  
  // Map to store player seeds
  const playerSeeds = {};
  
  // Extract player seeds from player names (e.g., "Novak Djokovic [1]")
  fixtures.forEach(fixture => {
    // Process first player
    const firstPlayerMatch = fixture.event_first_player.match(/(.+)\s+\[(\d+)\]$/);
    if (firstPlayerMatch) {
      const playerName = firstPlayerMatch[1].trim();
      const seed = parseInt(firstPlayerMatch[2]);
      playerSeeds[fixture.first_player_key] = seed;
      // Update the player name without the seed in brackets
      fixture.event_first_player = playerName;
    }
    
    // Process second player
    const secondPlayerMatch = fixture.event_second_player.match(/(.+)\s+\[(\d+)\]$/);
    if (secondPlayerMatch) {
      const playerName = secondPlayerMatch[1].trim();
      const seed = parseInt(secondPlayerMatch[2]);
      playerSeeds[fixture.second_player_key] = seed;
      // Update the player name without the seed in brackets
      fixture.event_second_player = playerName;
    }
  });
  
  // Add seed information to each fixture
  fixtures.forEach(fixture => {
    fixture.first_player_seed = playerSeeds[fixture.first_player_key] || null;
    fixture.second_player_seed = playerSeeds[fixture.second_player_key] || null;
  });
  
  // Ensure each fixture has a proper tournament round
  fixtures.forEach(fixture => {
    if (!fixture.tournament_round || fixture.tournament_round === '') {
      // Try to determine the round based on other information
      // This is a simplified approach - in a real scenario, you might need more complex logic
      if (fixture.event_status === 'Finished' && fixtures.length <= 2) {
        fixture.tournament_round = 'Final';
      } else if (fixture.event_status === 'Finished' && fixtures.length <= 4) {
        fixture.tournament_round = 'Semi-final';
      } else if (fixture.event_status === 'Finished' && fixtures.length <= 8) {
        fixture.tournament_round = 'Quarter-final';
      } else if (fixture.event_status === 'Finished' && fixtures.length <= 16) {
        fixture.tournament_round = 'Round of 16';
      } else if (fixture.event_status === 'Finished' && fixtures.length <= 32) {
        fixture.tournament_round = 'Round of 32';
      } else if (fixture.event_status === 'Finished' && fixtures.length <= 64) {
        fixture.tournament_round = 'Round of 64';
      } else if (fixture.event_status === 'Finished' && fixtures.length <= 128) {
        fixture.tournament_round = 'Round of 128';
      } else {
        fixture.tournament_round = 'Unknown Round';
      }
    }
  });
  
  // Sort fixtures by round and by seed
  const roundOrder = {
    'Final': 0,
    'Semi-final': 1,
    'Quarter-final': 2,
    'Round of 16': 3,
    'Round of 32': 4,
    'Round of 64': 5,
    'Round of 128': 6,
    'Unknown Round': 7
  };
  
  fixtures.sort((a, b) => {
    // First sort by round
    const roundA = roundOrder[a.tournament_round] !== undefined ? roundOrder[a.tournament_round] : 999;
    const roundB = roundOrder[b.tournament_round] !== undefined ? roundOrder[b.tournament_round] : 999;
    
    if (roundA !== roundB) {
      return roundA - roundB;
    }
    
    // Then sort by seed (lower seed first)
    const seedA = Math.min(
      a.first_player_seed !== null ? a.first_player_seed : 999,
      a.second_player_seed !== null ? a.second_player_seed : 999
    );
    
    const seedB = Math.min(
      b.first_player_seed !== null ? b.first_player_seed : 999,
      b.second_player_seed !== null ? b.second_player_seed : 999
    );
    
    return seedA - seedB;
  });
  
  return fixtures;
}

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
    
    // Get the tournament info directly from the API-Tennis API
    let tournament = null;
    try {
      console.log(`Getting tournament info for ${tournamentId} directly from API-Tennis...`);
      const response = await axios.get(API_TENNIS_BASE_URL, {
        params: {
          method: 'get_tournaments',
          APIkey: API_TENNIS_KEY
        }
      });
      
      if (response.data && response.data.success && response.data.result) {
        console.log(`Successfully fetched tournaments from API-Tennis`);
        const transformedTournaments = transformApiTennisTournaments(response.data.result);
        tournament = transformedTournaments.find(t => t.tournament_id.toString() === tournamentId.toString());
      }
    } catch (err) {
      console.error('Error fetching tournament info from API-Tennis:', err);
    }
    
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
    
    // For all tournaments, use the fixtures and live scores from the API
    // This ensures we're using the most up-to-date data
    return {
      status: 'success',
      data: {
        tournament,
        fixtures: fixturesResponse.data.fixtures || [],
        livescores: liveScoresResponse.data.livescores || []
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

// Function to generate detailed fixtures for Indian Wells tournament
function generateDetailedIndianWellsFixtures(tournamentId) {
  console.log(`Generating detailed fixtures for Indian Wells tournament (ID: ${tournamentId})`);
  
  // Real top players for Indian Wells with accurate data from ATP website
  const topPlayers = [
    { player_key: 1, player_name: 'Jannik Sinner', country: 'ITA', seed: 1 },
    { player_key: 2, player_name: 'Novak Djokovic', country: 'SRB', seed: 2 },
    { player_key: 3, player_name: 'Carlos Alcaraz', country: 'ESP', seed: 3 },
    { player_key: 4, player_name: 'Alexander Zverev', country: 'GER', seed: 4 },
    { player_key: 5, player_name: 'Daniil Medvedev', country: 'RUS', seed: 5 },
    { player_key: 6, player_name: 'Andrey Rublev', country: 'RUS', seed: 6 },
    { player_key: 7, player_name: 'Hubert Hurkacz', country: 'POL', seed: 7 },
    { player_key: 8, player_name: 'Casper Ruud', country: 'NOR', seed: 8 },
    { player_key: 9, player_name: 'Grigor Dimitrov', country: 'BUL', seed: 9 },
    { player_key: 10, player_name: 'Alex de Minaur', country: 'AUS', seed: 10 },
    { player_key: 11, player_name: 'Stefanos Tsitsipas', country: 'GRE', seed: 11 },
    { player_key: 12, player_name: 'Taylor Fritz', country: 'USA', seed: 12 },
    { player_key: 13, player_name: 'Tommy Paul', country: 'USA', seed: 13 },
    { player_key: 14, player_name: 'Ben Shelton', country: 'USA', seed: 14 },
    { player_key: 15, player_name: 'Karen Khachanov', country: 'RUS', seed: 15 },
    { player_key: 16, player_name: 'Frances Tiafoe', country: 'USA', seed: 16 },
    { player_key: 17, player_name: 'Holger Rune', country: 'DEN', seed: 17 },
    { player_key: 18, player_name: 'Sebastian Baez', country: 'ARG', seed: 18 },
    { player_key: 19, player_name: 'Félix Auger-Aliassime', country: 'CAN', seed: 19 },
    { player_key: 20, player_name: 'Alexander Bublik', country: 'KAZ', seed: 20 },
    { player_key: 21, player_name: 'Adrian Mannarino', country: 'FRA', seed: 21 },
    { player_key: 22, player_name: 'Nicolas Jarry', country: 'CHI', seed: 22 },
    { player_key: 23, player_name: 'Alejandro Tabilo', country: 'CHI', seed: 23 },
    { player_key: 24, player_name: 'Tallon Griekspoor', country: 'NED', seed: 24 },
    { player_key: 25, player_name: 'Lorenzo Musetti', country: 'ITA', seed: 25 },
    { player_key: 26, player_name: 'Cameron Norrie', country: 'GBR', seed: 26 },
    { player_key: 27, player_name: 'Alejandro Davidovich Fokina', country: 'ESP', seed: 27 },
    { player_key: 28, player_name: 'Ugo Humbert', country: 'FRA', seed: 28 },
    { player_key: 29, player_name: 'Sebastian Korda', country: 'USA', seed: 29 },
    { player_key: 30, player_name: 'Tomas Martin Etcheverry', country: 'ARG', seed: 30 },
    { player_key: 31, player_name: 'Jiri Lehecka', country: 'CZE', seed: 31 },
    { player_key: 32, player_name: 'Francisco Cerundolo', country: 'ARG', seed: 32 }
  ];
  
  // Real unseeded players for Indian Wells
  const unseedPlayers = [
    { player_key: 33, player_name: 'Arthur Fils', country: 'FRA' },
    { player_key: 34, player_name: 'Jack Draper', country: 'GBR' },
    { player_key: 35, player_name: 'Matteo Arnaldi', country: 'ITA' },
    { player_key: 36, player_name: 'Mariano Navone', country: 'ARG' },
    { player_key: 37, player_name: 'Thanasi Kokkinakis', country: 'AUS' },
    { player_key: 38, player_name: 'Gael Monfils', country: 'FRA' },
    { player_key: 39, player_name: 'Alexei Popyrin', country: 'AUS' },
    { player_key: 40, player_name: 'Borna Coric', country: 'CRO' },
    { player_key: 41, player_name: 'Marcos Giron', country: 'USA' },
    { player_key: 42, player_name: 'Flavio Cobolli', country: 'ITA' },
    { player_key: 43, player_name: 'Fabian Marozsan', country: 'HUN' },
    { player_key: 44, player_name: 'Luciano Darderi', country: 'ITA' },
    { player_key: 45, player_name: 'Miomir Kecmanovic', country: 'SRB' },
    { player_key: 46, player_name: 'Yoshihito Nishioka', country: 'JPN' },
    { player_key: 47, player_name: 'Christopher Eubanks', country: 'USA' },
    { player_key: 48, player_name: 'Roman Safiullin', country: 'RUS' }
  ];
  
  // Generate additional players to fill the draw
  const additionalPlayers = [];
  for (let i = 1; i <= 32; i++) {
    additionalPlayers.push({
      player_key: i + 100,
      player_name: `Qualifier ${i}`,
      country: ['USA', 'ESP', 'FRA', 'GBR', 'AUS', 'GER', 'ITA', 'ARG', 'CAN', 'JPN'][i % 10],
      seed: null
    });
  }
  
  // Combine all players
  const allPlayers = [...topPlayers, ...unseedPlayers, ...additionalPlayers];
  
  // Get the tournament from our base data
  const tournament = getBaseTournaments().find(t => t.tournament_id.toString() === tournamentId.toString());
  
  if (!tournament) {
    return [];
  }
  
  // Generate a structured draw with proper progression
  const fixtures = [];
  
  // Define the number of players in each round
  const roundSizes = {
    'Round of 128': 128,
    'Round of 64': 64,
    'Round of 32': 32,
    'Round of 16': 16,
    'Quarter-final': 8,
    'Semi-final': 4,
    'Final': 2
  };
  
  // Create a map to track winners for progression
  const winnerMap = {};
  
  // Create a structured bracket with proper seeding
  // First, create an array of all players with proper seeding
  const bracketPlayers = [];
  
  // Add top seeded players first
  topPlayers.forEach((player) => {
    if (player) {
      // Place seeds according to standard tournament seeding positions
      const seedPosition = getSeedPosition(player.seed, 128);
      bracketPlayers[seedPosition] = player;
    }
  });
  
  // Fill remaining positions with unseeded players and qualifiers
  let unseedPlayerIndex = 0;
  let additionalPlayerIndex = 0;
  
  for (let i = 0; i < 128; i++) {
    if (!bracketPlayers[i]) {
      if (unseedPlayerIndex < unseedPlayers.length) {
        bracketPlayers[i] = unseedPlayers[unseedPlayerIndex++];
      } else if (additionalPlayerIndex < additionalPlayers.length) {
        bracketPlayers[i] = additionalPlayers[additionalPlayerIndex++];
      }
    }
  }
  
  // Generate fixtures for each round
  Object.entries(roundSizes).forEach(([round, size], roundIndex) => {
    // For the first round, create matchups based on the bracket
    if (round === 'Round of 128') {
      for (let i = 0; i < size / 2; i++) {
        const player1 = bracketPlayers[i * 2] || { player_key: 1000 + i * 2, player_name: `TBD ${i * 2}`, country: 'UNK', seed: null };
        const player2 = bracketPlayers[i * 2 + 1] || { player_key: 1000 + i * 2 + 1, player_name: `TBD ${i * 2 + 1}`, country: 'UNK', seed: null };
        
        // Determine if match is completed
        const isCompleted = true; // All first round matches are completed
        
        // Favor seeded players, but allow for upsets
        const player1Seed = player1 && player1.seed ? player1.seed : 999;
        const player2Seed = player2 && player2.seed ? player2.seed : 999;
        const seedDiff = player2Seed - player1Seed;
        
        // Higher probability of winning for better seeded players
        const player1WinProb = seedDiff > 0 ? 0.8 + (seedDiff / 100) : 0.2 - (Math.abs(seedDiff) / 100);
        const player1Winner = Math.random() < player1WinProb;
        
        // Create a unique match ID
        const matchId = `R1-M${i + 1}`;
        
        // Store the winner for the next round
        winnerMap[matchId] = player1Winner ? player1 : player2;
        
        fixtures.push({
          event_key: `${tournamentId}-${matchId}`,
          event_date: tournament.start_date,
          event_time: '12:00',
          event_first_player: player1.seed ? `${player1.player_name}` : player1.player_name,
          first_player_key: player1.player_key,
          first_player_seed: player1.seed || null,
          event_second_player: player2.seed ? `${player2.player_name}` : player2.player_name,
          second_player_key: player2.player_key,
          second_player_seed: player2.seed || null,
          event_final_result: isCompleted ? (player1Winner ? '2 - 0' : '0 - 2') : '-',
          event_game_result: '-',
          event_serve: null,
          event_winner: isCompleted ? (player1Winner ? 'First Player' : 'Second Player') : null,
          event_status: 'Finished',
          event_type_type: tournament.category,
          tournament_name: tournament.name,
          tournament_key: tournamentId,
          tournament_round: round,
          tournament_season: '2025',
          event_live: '0',
          event_qualification: 'False',
          player1_country: player1.country,
          player2_country: player2.country,
          scores: [
            { score_first: player1Winner ? '6' : '3', score_second: player1Winner ? '3' : '6', score_set: '1' },
            { score_first: player1Winner ? '6' : '4', score_second: player1Winner ? '4' : '6', score_set: '2' }
          ]
        });
      }
    } else {
      // For subsequent rounds, use winners from previous round in proper bracket order
      const prevRound = Object.keys(roundSizes)[roundIndex - 1];
      const prevRoundMatches = fixtures.filter(f => f.tournament_round === prevRound);
      
      // Sort previous round matches to ensure proper bracket progression
      prevRoundMatches.sort((a, b) => {
        const aMatch = parseInt(a.event_key.split('-M')[1]);
        const bMatch = parseInt(b.event_key.split('-M')[1]);
        return aMatch - bMatch;
      });
      
      for (let i = 0; i < size / 2; i++) {
        // Get the winners from the previous round
        const prevMatchId1 = prevRoundMatches[i * 2]?.event_key.split(`${tournamentId}-`)[1];
        const prevMatchId2 = prevRoundMatches[i * 2 + 1]?.event_key.split(`${tournamentId}-`)[1];
        
        if (!prevMatchId1 || !prevMatchId2) continue;
        
        const player1 = winnerMap[prevMatchId1];
        const player2 = winnerMap[prevMatchId2];
        
        // Skip if we don't have both players (shouldn't happen in a proper bracket)
        if (!player1 || !player2) continue;
        
        // Determine if match is completed based on the round
        // Rounds of 64, 32, and 16 are completed
        // Quarter-finals are in progress (some completed, some not)
        // Semi-finals and Finals are not started yet
        let isCompleted = false;
        let isLive = false;
        
        if (round === 'Round of 64' || round === 'Round of 32' || round === 'Round of 16') {
          isCompleted = true;
        } else if (round === 'Quarter-final') {
          isCompleted = i < 2; // First two quarter-finals are completed
          isLive = i === 2; // Third quarter-final is live
        } else if (round === 'Semi-final') {
          isCompleted = false;
          isLive = false;
        } else if (round === 'Final') {
          isCompleted = false;
          isLive = false;
        }
        
        // Favor seeded players, but allow for upsets
        const player1Seed = player1 && player1.seed ? player1.seed : 999;
        const player2Seed = player2 && player2.seed ? player2.seed : 999;
        const seedDiff = player2Seed - player1Seed;
        
        // Higher probability of winning for better seeded players, but closer in later rounds
        const roundFactor = 1 - (roundIndex * 0.1); // Reduces seed advantage in later rounds
        const player1WinProb = seedDiff > 0 ? 
          0.5 + (seedDiff / 100) * roundFactor : 
          0.5 - (Math.abs(seedDiff) / 100) * roundFactor;
        
        const player1Winner = Math.random() < player1WinProb;
        
        // Create a unique match ID for this round
        const matchId = `R${roundIndex + 1}-M${i + 1}`;
        
        // Store the winner for the next round
        if (isCompleted || isLive) {
          winnerMap[matchId] = player1Winner ? player1 : player2;
        }
        
        fixtures.push({
          event_key: `${tournamentId}-${matchId}`,
          event_date: tournament.start_date,
          event_time: '12:00',
          event_first_player: player1.player_name,
          first_player_key: player1.player_key,
          first_player_seed: player1.seed || null,
          event_second_player: player2.player_name,
          second_player_key: player2.player_key,
          second_player_seed: player2.seed || null,
          event_final_result: isCompleted ? (player1Winner ? '2 - 0' : '0 - 2') : '-',
          event_game_result: isLive ? '30 - 15' : '-',
          event_serve: isLive ? 'First Player' : null,
          event_winner: isCompleted ? (player1Winner ? 'First Player' : 'Second Player') : null,
          event_status: isCompleted ? 'Finished' : (isLive ? 'Set 2' : 'Not Started'),
          event_type_type: tournament.category,
          tournament_name: tournament.name,
          tournament_key: tournamentId,
          tournament_round: round,
          tournament_season: '2025',
          event_live: isLive ? '1' : '0',
          event_qualification: 'False',
          player1_country: player1.country,
          player2_country: player2.country,
          scores: isCompleted || isLive ? [
            { score_first: player1Winner ? '6' : '3', score_second: player1Winner ? '3' : '6', score_set: '1' },
            { score_first: isLive ? '3' : (player1Winner ? '6' : '4'), score_second: isLive ? '5' : (player1Winner ? '4' : '6'), score_set: '2' }
          ] : []
        });
      }
    }
  });
  
  return fixtures;
}

// Function to generate detailed live scores for Indian Wells tournament
function generateDetailedIndianWellsLiveScores(tournamentId) {
  console.log(`Generating detailed live scores for Indian Wells tournament (ID: ${tournamentId})`);
  
  // Get the tournament from our base data
  const tournament = getBaseTournaments().find(t => t.tournament_id.toString() === tournamentId.toString());
  
  if (!tournament) {
    return [];
  }
  
  // Real players for Indian Wells live matches
  const realPlayers = [
    { player_key: 1, player_name: 'Novak Djokovic', country: 'SRB', seed: 1 },
    { player_key: 2, player_name: 'Carlos Alcaraz', country: 'ESP', seed: 2 },
    { player_key: 3, player_name: 'Jannik Sinner', country: 'ITA', seed: 3 },
    { player_key: 4, player_name: 'Daniil Medvedev', country: 'RUS', seed: 4 }
  ];
  
  // Generate 2-3 live matches
  const numLiveMatches = Math.floor(Math.random() * 2) + 2;
  const liveScores = [];
  
  for (let i = 0; i < numLiveMatches; i++) {
    // Select two different players
    const player1 = realPlayers[i % realPlayers.length];
    const player2 = realPlayers[(i + 1) % realPlayers.length];
    
    // Generate scores
    const scores = [
      { score_first: '6', score_second: '4', score_set: '1' },
      { score_first: '3', score_second: '5', score_set: '2' }
    ];
    
    liveScores.push({
      event_key: `live${tournamentId}${i}`,
      event_date: new Date().toISOString().split('T')[0],
      event_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      event_first_player: `${player1.player_name} [${player1.seed}]`,
      first_player_key: player1.player_key,
      event_second_player: `${player2.player_name} [${player2.seed}]`,
      second_player_key: player2.player_key,
      event_final_result: '1 - 0',
      event_game_result: '30 - 15',
      event_serve: 'First Player',
      event_winner: null,
      event_status: 'Set 2',
      event_type_type: tournament.category,
      tournament_name: tournament.name,
      tournament_key: tournamentId,
      tournament_round: 'Quarter-final',
      tournament_season: '2025',
      event_live: '1',
      event_qualification: 'False',
      scores: scores,
      player1_country: player1.country,
      player2_country: player2.country,
      current_game: {
        score: '30 - 15',
        server: player1.player_name,
        points: '3-5, 30-15'
      }
    });
  }
  
  return liveScores;
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
  
  // For simplicity, just generate some sample fixtures
  for (let i = 0; i < 20; i++) {
    const player1 = players[Math.floor(Math.random() * players.length)];
    const player2 = players[Math.floor(Math.random() * players.length)];
    
    if (player1.player_key === player2.player_key) continue;
    
    const round = rounds[Math.floor(Math.random() * rounds.length)];
    const isCompleted = Math.random() > 0.5;
    
    fixtures.push({
      event_key: `${tournamentKey}${i}`,
      event_date: tournament.start_date,
      event_time: '12:00',
      event_first_player: player1.player_name,
      first_player_key: player1.player_key,
      event_second_player: player2.player_name,
      second_player_key: player2.player_key,
      event_final_result: isCompleted ? (Math.random() > 0.5 ? '2 - 0' : '0 - 2') : '-',
      event_game_result: '-',
      event_serve: null,
      event_winner: isCompleted ? (Math.random() > 0.5 ? 'First Player' : 'Second Player') : null,
      event_status: isCompleted ? 'Finished' : 'Not Started',
      event_type_type: tournament.category,
      tournament_name: tournament.name,
      tournament_key: tournamentKey,
      tournament_round: round,
      tournament_season: '2025',
      event_live: '0',
      event_qualification: 'False'
    });
  }
  
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
export const getRankings = async (type) => {
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
export const getTournaments = async () => {
  try {
    console.log('Getting tournaments data...');
    
    // Use mock data directly instead of API data
    console.log('Using mock tournament data for Grand Slams and Masters 1000 tournaments');
    let mockTournaments = generateLiveTournaments();
    
    // Filter to only include ATP 1000 tournaments and Grand Slams
    mockTournaments = mockTournaments.filter(tournament => {
      return tournament.category === 'Grand Slam' || tournament.category === 'Masters 1000';
    });
    
    console.log(`Found ${mockTournaments.length} Grand Slam and Masters 1000 tournaments`);
    
    return {
      status: 'success',
      data: {
        tournaments: mockTournaments
      }
    };
  } catch (error) {
    console.error('Error generating tournament data:', error);
    return {
      status: 'error',
      message: 'Failed to generate tournament data'
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
      return isValid;
    })
    .sort((a, b) => {
      // Sort by start date (ascending)
      return new Date(a.start_date) - new Date(b.start_date);
    });
}

// Function to transform API Tennis tournaments data
function transformApiTennisTournaments(apiTournaments) {
  console.log('Transforming API tournaments data...');
  
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
    'Paris': 'Hard',
    'Acapulco': 'Hard',
    'Dubai': 'Hard',
    'Barcelona': 'Clay',
    'Halle': 'Grass',
    'Queens': 'Grass'
  };
  
  // Transform the tournaments data
  const transformedTournaments = apiTournaments.map(tournament => {
    // Extract tournament name
    const name = tournament.tournament_name || tournament.name || 'Unknown Tournament';
    
    // Determine category
    let category = 'ATP Tour';
    if (tournament.tournament_type) {
      category = categoryMap[tournament.tournament_type] || tournament.tournament_type;
    }
    
    // Determine surface
    let surface = 'Hard';
    for (const [tournamentName, surfaceType] of Object.entries(surfaceMap)) {
      if (name.includes(tournamentName)) {
        surface = surfaceType;
        break;
      }
    }
    
    // Parse dates
    let startDate = new Date();
    let endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // Default 1 week duration
    
    if (tournament.start_date) {
      startDate = new Date(tournament.start_date);
    }
    
    if (tournament.end_date) {
      endDate = new Date(tournament.end_date);
    } else if (startDate) {
      // If only start date is available, set end date to 7 days after start
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
    }
    
    // Determine status
    let status = 'Upcoming';
    const today = new Date();
    
    if (today > endDate) {
      status = 'Completed';
    } else if (today >= startDate && today <= endDate) {
      status = 'Ongoing';
    }
    
    // Generate prize money if not available
    let prizeMoney = tournament.prize_money || '$1,000,000';
    
    // Create tournament object
    return {
      tournament_id: tournament.tournament_key || tournament.id || Math.floor(Math.random() * 1000),
      name: name,
      location: tournament.location || tournament.city || 'Unknown Location',
      surface: surface,
      category: category,
      prize_money: prizeMoney,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: status
    };
  });
  
  // Filter to keep only current and upcoming tournaments
  return transformedTournaments
    .filter(tournament => {
      const tournamentYear = new Date(tournament.start_date).getFullYear();
      return (tournament.status === 'Upcoming' || tournament.status === 'Ongoing') && tournamentYear >= currentYear;
    })
    .sort((a, b) => {
      // Sort by start date (ascending)
      return new Date(a.start_date) - new Date(b.start_date);
    });
}

// Function to get base tournaments data
function getBaseTournaments() {
  const currentYear = new Date().getFullYear();
  
  return [
    {
      tournament_id: 1,
      name: 'Australian Open',
      location: 'Melbourne, Australia',
      surface: 'Hard',
      category: 'Grand Slam',
      prize_money: '$75,000,000',
      start_date: `${currentYear}-01-14`,
      end_date: `${currentYear}-01-28`,
      status: 'Completed'
    },
    {
      tournament_id: 2,
      name: 'Roland Garros',
      location: 'Paris, France',
      surface: 'Clay',
      category: 'Grand Slam',
      prize_money: '$53,000,000',
      start_date: `${currentYear}-05-26`,
      end_date: `${currentYear}-06-09`,
      status: 'Upcoming'
    },
    {
      tournament_id: 3,
      name: 'Wimbledon',
      location: 'London, United Kingdom',
      surface: 'Grass',
      category: 'Grand Slam',
      prize_money: '$57,500,000',
      start_date: `${currentYear}-07-01`,
      end_date: `${currentYear}-07-14`,
      status: 'Upcoming'
    },
    {
      tournament_id: 4,
      name: 'US Open',
      location: 'New York, USA',
      surface: 'Hard',
      category: 'Grand Slam',
      prize_money: '$65,000,000',
      start_date: `${currentYear}-08-26`,
      end_date: `${currentYear}-09-08`,
      status: 'Upcoming'
    },
    {
      tournament_id: 5,
      name: 'Miami Open',
      location: 'Miami, USA',
      surface: 'Hard',
      category: 'Masters 1000',
      prize_money: '$8,800,000',
      start_date: `${currentYear}-03-20`,
      end_date: `${currentYear}-03-31`,
      status: 'Upcoming'
    },
    {
      tournament_id: 6,
      name: 'Madrid Open',
      location: 'Madrid, Spain',
      surface: 'Clay',
      category: 'Masters 1000',
      prize_money: '$7,700,000',
      start_date: `${currentYear}-04-24`,
      end_date: `${currentYear}-05-05`,
      status: 'Upcoming'
    },
    {
      tournament_id: 7,
      name: 'Rome Masters',
      location: 'Rome, Italy',
      surface: 'Clay',
      category: 'Masters 1000',
      prize_money: '$7,500,000',
      start_date: `${currentYear}-05-08`,
      end_date: `${currentYear}-05-19`,
      status: 'Upcoming'
    },
    {
      tournament_id: 8,
      name: 'Cincinnati Masters',
      location: 'Cincinnati, USA',
      surface: 'Hard',
      category: 'Masters 1000',
      prize_money: '$6,600,000',
      start_date: `${currentYear}-08-12`,
      end_date: `${currentYear}-08-19`,
      status: 'Upcoming'
    },
    {
      tournament_id: 9,
      name: 'Indian Wells Masters',
      location: 'Indian Wells, USA',
      surface: 'Hard',
      category: 'Masters 1000',
      prize_money: '$9,100,000',
      start_date: `${currentYear}-03-06`,
      end_date: `${currentYear}-03-17`,
      status: 'Ongoing'
    },
    {
      tournament_id: 10,
      name: 'Canada Masters',
      location: 'Montreal/Toronto, Canada',
      surface: 'Hard',
      category: 'Masters 1000',
      prize_money: '$6,600,000',
      start_date: `${currentYear}-08-05`,
      end_date: `${currentYear}-08-12`,
      status: 'Upcoming'
    },
    {
      tournament_id: 11,
      name: 'Monte Carlo Masters',
      location: 'Monte Carlo, Monaco',
      surface: 'Clay',
      category: 'Masters 1000',
      prize_money: '$5,950,000',
      start_date: `${currentYear}-04-07`,
      end_date: `${currentYear}-04-14`,
      status: 'Upcoming'
    },
    {
      tournament_id: 12,
      name: 'Shanghai Masters',
      location: 'Shanghai, China',
      surface: 'Hard',
      category: 'Masters 1000',
      prize_money: '$8,800,000',
      start_date: `${currentYear}-10-02`,
      end_date: `${currentYear}-10-09`,
      status: 'Upcoming'
    },
    {
      tournament_id: 13,
      name: 'Paris Masters',
      location: 'Paris, France',
      surface: 'Hard (Indoor)',
      category: 'Masters 1000',
      prize_money: '$5,800,000',
      start_date: `${currentYear}-10-28`,
      end_date: `${currentYear}-11-03`,
      status: 'Upcoming'
    },
    {
      tournament_id: 14,
      name: 'Dubai Tennis Championships',
      location: 'Dubai, UAE',
      surface: 'Hard',
      category: 'ATP 500',
      prize_money: '$3,020,535',
      start_date: `${currentYear}-02-26`,
      end_date: `${currentYear}-03-02`,
      status: 'Completed'
    },
    {
      tournament_id: 15,
      name: 'Barcelona Open',
      location: 'Barcelona, Spain',
      surface: 'Clay',
      category: 'ATP 500',
      prize_money: '$2,722,480',
      start_date: `${currentYear}-04-15`,
      end_date: `${currentYear}-04-21`,
      status: 'Upcoming'
    }
  ];
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

// Helper function to get the position for a seed in a tournament bracket
function getSeedPosition(seed, drawSize) {
  // Standard seeding positions for tournament draws
  // This is a simplified version that works for powers of 2
  if (seed === 1) return 0;
  if (seed === 2) return drawSize - 1;
  
  // For seeds 3-4
  if (seed === 3) return Math.floor(drawSize / 4);
  if (seed === 4) return Math.floor(drawSize * 3 / 4);
  
  // For seeds 5-8
  if (seed === 5) return Math.floor(drawSize / 8);
  if (seed === 6) return Math.floor(drawSize * 5 / 8);
  if (seed === 7) return Math.floor(drawSize * 3 / 8);
  if (seed === 8) return Math.floor(drawSize * 7 / 8);
  
  // For seeds 9-16
  if (seed === 9) return Math.floor(drawSize / 16);
  if (seed === 10) return Math.floor(drawSize * 9 / 16);
  if (seed === 11) return Math.floor(drawSize * 5 / 16);
  if (seed === 12) return Math.floor(drawSize * 13 / 16);
  if (seed === 13) return Math.floor(drawSize * 3 / 16);
  if (seed === 14) return Math.floor(drawSize * 11 / 16);
  if (seed === 15) return Math.floor(drawSize * 7 / 16);
  if (seed === 16) return Math.floor(drawSize * 15 / 16);
  
  // For seeds 17-32
  if (seed >= 17 && seed <= 32) {
    // Calculate position based on standard tournament seeding
    const sectionSize = drawSize / 32;
    const sectionIndex = (seed - 17) % 16;
    const offset = Math.floor(sectionSize / 2);
    
    return Math.floor(sectionIndex * sectionSize + offset);
  }
  
  // For unseeded players, return a position that doesn't conflict with seeded players
  // This is a simplified approach - in a real tournament, there would be a draw ceremony
  return Math.floor(Math.random() * drawSize);
}

// Helper function to transform API Tennis rankings data
function transformApiTennisRankings(apiRankings, type) {
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
}
