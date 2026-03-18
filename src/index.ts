/**
 * mcpx - The simplest way to connect to MCP servers.
 *
 * @example
 * ```typescript
 * import { connect } from "mcpx";
 *
 * const server = await connect("http://localhost:3000/mcp");
 * const result = await server.callTool("search", { query: "hello" });
 * ```
 */

export { connect, connectStdio, type MCPServer } from "./client.js";
export { discover, type ServerInfo } from "./discover.js";
export type { Tool, Resource, Prompt } from "./types.js";
