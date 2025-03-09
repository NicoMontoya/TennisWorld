/**
 * MCP Client for Tennis API
 * 
 * This file provides functions to interact with the tennis-api MCP server.
 * It uses the MCP tools directly to fetch data from the tennis-api server.
 */

// Import axios for making HTTP requests to the MCP server
import axios from 'axios';

// MCP server configuration
const MCP_SERVER_URL = 'http://localhost:3001'; // Adjust this to the actual MCP server URL

/**
 * Get rankings from the tennis-api MCP server
 * @param {string} type - The type of rankings to fetch (ATP or WTA)
 * @returns {Promise<Array>} - A promise that resolves to an array of player rankings
 */
export const getMcpRankings = async (type) => {
  try {
    // Make a direct call to the tennis-api MCP server
    const response = await axios.post(`${MCP_SERVER_URL}/api/mcp/tennis-api/get_rankings`, {
      type: type.toLowerCase()
    });
    
    // Check if the response is valid
    if (response.data && response.data.success && response.data.result) {
      return response.data.result;
    }
    
    throw new Error('Invalid response from MCP server');
  } catch (error) {
    console.error('Error fetching rankings from MCP server:', error);
    throw error;
  }
};

/**
 * Get tournaments from the tennis-api MCP server
 * @returns {Promise<Array>} - A promise that resolves to an array of tournaments
 */
export const getMcpTournaments = async () => {
  try {
    // Make a direct call to the tennis-api MCP server
    const response = await axios.post(`${MCP_SERVER_URL}/api/mcp/tennis-api/get_tournaments`, {});
    
    // Check if the response is valid
    if (response.data && response.data.success && response.data.result) {
      return response.data.result;
    }
    
    throw new Error('Invalid response from MCP server');
  } catch (error) {
    console.error('Error fetching tournaments from MCP server:', error);
    throw error;
  }
};

/**
 * Get player information from the tennis-api MCP server
 * @param {number} playerId - The ID of the player to fetch
 * @returns {Promise<Object>} - A promise that resolves to a player object
 */
export const getMcpPlayerInfo = async (playerId) => {
  try {
    // Make a direct call to the tennis-api MCP server
    const response = await axios.post(`${MCP_SERVER_URL}/api/mcp/tennis-api/get_player_info`, {
      player_key: playerId
    });
    
    // Check if the response is valid
    if (response.data && response.data.success && response.data.result) {
      return response.data.result;
    }
    
    throw new Error('Invalid response from MCP server');
  } catch (error) {
    console.error('Error fetching player info from MCP server:', error);
    throw error;
  }
};

/**
 * Get head-to-head statistics between two players from the tennis-api MCP server
 * @param {number} firstPlayerId - The ID of the first player
 * @param {number} secondPlayerId - The ID of the second player
 * @returns {Promise<Object>} - A promise that resolves to a head-to-head statistics object
 */
export const getMcpHeadToHead = async (firstPlayerId, secondPlayerId) => {
  try {
    // Make a direct call to the tennis-api MCP server
    const response = await axios.post(`${MCP_SERVER_URL}/api/mcp/tennis-api/get_head_to_head`, {
      first_player_key: firstPlayerId,
      second_player_key: secondPlayerId
    });
    
    // Check if the response is valid
    if (response.data && response.data.success && response.data.result) {
      return response.data.result;
    }
    
    throw new Error('Invalid response from MCP server');
  } catch (error) {
    console.error('Error fetching head-to-head stats from MCP server:', error);
    throw error;
  }
};

/**
 * Get matches for a specific date range from the tennis-api MCP server
 * @param {string} startDate - The start date in YYYY-MM-DD format
 * @param {string} endDate - The end date in YYYY-MM-DD format (optional)
 * @returns {Promise<Array>} - A promise that resolves to an array of matches
 */
export const getMcpMatches = async (startDate, endDate) => {
  try {
    const params = {
      date_start: startDate
    };
    
    if (endDate) {
      params.date_stop = endDate;
    }
    
    // Make a direct call to the tennis-api MCP server
    const response = await axios.post(`${MCP_SERVER_URL}/api/mcp/tennis-api/get_matches`, params);
    
    // Check if the response is valid
    if (response.data && response.data.success && response.data.result) {
      return response.data.result;
    }
    
    throw new Error('Invalid response from MCP server');
  } catch (error) {
    console.error('Error fetching matches from MCP server:', error);
    throw error;
  }
};
