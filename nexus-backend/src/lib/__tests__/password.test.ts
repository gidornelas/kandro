import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../password.js";

describe("password service", () => {
  it("hashPassword returns a hashed string different from the input", async () => {
    const password = "my-secret-password";
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
  });

  it("verifyPassword returns true for the correct password", async () => {
    const password = "correct-password";
    const hash = await hashPassword(password);
    const result = await verifyPassword(password, hash);
    expect(result).toBe(true);
  });

  it("verifyPassword returns false for an incorrect password", async () => {
    const password = "real-password";
    const wrong = "wrong-password";
    const hash = await hashPassword(password);
    const result = await verifyPassword(wrong, hash);
    expect(result).toBe(false);
  });
});
