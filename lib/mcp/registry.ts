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
 * Subset exposed to the chatbot. The MCP server still serves every tool; a model
 * just picks more reliably from a short menu than from thirteen options, and each
 * schema costs tokens on every single request.
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

/** Per-item fields dropped first when a list is too long for the model's budget. */
const DETAIL_FIELDS = ['highlights', 'description', 'caseStudy'];

/** Inside objects, `null`, `""` and `[]` carry nothing - don't pay tokens for them. */
function dropEmpty(this: unknown, _key: string, value: unknown) {
  if (Array.isArray(this)) return value;
  if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return undefined;
  }
  return value;
}

/**
 * Handlers pretty-print JSON for MCP clients, but the chatbot re-sends every tool
 * result on each round against a per-minute token budget. Re-serialise compactly,
 * and if a list still doesn't fit, drop per-item detail rather than cutting the
 * list off: plain truncation used to hide ten of the fourteen projects.
 */
function fitForModel(text: string, maxChars: number): string {
  const start = text.search(/[[{]/);
  if (start === -1) return text.slice(0, maxChars);

  let value: unknown;
  try {
    value = JSON.parse(text.slice(start));
  } catch {
    return text.slice(0, maxChars);
  }

  const header = text.slice(0, start).trim();
  let out = `${header}\n${JSON.stringify(value, dropEmpty)}`;

  if (out.length > maxChars && Array.isArray(value)) {
    const slim = value.map((item) =>
      item && typeof item === 'object'
        ? Object.fromEntries(Object.entries(item).filter(([key]) => !DETAIL_FIELDS.includes(key)))
        : item
    );
    out = `${header} (per-item details omitted to fit; ask about one item to get them)\n${JSON.stringify(slim, dropEmpty)}`;
  }

  return out.length > maxChars ? `${out.slice(0, maxChars)}... [truncated]` : out;
}

/**
 * Run one tool and flatten its MCP result down to compact text for the model.
 * Never throws: a failed tool comes back as a message the model can react to.
 */
export async function callTool(
  name: string,
  args: Record<string, unknown>,
  maxChars = 5000
): Promise<string> {
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

    return text ? fitForModel(text, maxChars) : 'The tool returned no content.';
  } catch (error) {
    return `Error running "${name}": ${error instanceof Error ? error.message : 'unknown error'}`;
  }
}
