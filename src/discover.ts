/**
 * Discover MCP servers from common configuration files.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export interface ServerInfo {
  name: string;
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  transport: "http" | "sse" | "stdio";
}

/**
 * Discover configured MCP servers from Claude Desktop, Cursor, and other clients.
 *
 * @example
 * ```typescript
 * const servers = discover();
 * for (const info of servers) {
 *   console.log(`${info.name}: ${info.url || info.command}`);
 * }
 * ```
 */
export function discover(): ServerInfo[] {
  const servers: ServerInfo[] = [];

  // Claude Desktop config
  const claudePaths = [
    join(homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json"),
    join(homedir(), ".config", "claude", "claude_desktop_config.json"),
    join(homedir(), "AppData", "Roaming", "Claude", "claude_desktop_config.json"),
  ];

  for (const configPath of claudePaths) {
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, "utf-8"));
        const mcpServers = config.mcpServers || {};

        for (const [name, server] of Object.entries(mcpServers)) {
          const s = server as Record<string, unknown>;
          if (s.url) {
            servers.push({
              name,
              url: s.url as string,
              transport: "http",
            });
          } else if (s.command) {
            servers.push({
              name,
              command: s.command as string,
              args: (s.args as string[]) || [],
              env: s.env as Record<string, string> | undefined,
              transport: "stdio",
            });
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
  }

  return servers;
}
