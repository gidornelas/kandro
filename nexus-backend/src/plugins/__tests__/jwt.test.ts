import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";

const SECRET = "test-secret-that-is-at-least-32-characters-long!!";

describe("JWT sign & verify", () => {
  const payload = { sub: "user-123", email: "test@example.com", name: "Test" };

  it("signs and verifies a valid token", () => {
    const token = jwt.sign(payload, SECRET, { expiresIn: "15m" });
    const decoded = jwt.verify(token, SECRET);
    expect(decoded).toMatchObject({
      sub: "user-123",
      email: "test@example.com",
      name: "Test",
    });
  });

  it("rejects a token signed with a different secret", () => {
    const token = jwt.sign(payload, SECRET, { expiresIn: "15m" });
    expect(() => jwt.verify(token, "wrong-secret-that-is-32-characters-lon")).toThrow();
  });

  it("rejects a tampered token", () => {
    const token = jwt.sign(payload, SECRET, { expiresIn: "15m" });
    const parts = token.split(".");
    const tampered = [parts[0], parts[1], "invalidsignature"].join(".");
    expect(() => jwt.verify(tampered, SECRET)).toThrow();
  });
});
