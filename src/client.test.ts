import { describe, it, expect } from "vitest";
import { MCPServer } from "./client.js";

describe("MCPServer", () => {
  it("should export MCPServer class", () => {
    expect(MCPServer).toBeDefined();
    expect(typeof MCPServer).toBe("function");
  });
});

describe("connect", () => {
  it("should export connect function", async () => {
    const { connect } = await import("./client.js");
    expect(connect).toBeDefined();
    expect(typeof connect).toBe("function");
  });
});

describe("connectStdio", () => {
  it("should export connectStdio function", async () => {
    const { connectStdio } = await import("./client.js");
    expect(connectStdio).toBeDefined();
    expect(typeof connectStdio).toBe("function");
  });
});
