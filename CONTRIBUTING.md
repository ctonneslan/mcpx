# Contributing to mcpwire

Thanks for wanting to contribute! Here's how to get started.

## Setup

```bash
git clone https://github.com/ctonneslan/mcpwire.git
cd mcpwire
npm install
npm run build
```

## Development

```bash
npm run dev    # Watch mode
npm run build  # Production build
```

## What We Need Help With

- **More transport support** (WebSocket, custom transports)
- **Connection pooling** for multi-server setups
- **Better error messages** with recovery suggestions
- **Provider integrations** (Vercel AI SDK, LangChain, etc.)
- **CLI tool** for testing MCP servers from the terminal
- **Documentation** and examples

## Pull Requests

1. Fork the repo
2. Create a branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run `npm run build` to verify
5. Commit with a descriptive message
6. Open a PR

## Code Style

- TypeScript strict mode
- No `any` types
- JSDoc on all public methods
- Keep it simple. If a feature needs more than 50 lines, it might be too complex.

## Questions?

Open an issue or start a discussion. We're friendly.
