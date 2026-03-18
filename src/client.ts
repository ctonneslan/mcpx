import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type {
  Tool,
  Resource,
  Prompt,
  ToolResult,
  ResourceContent,
  PromptMessage,
} from "./types.js";

export interface ConnectOptions {
  /** Client name sent during initialization */
  name?: string;
  /** Client version */
  version?: string;
  /** Additional headers for HTTP transports */
  headers?: Record<string, string>;
  /** Transport type override: "http" | "sse" | auto-detect */
  transport?: "http" | "sse";
  /** Timeout in milliseconds for the connection */
  timeout?: number;
}

export interface StdioOptions {
  /** Client name */
  name?: string;
  /** Client version */
  version?: string;
  /** Environment variables for the child process */
  env?: Record<string, string>;
}

/**
 * A connected MCP server with a simple, ergonomic API.
 */
export class MCPServer {
  private _client: Client;
  private _tools: Tool[] | null = null;
  private _resources: Resource[] | null = null;
  private _prompts: Prompt[] | null = null;

  constructor(client: Client) {
    this._client = client;
  }

  /**
   * List all available tools.
   */
  async tools(): Promise<Tool[]> {
    if (this._tools) return this._tools;
    const result = await this._client.listTools();
    this._tools = result.tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema as Record<string, unknown>,
    }));
    return this._tools;
  }

  /**
   * List all available resources.
   */
  async resources(): Promise<Resource[]> {
    if (this._resources) return this._resources;
    const result = await this._client.listResources();
    this._resources = result.resources.map((r) => ({
      uri: r.uri,
      name: r.name,
      description: r.description,
      mimeType: r.mimeType,
    }));
    return this._resources;
  }

  /**
   * List all available prompts.
   */
  async prompts(): Promise<Prompt[]> {
    if (this._prompts) return this._prompts;
    const result = await this._client.listPrompts();
    this._prompts = result.prompts.map((p) => ({
      name: p.name,
      description: p.description,
      arguments: p.arguments,
    }));
    return this._prompts;
  }

  /**
   * Call a tool by name with the given arguments.
   *
   * @example
   * ```typescript
   * const result = await server.callTool("search", { query: "hello" });
   * console.log(result.content[0].text);
   * ```
   */
  async callTool(
    name: string,
    args: Record<string, unknown> = {}
  ): Promise<ToolResult> {
    const result = await this._client.callTool({
      name,
      arguments: args,
    });
    return result as ToolResult;
  }

  /**
   * Read a resource by URI.
   *
   * @example
   * ```typescript
   * const content = await server.readResource("file:///README.md");
   * console.log(content[0].text);
   * ```
   */
  async readResource(uri: string): Promise<ResourceContent[]> {
    const result = await this._client.readResource({ uri });
    return result.contents.map((c) => ({
      uri: c.uri,
      text: "text" in c ? c.text : undefined,
      blob: "blob" in c ? c.blob : undefined,
      mimeType: c.mimeType,
    }));
  }

  /**
   * Get a prompt by name with the given arguments.
   *
   * @example
   * ```typescript
   * const messages = await server.getPrompt("review", { code: "..." });
   * ```
   */
  async getPrompt(
    name: string,
    args: Record<string, string> = {}
  ): Promise<PromptMessage[]> {
    const result = await this._client.getPrompt({
      name,
      arguments: args,
    });
    return result.messages.map((m) => ({
      role: m.role,
      content: m.content as PromptMessage["content"],
    }));
  }

  /**
   * Get tools formatted for OpenAI's function calling API.
   *
   * @example
   * ```typescript
   * const tools = await server.toolsForOpenAI();
   * const response = await openai.chat.completions.create({
   *   model: "gpt-4o",
   *   messages,
   *   tools,
   * });
   * ```
   */
  async toolsForOpenAI(): Promise<
    Array<{
      type: "function";
      function: { name: string; description: string; parameters: unknown };
    }>
  > {
    const tools = await this.tools();
    return tools.map((t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description || "",
        parameters: t.inputSchema || { type: "object", properties: {} },
      },
    }));
  }

  /**
   * Get tools formatted for Anthropic's tool use API.
   *
   * @example
   * ```typescript
   * const tools = await server.toolsForAnthropic();
   * const response = await anthropic.messages.create({
   *   model: "claude-sonnet-4-20250514",
   *   messages,
   *   tools,
   * });
   * ```
   */
  async toolsForAnthropic(): Promise<
    Array<{
      name: string;
      description: string;
      input_schema: unknown;
    }>
  > {
    const tools = await this.tools();
    return tools.map((t) => ({
      name: t.name,
      description: t.description || "",
      input_schema: t.inputSchema || { type: "object", properties: {} },
    }));
  }

  /**
   * Get tools formatted for Google Gemini's function calling API.
   *
   * @example
   * ```typescript
   * const tools = await server.toolsForGemini();
   * const response = await ai.models.generateContent({
   *   model: "gemini-2.5-flash",
   *   contents: [{ role: "user", parts: [{ text: "What's the weather?" }] }],
   *   tools: [{ functionDeclarations: tools }],
   * });
   * ```
   */
  async toolsForGemini(): Promise<
    Array<{
      name: string;
      description: string;
      parameters: unknown;
    }>
  > {
    const tools = await this.tools();
    return tools.map((t) => ({
      name: t.name,
      description: t.description || "",
      parameters: t.inputSchema || { type: "object", properties: {} },
    }));
  }

  /**
   * Disconnect from the server.
   */
  async close(): Promise<void> {
    await this._client.close();
  }
}

/**
 * Connect to an MCP server over HTTP (Streamable HTTP or SSE).
 *
 * @example
 * ```typescript
 * const server = await connect("http://localhost:3000/mcp");
 * const tools = await server.tools();
 * ```
 */
export async function connect(
  url: string,
  options: ConnectOptions = {}
): Promise<MCPServer> {
  const {
    name = "mcpx",
    version = "0.1.0",
    headers,
    transport: transportType,
    timeout = 30000,
  } = options;

  const client = new Client({ name, version });

  let transport;

  if (transportType === "sse") {
    transport = new SSEClientTransport(new URL(url), {
      requestInit: headers ? { headers } : undefined,
    });
  } else {
    // Default to Streamable HTTP (recommended), fall back to SSE
    try {
      transport = new StreamableHTTPClientTransport(new URL(url), {
        requestInit: headers ? { headers } : undefined,
      });
      await client.connect(transport);
      return new MCPServer(client);
    } catch {
      // Fall back to SSE transport
      transport = new SSEClientTransport(new URL(url), {
        requestInit: headers ? { headers } : undefined,
      });
    }
  }

  await client.connect(transport);
  return new MCPServer(client);
}

/**
 * Connect to an MCP server over stdio (local process).
 *
 * @example
 * ```typescript
 * const server = await connectStdio("npx", ["-y", "@modelcontextprotocol/server-filesystem", "/"]);
 * const resources = await server.resources();
 * ```
 */
export async function connectStdio(
  command: string,
  args: string[] = [],
  options: StdioOptions = {}
): Promise<MCPServer> {
  const { name = "mcpx", version = "0.1.0", env } = options;

  const client = new Client({ name, version });

  const transport = new StdioClientTransport({
    command,
    args,
    env: env ? { ...process.env, ...env } as Record<string, string> : undefined,
  });

  await client.connect(transport);
  return new MCPServer(client);
}
