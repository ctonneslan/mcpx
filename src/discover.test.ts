import { describe, it, expect } from "vitest";
import { discover } from "./discover.js";

describe("discover", () => {
  it("should export discover function", () => {
    expect(discover).toBeDefined();
    expect(typeof discover).toBe("function");
  });

  it("should return an array", () => {
    const servers = discover();
    expect(Array.isArray(servers)).toBe(true);
  });

  it("should return ServerInfo objects with required fields", () => {
    const servers = discover();
    for (const server of servers) {
      expect(server).toHaveProperty("name");
      expect(server).toHaveProperty("transport");
      expect(["http", "sse", "stdio"]).toContain(server.transport);
    }
  });
});
