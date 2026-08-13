/**
 * Shared tool registry.
 *
 * The MCP tools are declared once, inline, in `tools/*.ts` via `server.tool(...)`.
 * Rather than duplicating those declarations for the chatbot, we replay
 * `registerAllTools` against a capture object that records them instead of
 * registering them. The MCP server and the chatbot therefore always expose
 * exactly the same tools - they cannot drift apart.
 */

import { z } from 'zod';
import { registerAllTools } from './index';

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

interface CapturedTool {
  name: string;
  description: string;
  /** Raw zod shape as passed to `server.tool` */
  shape: Record<string, z.ZodTypeAny>;
  handler: ToolHandler;
}

let cache: CapturedTool[] | null = null;

function captureTools(): CapturedTool[] {
  if (cache) return cache;

  const captured: CapturedTool[] = [];
  const recorder = {
    tool(
      name: string,
      description: string,
      shape: Record<string, z.ZodTypeAny>,
      handler: ToolHandler
    ) {
      captured.push({ name, description, shape, handler });
    },
  };

  // The recorder only needs `.tool()`; the real McpServer type is much wider.
  registerAllTools(recorder as never);

  cache = captured;
  return captured;
}

/**
 * Subset exposed to the chatbot. The MCP server still serves every tool; a 70B
 * model just picks more reliably from a short menu than from thirteen options,
 * and each schema costs tokens on every single request.
 */
const CHAT_TOOLS = [
  'get_projects',
  'get_project_details',
  'get_skills',
  'get_experience',
  'get_certificates',
  'search_portfolio',
  'get_contact_info',
] as const;

/** Tool definitions in the OpenAI/Groq function-calling format. */
export function getGroqTools() {
  return captureTools()
    .filter((tool) => (CHAT_TOOLS as readonly string[]).includes(tool.name))
    .map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: z.toJSONSchema(z.object(tool.shape)),
      },
    }));
}

export function getToolNames(): string[] {
  return captureTools().map((t) => t.name);
}

/**
 * Run one tool and flatten its MCP result down to plain text for the model.
 * Never throws: a failed tool comes back as a message the model can react to.
 */
export async function callTool(name: string, args: Record<string, unknown>): Promise<string> {
  const tool = captureTools().find((t) => t.name === name);
  if (!tool) {
    return `Error: unknown tool "${name}".`;
  }

  try {
    // Validate/coerce with the tool's own schema so handlers get what they expect.
    const parsed = z
      .object(tool.shape)
      .partial()
      .parse(args ?? {});
    const result = (await tool.handler(parsed)) as {
      content?: Array<{ type: string; text?: string }>;
    };

    const text = (result?.content ?? [])
      .filter((part) => part.type === 'text' && part.text)
      .map((part) => part.text)
      .join('\n');

    return text || 'The tool returned no content.';
  } catch (error) {
    return `Error running "${name}": ${error instanceof Error ? error.message : 'unknown error'}`;
  }
}
