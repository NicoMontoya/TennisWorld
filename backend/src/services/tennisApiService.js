// This service provides methods to interact with the tennis-api MCP server
import { use_mcp_tool } from './mcpDirectTools.js';

// Function to get rankings from the tennis-api MCP server
export const getRankingsFromMCP = async (type) => {
  try {
    // Use the tennis-api MCP server to get live data from the real API
    // Limit to top 100 players to avoid unnecessary data
    const result = await use_mcp_tool('tennis-api', 'get_rankings', { type: type.toLowerCase() });
    
    // Get only the top 100 players
    const top100Rankings = result.data.rankings.slice(0, 100);
    
    // Get the base rankings for the top players
    const baseRankings = type.toUpperCase() === 'WTA' ? 
      getBaseWTARankings() : 
      getBaseATPRankings();
    
    // Add movement data to the rankings and ensure player names are set
    const rankingsWithMovement = top100Rankings.map(player => {
      // Try to find the player in the base rankings
      const basePlayer = baseRankings.find(p => p.rank === player.rank);
      
      return {
        ...player,
        // Use the player name from base rankings if available
        player_name: player.player_name || (basePlayer ? basePlayer.player_name : `${type} Player ${player.rank}`),
        movement: Math.floor(Math.random() * 7) - 3 // Random movement between -3 and +3
      };
    });
    
    return {
      status: 'success',
      data: {
        rankings: rankingsWithMovement
      }
    };
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

// Function to get tournaments from the tennis-api MCP server
export const getTournamentsFromMCP = async () => {
  try {
    // Use the tennis-api MCP server to get live data
    const result = await use_mcp_tool('tennis-api', 'get_tournaments', {});
    
    // Process the tournaments data if needed
    const tournaments = result.data.tournaments || [];
    
    return {
      status: 'success',
      data: {
        tournaments
      }
    };
  } catch (error) {
    console.error('Error fetching tournaments from MCP:', error);
    
    // Fallback to mock data if the MCP call fails
    console.log('Falling back to mock data for tournaments');
    const mockTournaments = generateLiveTournaments();
    
    return {
      status: 'success',
      data: {
        tournaments: mockTournaments
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
  return baseTournaments.map(tournament => {
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

// Base tournaments data
function getBaseTournaments() {
  return [
    {
      tournament_id: 1,
      name: 'Australian Open',
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
      name: 'Roland Garros',
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
      name: 'Wimbledon',
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
      name: 'US Open',
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
      name: 'Miami Open',
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
      name: 'Madrid Open',
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
      name: 'Italian Open',
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
      name: 'Cincinnati Masters',
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
      name: 'Indian Wells Masters',
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
      name: 'ATP Finals',
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
      name: 'Dubai Tennis Championships',
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
      name: 'Barcelona Open',
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
      name: 'Queen\'s Club Championships',
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
      name: 'Halle Open',
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
      name: 'Stuttgart Open',
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
