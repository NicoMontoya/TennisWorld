/**
 * MCP Proxy Server
 * 
 * This file provides a simple proxy server that allows our backend to directly
 * use the MCP tools from the tennis-api server.
 */

import express from 'express';
import cors from 'cors';
import { use_mcp_tool } from './mcpToolWrapper.js';

// Create Express app for the MCP proxy
const app = express();
const PORT = process.env.MCP_PROXY_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Route to handle MCP tool requests
app.post('/api/mcp/:server/:tool', async (req, res) => {
  try {
    const { server, tool } = req.params;
    const args = req.body;
    
    console.log(`MCP Proxy: Calling ${server}/${tool} with arguments:`, args);
    
    // Call the MCP tool
    const result = await use_mcp_tool(server, tool, args);
    
    // Return the result
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('MCP Proxy Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start the server
const startMcpProxy = () => {
  app.listen(PORT, () => {
    console.log(`MCP Proxy server running on port ${PORT}`);
  });
};

export default startMcpProxy;
