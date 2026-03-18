#!/usr/bin/env node

/**
 * mcpwire CLI - interact with MCP servers from the terminal.
 *
 * Usage:
 *   npx mcpwire <url> tools          # List available tools
 *   npx mcpwire <url> call <tool>     # Call a tool
 *   npx mcpwire <url> resources       # List resources
 *   npx mcpwire discover              # Find configured servers
 */

import { connect, connectStdio, discover } from "../index.js";

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
  console.log(`
mcpwire - interact with MCP servers from the terminal

Usage:
  mcpwire <url> tools                List available tools
  mcpwire <url> call <name> [json]   Call a tool with optional JSON args
  mcpwire <url> resources            List available resources
  mcpwire <url> read <uri>           Read a resource
  mcpwire <url> prompts              List available prompts
  mcpwire discover                   Find configured MCP servers

Examples:
  mcpwire http://localhost:3000/mcp tools
  mcpwire http://localhost:3000/mcp call get_weather '{"city":"NYC"}'
  mcpwire discover
`);
  process.exit(0);
}

async function main() {
  if (args[0] === "discover") {
    const servers = discover();
    if (servers.length === 0) {
      console.log("No configured MCP servers found.");
      return;
    }
    console.log(`Found ${servers.length} server(s):\n`);
    for (const s of servers) {
      console.log(`  ${s.name}`);
      console.log(`    Transport: ${s.transport}`);
      if (s.url) console.log(`    URL: ${s.url}`);
      if (s.command) console.log(`    Command: ${s.command} ${(s.args || []).join(" ")}`);
      console.log();
    }
    return;
  }

  const url = args[0];
  const command = args[1];

  if (!url || !command) {
    console.error("Usage: mcpwire <url> <command>");
    process.exit(1);
  }

  let server;
  try {
    server = await connect(url);
  } catch (e) {
    console.error(`Failed to connect to ${url}: ${(e as Error).message}`);
    process.exit(1);
  }

  try {
    switch (command) {
      case "tools": {
        const tools = await server.tools();
        if (tools.length === 0) {
          console.log("No tools available.");
        } else {
          console.log(`${tools.length} tool(s):\n`);
          for (const t of tools) {
            console.log(`  ${t.name}`);
            if (t.description) console.log(`    ${t.description}`);
            console.log();
          }
        }
        break;
      }

      case "call": {
        const toolName = args[2];
        if (!toolName) {
          console.error("Usage: mcpwire <url> call <tool-name> [json-args]");
          process.exit(1);
        }
        const toolArgs = args[3] ? JSON.parse(args[3]) : {};
        const result = await server.callTool(toolName, toolArgs);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case "resources": {
        const resources = await server.resources();
        if (resources.length === 0) {
          console.log("No resources available.");
        } else {
          console.log(`${resources.length} resource(s):\n`);
          for (const r of resources) {
            console.log(`  ${r.uri}`);
            if (r.name) console.log(`    Name: ${r.name}`);
            if (r.description) console.log(`    ${r.description}`);
            console.log();
          }
        }
        break;
      }

      case "read": {
        const uri = args[2];
        if (!uri) {
          console.error("Usage: mcpwire <url> read <resource-uri>");
          process.exit(1);
        }
        const contents = await server.readResource(uri);
        for (const c of contents) {
          if (c.text) console.log(c.text);
          else console.log(JSON.stringify(c, null, 2));
        }
        break;
      }

      case "prompts": {
        const prompts = await server.prompts();
        if (prompts.length === 0) {
          console.log("No prompts available.");
        } else {
          console.log(`${prompts.length} prompt(s):\n`);
          for (const p of prompts) {
            console.log(`  ${p.name}`);
            if (p.description) console.log(`    ${p.description}`);
            console.log();
          }
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        console.error("Available commands: tools, call, resources, read, prompts");
        process.exit(1);
    }
  } finally {
    await server.close();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
