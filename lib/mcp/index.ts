/**
 * MCP Tools Index
 * Central export for all MCP tools
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerActionTools } from './tools/action-tools';
import { registerPortfolioTools } from './tools/portfolio-tools';

/**
 * Register all MCP tools with the server
 */
export function registerAllTools(server: McpServer) {
  // Register portfolio tools (projects, skills, experience, etc.)
  registerPortfolioTools(server);

  // Register action tools (contact, navigation, search, etc.)
  registerActionTools(server);
}

// Re-export tool registration functions for selective use
export { registerActionTools, registerPortfolioTools };
