# mcpwire

**The simplest way to connect to MCP servers.** Two lines to connect. One line to call tools.

```typescript
import { connect } from "mcpwire";

const server = await connect("http://localhost:3000/mcp");
const result = await server.callTool("search", { query: "hello" });
```

No transport configuration. No protocol negotiation. No boilerplate. Just connect and go.

## Why?

The official MCP SDK is powerful but verbose. Connecting to a server takes 30+ lines of setup code. mcpx wraps it in a clean, ergonomic API so you can focus on building, not configuring.

| | mcpx | Official SDK |
|---|------|-------------|
| Lines to connect | 2 | 15-30+ |
| Auto transport detection | Yes | Manual |
| OpenAI/Anthropic tool format | Built-in | DIY |
| Server discovery | Built-in | None |
| Learning curve | 3 methods | 20+ classes |

## Install

```bash
npm install mcpwire
```

## Quick Start

### Connect over HTTP

```typescript
import { connect } from "mcpwire";

const server = await connect("http://localhost:3000/mcp");

// List tools
const tools = await server.tools();
console.log(tools);

// Call a tool
const result = await server.callTool("get_weather", { city: "NYC" });
console.log(result.content[0].text);

// Read a resource
const docs = await server.readResource("file:///README.md");
console.log(docs[0].text);

// Clean up
await server.close();
```

### Connect over stdio (local process)

```typescript
import { connectStdio } from "mcpwire";

const server = await connectStdio("npx", [
  "-y",
  "@modelcontextprotocol/server-filesystem",
  "/home/user/documents",
]);

const files = await server.resources();
console.log(files);
```

### Use with OpenAI

```typescript
import { connect } from "mcpwire";
import OpenAI from "openai";

const server = await connect("http://localhost:3000/mcp");
const openai = new OpenAI();

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "What's the weather in NYC?" }],
  tools: await server.toolsForOpenAI(),
});

// Execute tool calls
for (const call of response.choices[0].message.tool_calls || []) {
  const result = await server.callTool(
    call.function.name,
    JSON.parse(call.function.arguments)
  );
  console.log(result);
}
```

### Use with Anthropic

```typescript
import { connect } from "mcpwire";
import Anthropic from "@anthropic-ai/sdk";

const server = await connect("http://localhost:3000/mcp");
const anthropic = new Anthropic();

const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [{ role: "user", content: "What's the weather in NYC?" }],
  tools: await server.toolsForAnthropic(),
});
```

### Discover configured servers

```typescript
import { discover } from "mcpwire";

// Find servers configured in Claude Desktop, Cursor, etc.
const servers = discover();
for (const info of servers) {
  console.log(`${info.name}: ${info.url || info.command}`);
}
```

## API

### `connect(url, options?) -> MCPServer`

Connect to an MCP server over HTTP. Auto-detects Streamable HTTP vs SSE transport.

### `connectStdio(command, args?, options?) -> MCPServer`

Connect to a local MCP server process over stdio.

### `discover() -> ServerInfo[]`

Find MCP servers configured on your machine (Claude Desktop, Cursor, etc.).

### `MCPServer`

| Method | Returns | Description |
|--------|---------|-------------|
| `tools()` | `Tool[]` | List available tools |
| `callTool(name, args)` | `ToolResult` | Call a tool |
| `resources()` | `Resource[]` | List available resources |
| `readResource(uri)` | `ResourceContent[]` | Read a resource |
| `prompts()` | `Prompt[]` | List available prompts |
| `getPrompt(name, args)` | `PromptMessage[]` | Get a prompt |
| `toolsForOpenAI()` | OpenAI tool format | Tools formatted for OpenAI API |
| `toolsForAnthropic()` | Anthropic tool format | Tools formatted for Anthropic API |
| `close()` | void | Disconnect |

## Transports

mcpx automatically handles transport selection:

1. **Streamable HTTP** (default) - Recommended for remote servers
2. **SSE** (fallback) - Legacy HTTP+SSE transport
3. **stdio** - For local process-spawned servers

```typescript
// Force a specific transport
const server = await connect(url, { transport: "sse" });
```

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

```bash
git clone https://github.com/ctonneslan/mcpwire.git
cd mcpx
npm install
npm run build
```

## License

MIT
