/**
 * MCP Server API Route
 * Provides Model Context Protocol server for AI chatbot
 * with dynamic access to portfolio data
 *
 * This route handles different MCP transports (mcp, sse, message)
 * via the [transport] dynamic segment
 */

import { createMcpHandler } from 'mcp-handler';
import { registerAllTools } from '@/lib/mcp';

/**
 * Create MCP handler with all portfolio tools
 */
const handler = createMcpHandler(
  (server) => {
    // Register all tools (projects, skills, experience, contact, etc.)
    registerAllTools(server);
  },
  {},
  {
    // Handler options
    basePath: '/api',
    verboseLogs: true,
    maxDuration: 60,
  }
);

// Export HTTP methods for all transports
export { handler as GET, handler as POST, handler as DELETE };
