import { describe, it, expect } from "vitest";
import { MCPServer, connect, connectStdio } from "./client.js";

describe("MCPServer", () => {
  it("should export MCPServer class", () => {
    expect(MCPServer).toBeDefined();
    expect(typeof MCPServer).toBe("function");
  });

  it("should have all expected methods", () => {
    const proto = MCPServer.prototype;
    expect(typeof proto.tools).toBe("function");
    expect(typeof proto.resources).toBe("function");
    expect(typeof proto.prompts).toBe("function");
    expect(typeof proto.callTool).toBe("function");
    expect(typeof proto.readResource).toBe("function");
    expect(typeof proto.getPrompt).toBe("function");
    expect(typeof proto.toolsForOpenAI).toBe("function");
    expect(typeof proto.toolsForAnthropic).toBe("function");
    expect(typeof proto.toolsForGemini).toBe("function");
    expect(typeof proto.toolsForVercelAI).toBe("function");
    expect(typeof proto.close).toBe("function");
  });
});

describe("connect", () => {
  it("should export connect function", () => {
    expect(connect).toBeDefined();
    expect(typeof connect).toBe("function");
  });

  it("should reject invalid URLs", async () => {
    await expect(connect("not-a-url")).rejects.toThrow();
  });
});

describe("connectStdio", () => {
  it("should export connectStdio function", () => {
    expect(connectStdio).toBeDefined();
    expect(typeof connectStdio).toBe("function");
  });
});
